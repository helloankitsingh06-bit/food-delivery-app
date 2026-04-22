package com.edutech.fooddeliverysystem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.repository.RestaurantRepository;
import com.edutech.fooddeliverysystem.repository.UserRepository;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
    
    public Restaurant save(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    // ✅ Create restaurant for logged-in owner (USING EMAIL)
    public Restaurant createRestaurantForOwner(Restaurant restaurant, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
            .orElseThrow(() -> new RuntimeException("Owner not found with email: " + ownerEmail));
        restaurant.setOwner(owner);
        return restaurantRepository.save(restaurant);
    }
    
    // ✅ Get restaurants by owner email
    public List<Restaurant> getRestaurantsByOwner(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
            .orElseThrow(() -> new RuntimeException("Owner not found with email: " + ownerEmail));
        return restaurantRepository.findByOwner(owner);
    }
    
    public Restaurant getRestaurantByOwner(Long userId) {
        return restaurantRepository.findByOwnerId(userId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }
}