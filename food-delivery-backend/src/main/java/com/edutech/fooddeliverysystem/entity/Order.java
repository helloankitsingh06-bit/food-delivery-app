package com.edutech.fooddeliverysystem.entity;

import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double totalPrice;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ElementCollection
    private List<String> items;

    @ManyToOne
    private User customer;

    @ManyToOne
    private Restaurant restaurant;

    public enum Status {
        PLACED,
        PREPARING,
        OUT_FOR_DELIVERY,
        DELIVERED
    }
    public void setStatus(Status status) 
    {
        this.status = status;
    }
}