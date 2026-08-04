package com.lpg.distribution.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "booking-service")
public interface BookingFeignClient {

    @GetMapping("/api/booking/internal/agent/{agentId}/active-count")
    long getActiveBookingCountByAgentId(@PathVariable("agentId") int agentId);

    @GetMapping("/api/booking/internal/distributor/{distributorId}/active-count")
    long getActiveBookingCountByDistributorId(@PathVariable("distributorId") int distributorId);

    @PutMapping("/api/booking/internal/bookings/{id}/mark-returned")
    void markBookingReturned(@PathVariable("id") Long bookingId);
}
