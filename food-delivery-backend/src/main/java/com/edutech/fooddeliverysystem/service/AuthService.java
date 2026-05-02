package com.edutech.fooddeliverysystem.service;

import com.edutech.fooddeliverysystem.dto.RegisterDto;
import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final Map<String, String> verifiedPhoneTokens = new HashMap<>();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Development flag – set to true to skip phone verification
    private boolean skipPhoneVerification = true;   // Change to false in production

    public String createTempTokenForVerifiedPhone(String phone) {
        String token = java.util.UUID.randomUUID().toString();
        verifiedPhoneTokens.put(token, phone);
        return token;
    }

    public String getPhoneFromTempToken(String token) {
        return verifiedPhoneTokens.get(token);
    }

    @Transactional
    public User registerUser(RegisterDto dto) {
        String phone;
        if (skipPhoneVerification) {
            // For delivery role, allow missing phone (assign dummy)
            if (dto.getRole() == User.Role.DELIVERY && (dto.getPhone() == null || dto.getPhone().isEmpty())) {
                phone = "DELIVERY_" + System.currentTimeMillis(); // dummy unique phone
                System.out.println("⚠️ Delivery partner registered without phone. Assigned dummy: " + phone);
            } else if (dto.getPhone() == null || dto.getPhone().isEmpty()) {
                throw new RuntimeException("Phone number is required for registration (dev mode)");
            } else {
                phone = dto.getPhone();
            }
        } else {
            phone = getPhoneFromTempToken(dto.getTempToken());
            if (phone == null) {
                throw new RuntimeException("Invalid or expired temporary token – please verify your phone first");
            }
        }

        // Check if phone already exists (skip for dummy)
        if (!phone.startsWith("DELIVERY_") && userRepository.existsByPhone(phone)) {
            throw new RuntimeException("Phone number already registered");
        }

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setPhone(phone);
        user.setPhoneVerifiedAt(skipPhoneVerification ? LocalDateTime.now() : LocalDateTime.now());
        user.setUsername(dto.getUsername());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());

        // ✅ For delivery partners, set default location (e.g., restaurant area)
        if (dto.getRole() == User.Role.DELIVERY) {
            // You can change these coordinates to your test city
            user.setLatitude(12.9716);  // Bengaluru
            user.setLongitude(77.5946);
        }

        if (!skipPhoneVerification) {
            verifiedPhoneTokens.remove(dto.getTempToken());
        }

        return userRepository.save(user);
    }
}