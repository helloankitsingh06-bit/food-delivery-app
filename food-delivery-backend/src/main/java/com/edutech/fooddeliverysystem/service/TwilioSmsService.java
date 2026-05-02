package com.edutech.fooddeliverysystem.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioSmsService implements SmsService {

    @Value("${twilio.account_sid}")
    private String accountSid;

    @Value("${twilio.auth_token}")
    private String authToken;

    @Value("${twilio.phone_number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void sendOtp(String phoneNumber, String otp) {
        String messageBody = "Your Food Delivery OTP is: " + otp + ". Valid for 5 minutes.";
        Message.creator(
            new PhoneNumber(phoneNumber),
            new PhoneNumber(fromPhoneNumber),
            messageBody
        ).create();
    }

    @Override
    public void sendSms(String phoneNumber, String message) {
        // ✅ New method for sending any SMS (order status, delivery updates, etc.)
        Message.creator(
            new PhoneNumber(phoneNumber),
            new PhoneNumber(fromPhoneNumber),
            message
        ).create();
    }
}