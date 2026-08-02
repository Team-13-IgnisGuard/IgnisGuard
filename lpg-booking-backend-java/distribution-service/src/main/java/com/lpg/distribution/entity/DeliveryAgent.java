package com.lpg.distribution.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery_agents")
public class DeliveryAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String phone;

    @Column(name = "vehicle_number", nullable = false, length = 30)
    private String vehicleNumber;

    @Column(name = "distributor_id", nullable = false)
    private int distributorId;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public int getDistributorId() { return distributorId; }
    public void setDistributorId(int distributorId) { this.distributorId = distributorId; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
