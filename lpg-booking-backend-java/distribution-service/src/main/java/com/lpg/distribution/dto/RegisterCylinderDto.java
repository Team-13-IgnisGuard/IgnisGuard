package com.lpg.distribution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterCylinderDto {

    @NotBlank(message = "Engraved serial number is required")
    @Size(min = 5, max = 50, message = "Engraved serial number must be between 5 and 50 characters")
    private String engravedSerialNumber;

    public String getEngravedSerialNumber() { return engravedSerialNumber; }
    public void setEngravedSerialNumber(String engravedSerialNumber) { this.engravedSerialNumber = engravedSerialNumber; }
}
