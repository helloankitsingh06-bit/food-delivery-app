package com.edutech.fooddeliverysystem.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpRequestDto {

    @NotBlank(message = "Phone number is required")
    private String phone;

    // Constructor
    public OtpRequestDto() {}

    public OtpRequestDto(String phone) {
        this.phone = phone;
    }

    // Getter and Setter
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}