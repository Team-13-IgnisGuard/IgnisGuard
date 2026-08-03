package com.lpg.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AuthResponseDto {
    private String token;
    private String email;
    private String role;
    private String userId;
    
    @JsonProperty("isSuccess")
    private boolean isSuccess;
    
    private List<String> errors;

    // Default Constructor
    public AuthResponseDto() {}

    // Convenience constructor for errors
    public AuthResponseDto(boolean isSuccess, List<String> errors) {
        this.isSuccess = isSuccess;
        this.errors = errors;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    @JsonProperty("isSuccess")
    public boolean isSuccess() { return isSuccess; }
    
    @JsonProperty("isSuccess")
    public void setSuccess(boolean success) { isSuccess = success; }

    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
}
