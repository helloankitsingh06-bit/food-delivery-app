package com.edutech.fooddeliverysystem.service;

import com.edutech.fooddeliverysystem.entity.OtpCode;
import com.edutech.fooddeliverysystem.repository.OtpCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @Autowired
    private SmsService smsService;

    private static final SecureRandom random = new SecureRandom();
    private static final int OTP_EXPIRY_MINUTES = 5;

    @Transactional
    public void generateAndSendOtp(String phone) {
        // Delete old OTPs for this phone
        otpCodeRepository.deleteByPhone(phone);

        String otp = String.format("%06d", random.nextInt(1000000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        OtpCode otpCode = new OtpCode();
        otpCode.setPhone(phone);
        otpCode.setCode(otp);
        otpCode.setExpiresAt(expiresAt);
        otpCode.setCreatedAt(LocalDateTime.now());
        otpCodeRepository.save(otpCode);

        smsService.sendOtp(phone, otp);
    }

    @Transactional
    public boolean verifyOtp(String phone, String otp) {
        return otpCodeRepository.findByPhoneAndCode(phone, otp)
                .filter(code -> code.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(code -> {
                    otpCodeRepository.deleteByPhone(phone);
                    return true;
                })
                .orElse(false);
    }
}