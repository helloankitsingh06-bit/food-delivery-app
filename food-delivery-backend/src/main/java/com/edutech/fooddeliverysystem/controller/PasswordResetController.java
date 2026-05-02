package com.edutech.fooddeliverysystem.controller;

import com.edutech.fooddeliverysystem.dto.ForgotPasswordRequest;
import com.edutech.fooddeliverysystem.dto.ResetPasswordRequest;
import com.edutech.fooddeliverysystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class PasswordResetController {

    @Autowired
    private UserService userService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.sendPasswordResetEmail(request.getEmail());
        return ResponseEntity.ok("Reset link sent to email (check server console)");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully");
    }
}