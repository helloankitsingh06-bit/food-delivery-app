package com.edutech.fooddeliverysystem.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // ✅ PLACE ORDER
    public Order placeOrder(Order order) {
        return orderRepository.save(order);
    }

    // ✅ GET ORDER BY ID (TRACK ORDER)
    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    // ✅ UPDATE ORDER STATUS
    public Order updateOrderStatus(Long orderId, Order.Status status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }

        return null;
    }

    // 🔥 ADD THIS (IMPORTANT)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}