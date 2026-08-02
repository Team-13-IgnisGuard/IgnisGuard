package com.lpg.booking.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "customer_profiles")
public class CustomerProfile {

    @Id
    private Long id;

    private String userId;
    private String address;
    private String city;
    private String state;
    private String pinCode;

    private String mobileNumber;

    @Indexed(unique = true)
    private String connectionNumber;

    private Integer preferredDistributorId;
    private String status = "Active";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPinCode() { return pinCode; }
    public void setPinCode(String pinCode) { this.pinCode = pinCode; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getConnectionNumber() { return connectionNumber; }
    public void setConnectionNumber(String connectionNumber) { this.connectionNumber = connectionNumber; }

    public Integer getPreferredDistributorId() { return preferredDistributorId; }
    public void setPreferredDistributorId(Integer preferredDistributorId) { this.preferredDistributorId = preferredDistributorId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
