package com.edutech.fooddeliverysystem.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.repository.UserRepository;
import com.edutech.fooddeliverysystem.repository.RestaurantRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ================= REGISTER =================
    public User register(User user) {

        // ✅ Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // ✅ Save user directly (NO new object creation)
        User savedUser = userRepository.save(user);

        // ✅ REMOVED AUTO-CREATION OF RESTAURANT
        // Restaurant owners will create their restaurant manually through the frontend

        return savedUser;
    }

    // ================= LOGIN =================
    public Optional<User> login(String email, String password) {

        System.out.println("===== LOGIN DEBUG =====");
        System.out.println("Entered Email: " + email);
        System.out.println("Entered Password: " + password);

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            System.out.println("User Found in DB");
            System.out.println("DB Email: " + user.get().getEmail());
            System.out.println("DB Password: " + user.get().getPassword());

            boolean match = passwordEncoder.matches(password, user.get().getPassword());

            System.out.println("Password Match: " + match);

            if (match) {
                return user;
            }
        } else {
            System.out.println("User NOT Found");
        }

        return Optional.empty();
    }

    // ✅ NEW METHOD (STEP 3.2 FIX)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}