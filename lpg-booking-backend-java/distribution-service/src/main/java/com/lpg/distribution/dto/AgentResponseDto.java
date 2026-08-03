package com.lpg.distribution.dto;

public class AgentResponseDto {
    private Integer id;
    private String name;
    private String phone;
    private String vehicleNumber;
    private boolean isAvailable;

    public AgentResponseDto() {}

    public AgentResponseDto(Integer id, String name, String phone, String vehicleNumber, boolean isAvailable) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.vehicleNumber = vehicleNumber;
        this.isAvailable = isAvailable;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
