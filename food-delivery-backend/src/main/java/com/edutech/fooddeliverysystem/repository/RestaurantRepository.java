package com.edutech.fooddeliverysystem.repository;

import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByOwner(User owner);
    Optional<Restaurant> findByOwnerId(Long userId);
}