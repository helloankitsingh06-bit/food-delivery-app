package com.edutech.fooddeliverysystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.edutech.fooddeliverysystem.entity.DeliveryPartner;

public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Integer> {
}