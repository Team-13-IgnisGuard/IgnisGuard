package com.lpg.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateBookingDto {

    @NotNull(message = "Cylinder count is required")
    @Min(value = 1, message = "Cylinder count must be at least 1")
    private Integer cylinderCount;

    public Integer getCylinderCount() { return cylinderCount; }
    public void setCylinderCount(Integer cylinderCount) { this.cylinderCount = cylinderCount; }
}
