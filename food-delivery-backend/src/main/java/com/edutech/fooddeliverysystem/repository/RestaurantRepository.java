package com.edutech.fooddeliverysystem.repository;

import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    // Returns all restaurants owned by a user (if a user can own multiple)
    List<Restaurant> findAllByOwner(User owner);
    
    // Returns a single restaurant by owner ID (assuming one restaurant per owner)
    Optional<Restaurant> findByOwnerId(Long userId);
    
    // Returns a single restaurant by owner (convenience method)
    Optional<Restaurant> findByOwner(User owner);


    
}