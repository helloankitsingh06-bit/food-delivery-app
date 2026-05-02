package com.edutech.fooddeliverysystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ UPDATE USER PROFILE (name, email, phone)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        // Do not update password here (separate flow)
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // ✅ GET user by id - return only necessary fields (including phone)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        
        // Build response with only needed fields (no password hash)
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("role", user.getRole());
        response.put("username", user.getUsername());
        response.put("phone", user.getPhone());   // ✅ Include phone number
        
        return ResponseEntity.ok(response);
    }

    // ✅ CHANGE PASSWORD
    @PutMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Long id,
                                            @RequestBody Map<String, String> passwordData) {
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();

        // verify current password (assuming passwords are hashed with BCrypt)
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }
}