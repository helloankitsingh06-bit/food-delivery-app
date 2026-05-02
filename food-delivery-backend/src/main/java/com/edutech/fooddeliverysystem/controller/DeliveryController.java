package com.edutech.fooddeliverysystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.fooddeliverysystem.entity.Delivery;
import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.service.DeliveryService;
import com.edutech.fooddeliverysystem.service.OrderService;
import com.edutech.fooddeliverysystem.service.TwilioSmsService;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "http://localhost:4200")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private TwilioSmsService smsService;

    @GetMapping("/orders")
    public List<Delivery> getOrders(@RequestParam Long agentId) {
        return deliveryService.getOrdersForAgent(agentId);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestParam Delivery.DeliveryStatus status) {
        Delivery updated = deliveryService.updateDeliveryStatus(id, status);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        // ✅ Get order from delivery using Lombok getter
        Order order = updated.getOrder();
        if (order == null) {
            return ResponseEntity.badRequest().body("No order associated with this delivery");
        }

        if (status == Delivery.DeliveryStatus.PICKED) {
            orderService.updateOrderStatus(order.getId(), Order.Status.OUT_FOR_DELIVERY);
            // Send SMS to customer that food is out for delivery
            String msg = "Your order #" + order.getId() + " is OUT FOR DELIVERY. It will arrive soon!";
            if (order.getCustomer() != null && order.getCustomer().getPhone() != null) {
                smsService.sendSms(order.getCustomer().getPhone(), msg);
            }
        } else if (status == Delivery.DeliveryStatus.DELIVERED) {
            orderService.updateOrderStatus(order.getId(), Order.Status.DELIVERED);
            // Send SMS to customer that order is delivered
            String msg = "Order #" + order.getId() + " has been DELIVERED. Enjoy your meal!";
            if (order.getCustomer() != null && order.getCustomer().getPhone() != null) {
                smsService.sendSms(order.getCustomer().getPhone(), msg);
            }
            // Optional: notify restaurant owner
            if (order.getRestaurant() != null && order.getRestaurant().getOwner() != null
                    && order.getRestaurant().getOwner().getPhone() != null) {
                smsService.sendSms(order.getRestaurant().getOwner().getPhone(),
                        "Order #" + order.getId() + " delivered to customer.");
            }
        }

        return ResponseEntity.ok(updated);
    }
}