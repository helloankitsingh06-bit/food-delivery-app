package com.edutech.fooddeliverysystem.service;

public interface SmsService {
    void sendOtp(String phoneNumber, String otp);
    void sendSms(String phoneNumber, String message);  // ✅ Added for order status updates
}