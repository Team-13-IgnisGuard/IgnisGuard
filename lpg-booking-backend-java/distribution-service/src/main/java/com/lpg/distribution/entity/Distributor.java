package com.lpg.distribution.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "distributors")
public class Distributor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "agency_name", nullable = false, length = 100)
    private String agencyName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_number", nullable = false, length = 10)
    private String contactNumber;

    @Column(name = "inventory_capacity", nullable = false)
    private int inventoryCapacity;

    @Column(name = "current_stock", nullable = false)
    private int currentStock;

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
