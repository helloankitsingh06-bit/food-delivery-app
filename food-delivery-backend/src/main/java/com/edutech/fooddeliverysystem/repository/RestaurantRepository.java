package com.edutech.fooddeliverysystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.entity.User;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    // ✅ ADD THIS
    List<Restaurant> findByOwner(User owner);
    Optional<Restaurant> findByOwnerId(Long ownerId);
}