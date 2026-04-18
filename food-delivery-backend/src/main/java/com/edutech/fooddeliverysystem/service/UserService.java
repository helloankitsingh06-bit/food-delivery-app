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

        // ✅ CREATE RESTAURANT ONLY ONCE
        if (savedUser.getRole() == User.Role.RESTAURANT) {

            try {
                Restaurant restaurant = new Restaurant();

                String restaurantName = savedUser.getName();
                if (restaurantName == null || restaurantName.trim().isEmpty()) {
                    restaurantName = "My Restaurant";
                }

                restaurant.setName(restaurantName);
                restaurant.setLocation("Default Location");

                // 🔥 LINK OWNER
                restaurant.setOwner(savedUser);

                restaurantRepository.save(restaurant);

            } catch (Exception e) {
                System.out.println("❌ RESTAURANT CREATION FAILED");
                e.printStackTrace();
            }
        }

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
}