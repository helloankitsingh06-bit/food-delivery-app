package com.edutech.fooddeliverysystem.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.fooddeliverysystem.dto.OtpRequestDto;
import com.edutech.fooddeliverysystem.dto.OtpVerifyDto;
import com.edutech.fooddeliverysystem.dto.RegisterDto;
import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.jwt.JwtUtil;
import com.edutech.fooddeliverysystem.service.AuthService;
import com.edutech.fooddeliverysystem.service.OtpService;
import com.edutech.fooddeliverysystem.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // ========== OTP FLOW ==========
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody OtpRequestDto request) {
        otpService.generateAndSendOtp(request.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerifyDto request) {
        boolean isValid = otpService.verifyOtp(request.getPhone(), request.getOtp());
        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
        }
        String tempToken = authService.createTempTokenForVerifiedPhone(request.getPhone());
        return ResponseEntity.ok(Map.of("tempToken", tempToken));
    }

    // ========== REGISTER (with OTP verification) ==========
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto registerDto) {
        try {
            User user = authService.registerUser(registerDto);
            return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "userId", user.getId(),
                "role", user.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== LOGIN (existing) ==========
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> user = userService.login(email, password);
        Map<String, Object> response = new HashMap<>();

        if (user.isPresent()) {
            String token = jwtUtil.generateToken(email);
            response.put("token", token);
            response.put("user", user.get());
            return ResponseEntity.ok(response);
        }

        response.put("message", "Invalid credentials");
        return ResponseEntity.status(401).body(response);
    }
}