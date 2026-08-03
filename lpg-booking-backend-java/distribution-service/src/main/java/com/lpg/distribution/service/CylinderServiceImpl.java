package com.lpg.distribution.service;

import com.lpg.distribution.client.BookingFeignClient;
import com.lpg.distribution.dto.*;
import com.lpg.distribution.entity.Cylinder;
import com.lpg.distribution.entity.CylinderEvent;
import com.lpg.distribution.entity.Distributor;
import com.lpg.distribution.repository.CylinderEventRepository;
import com.lpg.distribution.repository.CylinderRepository;
import com.lpg.distribution.repository.DistributorRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CylinderServiceImpl implements CylinderService {

    private final CylinderRepository cylinderRepository;
    private final CylinderEventRepository cylinderEventRepository;
    private final DistributorRepository distributorRepository;
    private final BookingFeignClient bookingFeignClient;

    @Value("${cylinder.qr-secret}")
    private String qrSecret;

    @Value("${cylinder.scan-cooldown-minutes:5}")
    private int scanCooldownMinutes;

    public CylinderServiceImpl(CylinderRepository cylinderRepository, CylinderEventRepository cylinderEventRepository,
                                DistributorRepository distributorRepository, BookingFeignClient bookingFeignClient) {
        this.cylinderRepository = cylinderRepository;
        this.cylinderEventRepository = cylinderEventRepository;
        this.distributorRepository = distributorRepository;
        this.bookingFeignClient = bookingFeignClient;
    }

    // ---- Lifecycle state machine: currentStatus -> { eventType -> nextStatus } ----
    private static final Map<String, Map<String, String>> TRANSITIONS = new HashMap<>();
    static {
        TRANSITIONS.put("AT_FILLING_PLANT", Map.of(
                "DISPATCH_TO_WAREHOUSE", "AT_WAREHOUSE"
        ));
        TRANSITIONS.put("AT_WAREHOUSE", Map.of(
                "DISPATCH_TO_DISTRIBUTOR", "WITH_DISTRIBUTOR"
        ));
        TRANSITIONS.put("WITH_DISTRIBUTOR", Map.of(
                "HANDOVER_TO_AGENT", "WITH_DELIVERY_AGENT"
        ));
        TRANSITIONS.put("WITH_DELIVERY_AGENT", Map.of(
                "DELIVER_TO_CUSTOMER", "WITH_CUSTOMER",
                "RETURN_TO_DISTRIBUTOR", "WITH_DISTRIBUTOR"
        ));
        TRANSITIONS.put("WITH_CUSTOMER", Map.of(
                "PICKUP_FOR_REFILL", "RETURNED_FOR_REFILL"
        ));
        TRANSITIONS.put("RETURNED_FOR_REFILL", Map.of(
                "RECEIVE_AT_FILLING_PLANT", "AT_FILLING_PLANT"
        ));
    }

    @Override
    public CylinderResponseDto registerCylinder(RegisterCylinderDto dto) {
        String serial = dto.getEngravedSerialNumber().trim();
        if (cylinderRepository.existsByEngravedSerialNumber(serial)) {
            throw new IllegalArgumentException("A cylinder with this engraved serial number is already registered.");
        }
        Cylinder cylinder = new Cylinder();
        cylinder.setEngravedSerialNumber(serial);
        cylinder.setStatus("AT_FILLING_PLANT");
        // QR token is generated once here and never regenerated for this cylinder's lifetime.
        cylinder.setQrToken(generateSignedQrToken(serial));
        cylinder.setLastScanAt(LocalDateTime.now());
        Cylinder saved = cylinderRepository.save(cylinder);
        return toDto(saved);
    }

    @Override
    public CylinderResponseDto scanCylinder(CylinderScanRequestDto dto, String userId, String role) {
        Cylinder cylinder = resolveAndValidateQr(dto.getQrToken());

        // Cross-check the physical engraved serial against the QR-linked serial, if provided.
        if (dto.getEnteredSerialNumber() != null && !dto.getEnteredSerialNumber().isBlank()
                && !dto.getEnteredSerialNumber().trim().equalsIgnoreCase(cylinder.getEngravedSerialNumber())) {
            logSuspicious(cylinder, dto.getEventType(), userId, role, dto.getBookingId(), "SERIAL_MISMATCH");
            throw new IllegalArgumentException(
                    "Entered serial number does not match the serial linked to this QR code. " +
                    "This may indicate the QR sticker was moved to a different cylinder. Flagged for review.");
        }

        Map<String, String> allowedFromCurrent = TRANSITIONS.getOrDefault(cylinder.getStatus(), Map.of());
        String nextStatus = allowedFromCurrent.get(dto.getEventType());
        if (nextStatus == null) {
            logSuspicious(cylinder, dto.getEventType(), userId, role, dto.getBookingId(), "INVALID_TRANSITION");
            throw new IllegalStateException(
                    "Impossible transition: cylinder is currently '" + cylinder.getStatus() +
                    "' and cannot go directly to the requested step ('" + dto.getEventType() +
                    "'). Flagged for review.");
        }

        // Duplicate/replay scan guard: same eventType scanned again within the cooldown window.
        cylinderEventRepository.findFirstByCylinderIdAndEventTypeOrderByTimestampDesc(cylinder.getId(), dto.getEventType())
                .ifPresent(lastSameEvent -> {
                    if (lastSameEvent.getTimestamp().isAfter(LocalDateTime.now().minusMinutes(scanCooldownMinutes))) {
                        logSuspicious(cylinder, dto.getEventType(), userId, role, dto.getBookingId(), "DUPLICATE_SCAN");
                        throw new IllegalStateException(
                                "This cylinder was already scanned for '" + dto.getEventType() +
                                "' within the last " + scanCooldownMinutes + " minutes. Flagged as a possible duplicate/replay scan.");
                    }
                });

        // Delivery-specific enforcement: cylinder must be delivered against the booking it was allocated to.
        if ("DELIVER_TO_CUSTOMER".equals(dto.getEventType())) {
            if (dto.getBookingId() == null) {
                throw new IllegalArgumentException("Booking ID is required to confirm delivery.");
            }
            if (cylinder.getAssignedBookingId() != null && !cylinder.getAssignedBookingId().equals(dto.getBookingId())) {
                logSuspicious(cylinder, dto.getEventType(), userId, role, dto.getBookingId(), "BOOKING_MISMATCH");
                throw new IllegalStateException(
                        "This cylinder was allocated to a different booking (#" + cylinder.getAssignedBookingId() +
                        "). It cannot be delivered against booking #" + dto.getBookingId() + ". Flagged for review.");
            }
        }
        if ("HANDOVER_TO_AGENT".equals(dto.getEventType()) && dto.getBookingId() != null) {
            cylinder.setAssignedBookingId(dto.getBookingId());
        }
        // Deliberately NOT cleared on DELIVER_TO_CUSTOMER — the booking link
        // needs to survive through the WITH_CUSTOMER period so that, when this
        // same cylinder is later collected for refill, we still know which
        // booking to update. It's cleared below, on PICKUP_FOR_REFILL, after
        // that notification has been sent.
        if ("PICKUP_FOR_REFILL".equals(dto.getEventType())) {
            Long returnedBookingId = cylinder.getAssignedBookingId();
            if (returnedBookingId != null) {
                try {
                    bookingFeignClient.markBookingReturned(returnedBookingId);
                } catch (Exception e) {
                    // Don't let a booking-service hiccup block the physical
                    // refill-pickup scan — the cylinder's own tracking record
                    // (this event) remains the source of truth regardless.
                    logSuspicious(cylinder, dto.getEventType(), userId, role, returnedBookingId, "BOOKING_STATUS_SYNC_FAILED");
                }
            }
            cylinder.setAssignedBookingId(null);
        }

        // Stamp which distributor's chain of custody this cylinder belongs to,
        // so that distributor retains visibility into it even after it leaves
        // their agency (handed to an agent, delivered to a customer). Cleared
        // on return to the filling plant since the next refill cycle may route
        // it to a different distributor.
        if ("DISPATCH_TO_DISTRIBUTOR".equals(dto.getEventType())) {
            distributorRepository.findByUserId(userId).ifPresent(d -> cylinder.setDistributorId(d.getId()));
        }
        if ("RECEIVE_AT_FILLING_PLANT".equals(dto.getEventType())) {
            cylinder.setDistributorId(null);
        }

        String fromStatus = cylinder.getStatus();
        cylinder.setStatus(nextStatus);
        cylinder.setLastScanAt(LocalDateTime.now());
        cylinderRepository.save(cylinder);

        persistEvent(cylinder, dto.getEventType(), fromStatus, nextStatus, userId, role, dto.getBookingId(), false, null);

        return toDto(cylinder);
    }

    @Override
    public DeliveryScanVerifyResponseDto verifyDeliveryScan(DeliveryScanVerifyRequestDto dto) {
        try {
            CylinderScanRequestDto scanDto = new CylinderScanRequestDto();
            scanDto.setQrToken(dto.getQrToken());
            scanDto.setEnteredSerialNumber(dto.getEnteredSerialNumber());
            scanDto.setBookingId(dto.getBookingId());
            scanDto.setEventType("DELIVER_TO_CUSTOMER");

            CylinderResponseDto result = scanCylinder(scanDto, dto.getAgentUserId(), "DeliveryAgent");
            return new DeliveryScanVerifyResponseDto(true, "Cylinder verified and delivery scan logged.", result.getId());
        } catch (IllegalArgumentException | IllegalStateException | NoSuchElementException ex) {
            return new DeliveryScanVerifyResponseDto(false, ex.getMessage(), null);
        }
    }

    @Override
    public CylinderResponseDto getCylinder(Integer id) {
        return toDto(cylinderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Cylinder not found.")));
    }

    @Override
    public List<CylinderResponseDto> getAllCylinders() {
        return cylinderRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<CylinderResponseDto> getCylindersForDistributor(String userId) {
        Distributor distributor = distributorRepository.findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Distributor profile not found."));
        return cylinderRepository.findByDistributorId(distributor.getId()).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<CylinderEventResponseDto> getHistory(Integer cylinderId) {
        return cylinderEventRepository.findByCylinderIdOrderByTimestampDesc(cylinderId)
                .stream().map(this::toEventDto).collect(Collectors.toList());
    }

    @Override
    public List<CylinderEventResponseDto> getFlaggedEvents() {
        return cylinderEventRepository.findBySuspiciousTrueOrderByTimestampDesc()
                .stream().map(this::toEventDto).collect(Collectors.toList());
    }

    // ---- Helpers ----

    private Cylinder resolveAndValidateQr(String qrToken) {
        Cylinder cylinder = cylinderRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new IllegalArgumentException(
                        "This QR code is not recognized. It may be fake, corrupted, or not registered in the system."));

        // Re-verify the signature server-side (defends against a hand-crafted/forged token
        // even if it happened to match a stored value, and catches tampering of the token itself).
        String expectedToken = generateSignedQrToken(cylinder.getEngravedSerialNumber(), extractIssuedAt(qrToken));
        if (!MessageDigest.isEqual(expectedToken.getBytes(StandardCharsets.UTF_8), qrToken.getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("QR signature verification failed. This QR code may have been tampered with.");
        }
        return cylinder;
    }

    private void logSuspicious(Cylinder cylinder, String eventType, String userId, String role, Long bookingId, String reason) {
        persistEvent(cylinder, eventType, cylinder.getStatus(), cylinder.getStatus(), userId, role, bookingId, true, reason);
    }

    private void persistEvent(Cylinder cylinder, String eventType, String fromStatus, String toStatus,
                               String userId, String role, Long bookingId, boolean suspicious, String flagReason) {
        CylinderEvent event = new CylinderEvent();
        event.setCylinderId(cylinder.getId());
        event.setEventType(eventType);
        event.setFromStatus(fromStatus);
        event.setToStatus(toStatus);
        event.setScannedByUserId(userId);
        event.setScannedByRole(role);
        event.setBookingId(bookingId);
        event.setSuspicious(suspicious);
        event.setFlagReason(flagReason);
        cylinderEventRepository.save(event);
    }

    private String generateSignedQrToken(String serialNumber) {
        return generateSignedQrToken(serialNumber, System.currentTimeMillis());
    }

    private String generateSignedQrToken(String serialNumber, long issuedAt) {
        try {
            String payload = serialNumber + "|" + issuedAt;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(qrSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] signatureBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String signatureHex = bytesToHex(signatureBytes);
            String raw = payload + "|" + signatureHex;
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate QR token: " + e.getMessage());
        }
    }

    private long extractIssuedAt(String qrToken) {
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(qrToken), StandardCharsets.UTF_8);
            String[] parts = decoded.split("\\|");
            return Long.parseLong(parts[1]);
        } catch (Exception e) {
            throw new IllegalArgumentException("Malformed QR code.");
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    private CylinderResponseDto toDto(Cylinder c) {
        return new CylinderResponseDto(c.getId(), c.getEngravedSerialNumber(), c.getQrToken(), c.getStatus(),
                c.getCurrentHolderId(), c.getDistributorId(), c.getAssignedBookingId(), c.getLastScanAt(), c.getCreatedAt());
    }

    private CylinderEventResponseDto toEventDto(CylinderEvent e) {
        return new CylinderEventResponseDto(e.getId(), e.getCylinderId(), e.getEventType(), e.getFromStatus(), e.getToStatus(),
                e.getScannedByUserId(), e.getScannedByRole(), e.getBookingId(), e.isSuspicious(), e.getFlagReason(), e.getTimestamp());
    }
}
