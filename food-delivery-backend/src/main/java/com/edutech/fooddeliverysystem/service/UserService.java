package com.edutech.fooddeliverysystem.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Map to store reset tokens
    private Map<String, String> resetTokens = new HashMap<>();

    // ================= REGISTER =================
    public User register(User user) {
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            return userRepository.save(user);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }

    // ================= LOGIN =================
    public Optional<User> login(String email, String password) {
        System.out.println("===== LOGIN DEBUG =====");
        System.out.println("Entered Email: " + email);
        System.out.println("Entered Password: " + password);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            System.out.println("User Found in DB");
            System.out.println("DB Email: " + user.getEmail());
            System.out.println("DB Password: " + user.getPassword());

            boolean match = passwordEncoder.matches(password, user.getPassword());
            System.out.println("Password Match: " + match);

            if (match) {
                return Optional.of(user);
            }
        } else {
            System.out.println("User NOT Found");
        }
        return Optional.empty();
    }

    // ================= PASSWORD RESET =================
    public void sendPasswordResetEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.out.println("Password reset requested for non-existent email: " + email);
            return;
        }
        String token = UUID.randomUUID().toString();
        resetTokens.put(token, email);
        System.out.println("\n=== PASSWORD RESET LINK (copy this) ===");
        System.out.println("http://localhost:4200/reset-password?token=" + token);
        System.out.println("========================================\n");
    }

    public void resetPassword(String token, String newPassword) {
        String email = resetTokens.get(token);
        if (email == null) {
            throw new RuntimeException("Invalid or expired token");
        }
        // ✅ FIXED: Use findByEmail, not findById
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        resetTokens.remove(token);
    }

    // ================= OTHER METHODS =================
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ================= DELIVERY PARTNER METHODS =================
    public User findNearestDeliveryPartner(Double restaurantLat, Double restaurantLng) {
        List<User> deliveryPartners = userRepository.findByRole(User.Role.DELIVERY);
        
        if (deliveryPartners.isEmpty()) {
            return null;
        }
        
        User nearest = null;
        double minDistance = Double.MAX_VALUE;
        
        for (User partner : deliveryPartners) {
            if (partner.getLatitude() != null && partner.getLongitude() != null) {
                double distance = calculateDistance(
                    restaurantLat, restaurantLng,
                    partner.getLatitude(), partner.getLongitude()
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = partner;
                }
            }
        }
        
        return nearest;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}