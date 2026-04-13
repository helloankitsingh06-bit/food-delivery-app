package com.edutech.fooddeliverysystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.edutech.fooddeliverysystem.entity.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    List<Delivery> findByDeliveryAgentId(Long agentId);
}