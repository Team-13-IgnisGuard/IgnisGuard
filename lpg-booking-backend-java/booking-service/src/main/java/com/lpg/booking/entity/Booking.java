package com.lpg.booking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "bookings")
public class Booking {

    @Id
    private Long id;

    private Long customerId;
    private Integer distributorId;
    private Integer deliveryAgentId;
    private LocalDateTime bookingDate;
    private LocalDateTime deliveryDate;
    private String status;
    private int cylinderCount;
    private BigDecimal totalAmount;
    private String razorpayOrderId;
    private String deliveryOtp;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Integer getDistributorId() { return distributorId; }
    public void setDistributorId(Integer distributorId) { this.distributorId = distributorId; }

    public Integer getDeliveryAgentId() { return deliveryAgentId; }
    public void setDeliveryAgentId(Integer deliveryAgentId) { this.deliveryAgentId = deliveryAgentId; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }

    public LocalDateTime getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDateTime deliveryDate) { this.deliveryDate = deliveryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getCylinderCount() { return cylinderCount; }
    public void setCylinderCount(int cylinderCount) { this.cylinderCount = cylinderCount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getDeliveryOtp() { return deliveryOtp; }
    public void setDeliveryOtp(String deliveryOtp) { this.deliveryOtp = deliveryOtp; }
}
