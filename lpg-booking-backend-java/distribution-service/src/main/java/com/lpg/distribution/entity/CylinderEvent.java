package com.lpg.distribution.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cylinder_events")
public class CylinderEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cylinder_id", nullable = false)
    private Integer cylinderId;

    // e.g. DISPATCH_TO_WAREHOUSE, DISPATCH_TO_DISTRIBUTOR, HANDOVER_TO_AGENT,
    // DELIVER_TO_CUSTOMER, RETURN_TO_DISTRIBUTOR, PICKUP_FOR_REFILL, RECEIVE_AT_FILLING_PLANT
    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;

    @Column(name = "from_status", length = 30)
    private String fromStatus;

    @Column(name = "to_status", length = 30)
    private String toStatus;

    @Column(name = "scanned_by_user_id", length = 50)
    private String scannedByUserId;

    @Column(name = "scanned_by_role", length = 30)
    private String scannedByRole;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "suspicious", nullable = false)
    private boolean suspicious = false;

    // INVALID_TRANSITION, SERIAL_MISMATCH, DUPLICATE_SCAN, BOOKING_MISMATCH, INVALID_QR
    @Column(name = "flag_reason", length = 40)
    private String flagReason;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCylinderId() { return cylinderId; }
    public void setCylinderId(Integer cylinderId) { this.cylinderId = cylinderId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }

    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }

    public String getScannedByUserId() { return scannedByUserId; }
    public void setScannedByUserId(String scannedByUserId) { this.scannedByUserId = scannedByUserId; }

    public String getScannedByRole() { return scannedByRole; }
    public void setScannedByRole(String scannedByRole) { this.scannedByRole = scannedByRole; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public boolean isSuspicious() { return suspicious; }
    public void setSuspicious(boolean suspicious) { this.suspicious = suspicious; }

    public String getFlagReason() { return flagReason; }
    public void setFlagReason(String flagReason) { this.flagReason = flagReason; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
