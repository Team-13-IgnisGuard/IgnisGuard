package com.lpg.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class MockPaymentDto {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "CARD|DEBIT_CARD|UPI|NETBANKING|WALLET",
            message = "Payment method must be one of: CARD, DEBIT_CARD, UPI, NETBANKING, WALLET")
    private String paymentMethod;

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
