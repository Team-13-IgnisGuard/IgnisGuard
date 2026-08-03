package com.lpg.distribution.dto;

public class DeliveryScanVerifyResponseDto {
    private boolean valid;
    private String message;
    private Integer cylinderId;

    public DeliveryScanVerifyResponseDto() {}

    public DeliveryScanVerifyResponseDto(boolean valid, String message, Integer cylinderId) {
        this.valid = valid;
        this.message = message;
        this.cylinderId = cylinderId;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Integer getCylinderId() { return cylinderId; }
    public void setCylinderId(Integer cylinderId) { this.cylinderId = cylinderId; }
}
