package com.edutech.fooddeliverysystem.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpVerifyDto {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "OTP code is required")
    private String otp;

    // Constructor
    public OtpVerifyDto() {}

    public OtpVerifyDto(String phone, String otp) {
        this.phone = phone;
        this.otp = otp;
    }

    // Getters and Setters
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}