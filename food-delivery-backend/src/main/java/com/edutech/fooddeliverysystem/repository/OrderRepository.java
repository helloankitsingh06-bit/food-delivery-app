package com.edutech.fooddeliverysystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.fooddeliverysystem.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);
}