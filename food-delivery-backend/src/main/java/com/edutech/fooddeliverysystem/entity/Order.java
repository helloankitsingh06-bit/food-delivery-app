package com.edutech.fooddeliverysystem.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.*;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double totalPrice;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(columnDefinition = "TEXT")
    private String itemsJson;

    @ManyToOne
    private User customer;

    @ManyToOne
    private Restaurant restaurant;

    @Column(name = "order_date")
    private LocalDateTime orderDate = LocalDateTime.now();

    public enum Status {
        PLACED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED
    }

    // Constructors
    public Order() {}
    
    public Order(Long id, double totalPrice, Status status, String itemsJson, 
                 User customer, Restaurant restaurant, LocalDateTime orderDate) {
        this.id = id;
        this.totalPrice = totalPrice;
        this.status = status;
        this.itemsJson = itemsJson;
        this.customer = customer;
        this.restaurant = restaurant;
        this.orderDate = orderDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    @Transient
    public List<String> getItems() {
        if (itemsJson == null) return List.of();
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> list = mapper.readValue(itemsJson, new TypeReference<>() {});
            return list.stream()
                    .map(item -> (String) item.get("name"))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    @Transient
    public String getRestaurantName() {
        return restaurant != null ? restaurant.getName() : null;
    }
}