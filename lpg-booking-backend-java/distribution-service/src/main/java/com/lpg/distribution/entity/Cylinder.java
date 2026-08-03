package com.lpg.distribution.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cylinders")
public class Cylinder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Permanent, manufacturer-engraved serial number. Set once at registration, never changes.
    @Column(name = "engraved_serial_number", nullable = false, unique = true, length = 50)
    private String engravedSerialNumber;

    // Signed QR token, assigned once at registration and permanently linked to this cylinder.
    @Column(name = "qr_token", nullable = false, unique = true, length = 255)
    private String qrToken;

    // AT_FILLING_PLANT, AT_WAREHOUSE, WITH_DISTRIBUTOR, WITH_DELIVERY_AGENT, WITH_CUSTOMER, RETURNED_FOR_REFILL
    @Column(name = "status", nullable = false, length = 30)
    private String status;

    // Semantics depend on status: distributorId when WITH_DISTRIBUTOR, agentId when WITH_DELIVERY_AGENT, etc.
    @Column(name = "current_holder_id")
    private Integer currentHolderId;

    // Set when the cylinder is handed to a delivery agent for a specific booking;
    // cleared once delivered/returned. Used to catch a cylinder being delivered
    // against a booking it was never allocated to.
    @Column(name = "assigned_booking_id")
    private Long assignedBookingId;

    // Set once the cylinder is received by a distributor, and kept through
    // handover-to-agent and delivery-to-customer, so that distributor retains
    // visibility into "their" cylinders even after they've left the agency.
    // Cleared when the cylinder returns to AT_FILLING_PLANT — a fresh refill
    // cycle may route it to a different distributor next time.
    @Column(name = "distributor_id")
    private Integer distributorId;

    @Column(name = "last_scan_at")
    private LocalDateTime lastScanAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEngravedSerialNumber() { return engravedSerialNumber; }
    public void setEngravedSerialNumber(String engravedSerialNumber) { this.engravedSerialNumber = engravedSerialNumber; }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getCurrentHolderId() { return currentHolderId; }
    public void setCurrentHolderId(Integer currentHolderId) { this.currentHolderId = currentHolderId; }

    public Long getAssignedBookingId() { return assignedBookingId; }
    public void setAssignedBookingId(Long assignedBookingId) { this.assignedBookingId = assignedBookingId; }

    public Integer getDistributorId() { return distributorId; }
    public void setDistributorId(Integer distributorId) { this.distributorId = distributorId; }

    public LocalDateTime getLastScanAt() { return lastScanAt; }
    public void setLastScanAt(LocalDateTime lastScanAt) { this.lastScanAt = lastScanAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
