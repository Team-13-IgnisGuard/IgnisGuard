package com.lpg.distribution.dto;

public class DeliveryScanVerifyRequestDto {
    private String qrToken;
    private String enteredSerialNumber;
    private Long bookingId;
    private String agentUserId;

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public String getEnteredSerialNumber() { return enteredSerialNumber; }
    public void setEnteredSerialNumber(String enteredSerialNumber) { this.enteredSerialNumber = enteredSerialNumber; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getAgentUserId() { return agentUserId; }
    public void setAgentUserId(String agentUserId) { this.agentUserId = agentUserId; }
}
