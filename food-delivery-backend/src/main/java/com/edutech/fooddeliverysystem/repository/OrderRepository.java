package com.edutech.fooddeliverysystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.entity.Restaurant;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Get orders by customer ID
    List<Order> findByCustomerId(Long customerId);
    
    // ✅ Get orders by restaurant ID (simple and reliable)
    List<Order> findByRestaurantId(Long restaurantId);

    List<Order> findByRestaurant(Restaurant restaurant);
}