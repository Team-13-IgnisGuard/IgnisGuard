package com.lpg.distribution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CylinderScanRequestDto {

    @NotBlank(message = "QR token is required")
    private String qrToken;

    @NotBlank(message = "Event type is required")
    @Pattern(
        regexp = "DISPATCH_TO_WAREHOUSE|DISPATCH_TO_DISTRIBUTOR|HANDOVER_TO_AGENT|DELIVER_TO_CUSTOMER|" +
                 "RETURN_TO_DISTRIBUTOR|PICKUP_FOR_REFILL|RECEIVE_AT_FILLING_PLANT",
        message = "Unrecognized event type."
    )
    private String eventType;

    // Optional: staff manually keys in / scans the physical engraved serial
    // alongside the QR, to cross-check a peeled/reattached QR sticker.
    private String enteredSerialNumber;

    // Required for HANDOVER_TO_AGENT (to assign) and DELIVER_TO_CUSTOMER (to verify).
    private Long bookingId;

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEnteredSerialNumber() { return enteredSerialNumber; }
    public void setEnteredSerialNumber(String enteredSerialNumber) { this.enteredSerialNumber = enteredSerialNumber; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
}
