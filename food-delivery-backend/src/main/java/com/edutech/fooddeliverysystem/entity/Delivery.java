package com.edutech.fooddeliverysystem.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    @OneToOne
    private Order order;

    @ManyToOne
    private User deliveryAgent;

    public enum DeliveryStatus {
        PENDING,      // Order ready, waiting for partner to accept/reject
        ACCEPTED,     // Partner accepted but not picked up yet
        REJECTED,     // Partner rejected (order remains available for others)
        ASSIGNED,     // Partner assigned (legacy, keep for compatibility)
        PICKED,       // Partner picked up order from restaurant
        DELIVERED     // Delivered to customer
    }

    // ========== GETTERS ==========
    public Long getId() {
        return id;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public Order getOrder() {
        return order;
    }

    public User getDeliveryAgent() {
        return deliveryAgent;
    }

    // ========== SETTERS ==========
    public void setId(Long id) {
        this.id = id;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public void setDeliveryAgent(User deliveryAgent) {
        this.deliveryAgent = deliveryAgent;
    }
}