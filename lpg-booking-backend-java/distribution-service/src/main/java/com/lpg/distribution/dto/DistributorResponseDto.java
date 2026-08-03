package com.lpg.distribution.dto;

public class DistributorResponseDto {
    private Integer id;
    private String userId;
    private String agencyName;
    private String address;
    private String contactNumber;
    private int inventoryCapacity;
    private int currentStock;

    public DistributorResponseDto() {}

    public DistributorResponseDto(Integer id, String userId, String agencyName, String address, String contactNumber, int inventoryCapacity, int currentStock) {
        this.id = id;
        this.userId = userId;
        this.agencyName = agencyName;
        this.address = address;
        this.contactNumber = contactNumber;
        this.inventoryCapacity = inventoryCapacity;
        this.currentStock = currentStock;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public int getInventoryCapacity() { return inventoryCapacity; }
    public void setInventoryCapacity(int inventoryCapacity) { this.inventoryCapacity = inventoryCapacity; }

    public int getCurrentStock() { return currentStock; }
    public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }
}
