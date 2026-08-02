package com.lpg.distribution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CompleteDistributorProfileDto {

    @NotBlank(message = "Agency name is required")
    private String agencyName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be exactly 10 digits")
    private String contactNumber;

    @NotNull(message = "Inventory capacity is required")
    private Integer inventoryCapacity;

    @NotNull(message = "Current stock is required")
    private Integer currentStock;

    // Getters and Setters
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public Integer getInventoryCapacity() { return inventoryCapacity; }
    public void setInventoryCapacity(Integer inventoryCapacity) { this.inventoryCapacity = inventoryCapacity; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }
}
