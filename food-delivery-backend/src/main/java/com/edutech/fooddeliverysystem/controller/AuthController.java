package com.edutech.fooddeliverysystem.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.jwt.JwtUtil;
import com.edutech.fooddeliverysystem.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        Optional<User> user = userService.login(email, password);

        if (user.isPresent()) {

            // ✅ SIMPLE TOKEN (NO ROLE FOR NOW)
            String token = jwtUtil.generateToken(email);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user.get());

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }
}