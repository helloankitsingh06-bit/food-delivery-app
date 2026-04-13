package com.edutech.fooddeliverysystem.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.jwt.JwtUtil;
import com.edutech.fooddeliverysystem.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password) {

        Optional<User> user = userService.login(email, password);

        if (user.isPresent()) {
            return jwtUtil.generateToken(email);
        }

        return "Invalid credentials";
    }
}