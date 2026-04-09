package com.edutech.fooddeliverysystem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.Delivery;
import com.edutech.fooddeliverysystem.repository.DeliveryRepository;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    public List<Delivery> getOrdersForAgent(Long agentId) {
        return deliveryRepository.findByDeliveryAgentId(agentId);
    }

    public Delivery updateDeliveryStatus(Long id, Delivery.DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(id).orElse(null);

        if (delivery != null) {
            delivery.setStatus(status);
            return deliveryRepository.save(delivery);
        }

        return null;
    }
}