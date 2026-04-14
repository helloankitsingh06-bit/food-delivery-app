package com.edutech.fooddeliverysystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.fooddeliverysystem.entity.Delivery;
import com.edutech.fooddeliverysystem.service.DeliveryService;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping("/orders")
    public List<Delivery> getOrders(@RequestParam Long agentId) {
        return deliveryService.getOrdersForAgent(agentId);
    }

    @PutMapping("/update/{id}")
    public Delivery updateStatus(@PathVariable Long id,
                                 @RequestParam Delivery.DeliveryStatus status) {
        return deliveryService.updateDeliveryStatus(id, status);
    }
}