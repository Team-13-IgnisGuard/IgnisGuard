package com.lpg.distribution.dto;

import java.time.LocalDateTime;

public class CylinderEventResponseDto {
    private Long id;
    private Integer cylinderId;
    private String eventType;
    private String fromStatus;
    private String toStatus;
    private String scannedByUserId;
    private String scannedByRole;
    private Long bookingId;
    private boolean suspicious;
    private String flagReason;
    private LocalDateTime timestamp;

    public CylinderEventResponseDto() {}

    public CylinderEventResponseDto(Long id, Integer cylinderId, String eventType, String fromStatus, String toStatus,
                                     String scannedByUserId, String scannedByRole, Long bookingId,
                                     boolean suspicious, String flagReason, LocalDateTime timestamp) {
        this.id = id;
        this.cylinderId = cylinderId;
        this.eventType = eventType;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.scannedByUserId = scannedByUserId;
        this.scannedByRole = scannedByRole;
        this.bookingId = bookingId;
        this.suspicious = suspicious;
        this.flagReason = flagReason;
        this.timestamp = timestamp;
    }

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
