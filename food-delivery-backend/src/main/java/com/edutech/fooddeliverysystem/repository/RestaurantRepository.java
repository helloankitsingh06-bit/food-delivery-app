package com.edutech.fooddeliverysystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.fooddeliverysystem.entity.Restaurant;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
}