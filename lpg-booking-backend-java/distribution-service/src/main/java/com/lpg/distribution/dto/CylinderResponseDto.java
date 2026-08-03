package com.lpg.distribution.dto;

import java.time.LocalDateTime;

public class CylinderResponseDto {
    private Integer id;
    private String engravedSerialNumber;
    private String qrToken;
    private String status;
    private Integer currentHolderId;
    private Integer distributorId;
    private Long assignedBookingId;
    private LocalDateTime lastScanAt;
    private LocalDateTime createdAt;

    public CylinderResponseDto() {}

    public CylinderResponseDto(Integer id, String engravedSerialNumber, String qrToken, String status,
                                Integer currentHolderId, Integer distributorId, Long assignedBookingId,
                                LocalDateTime lastScanAt, LocalDateTime createdAt) {
        this.id = id;
        this.engravedSerialNumber = engravedSerialNumber;
        this.qrToken = qrToken;
        this.status = status;
        this.currentHolderId = currentHolderId;
        this.distributorId = distributorId;
        this.assignedBookingId = assignedBookingId;
        this.lastScanAt = lastScanAt;
        this.createdAt = createdAt;
    }

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

    public Integer getDistributorId() { return distributorId; }
    public void setDistributorId(Integer distributorId) { this.distributorId = distributorId; }

    public Long getAssignedBookingId() { return assignedBookingId; }
    public void setAssignedBookingId(Long assignedBookingId) { this.assignedBookingId = assignedBookingId; }

    public LocalDateTime getLastScanAt() { return lastScanAt; }
    public void setLastScanAt(LocalDateTime lastScanAt) { this.lastScanAt = lastScanAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
