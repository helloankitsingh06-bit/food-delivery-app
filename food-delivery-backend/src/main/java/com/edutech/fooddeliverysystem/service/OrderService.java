package com.edutech.fooddeliverysystem.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.entity.Delivery;
import com.edutech.fooddeliverysystem.repository.OrderRepository;
import com.edutech.fooddeliverysystem.repository.RestaurantRepository;
import com.edutech.fooddeliverysystem.repository.DeliveryRepository;
import com.edutech.fooddeliverysystem.dto.OrderRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private TwilioSmsService smsService;

    // Original method (keep if needed)
    public Order placeOrder(Order order) {
        return orderRepository.save(order);
    }

    // placeOrderWithDetails (unchanged)
    public Order placeOrderWithDetails(OrderRequestDto orderRequest, Long restaurantId, User customer) {
        Order order = new Order();
        order.setTotalPrice(orderRequest.getTotalPrice());
        order.setStatus(Order.Status.PLACED);
        order.setCustomer(customer);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        order.setRestaurant(restaurant);

        try {
            ObjectMapper mapper = new ObjectMapper();
            String itemsJson = mapper.writeValueAsString(orderRequest.getItems());
            order.setItemsJson(itemsJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize items");
        }

        order.setOrderDate(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    // ✅ Fully updated updateOrderStatus with DEBUG prints inside READY block
    public Order updateOrderStatus(Long orderId, Order.Status status) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            Order.Status oldStatus = order.getStatus();
            order.setStatus(status);
            Order savedOrder = orderRepository.save(order);

            // 🔁 Send SMS to customer about status change (for any status)
            try {
                String customerMessage = "Order #" + savedOrder.getId() + " status: " + savedOrder.getStatus() 
                                        + ". Thank you for ordering from " + savedOrder.getRestaurant().getName();
                smsService.sendSms(savedOrder.getCustomer().getPhone(), customerMessage);
            } catch (Exception e) {
                System.out.println("Failed to send SMS to customer: " + e.getMessage());
            }

            // ✅ NEW: When order becomes READY, create a pending delivery (no agent)
            if (status == Order.Status.READY && oldStatus != status) {
                // 🔍 DEBUG PRINTS
                System.out.println("=== DEBUG: Entered READY block for order " + orderId);
                Optional<Delivery> existingDeliveryOpt = deliveryRepository.findByOrderId(orderId);
                System.out.println("Existing delivery present? " + existingDeliveryOpt.isPresent());

                // Check if a delivery already exists for this order
                if (existingDeliveryOpt.isEmpty()) {
                    Delivery delivery = new Delivery();
                    delivery.setOrder(order);
                    delivery.setStatus(Delivery.DeliveryStatus.PENDING); // waiting for partner action
                    deliveryRepository.save(delivery);
                    System.out.println("Created pending delivery for order #" + orderId);
                } else {
                    Delivery existingDelivery = existingDeliveryOpt.get();
                    if (existingDelivery.getStatus() == Delivery.DeliveryStatus.REJECTED) {
                        // If previously rejected, reset to PENDING
                        existingDelivery.setStatus(Delivery.DeliveryStatus.PENDING);
                        existingDelivery.setDeliveryAgent(null); // clear rejected agent
                        deliveryRepository.save(existingDelivery);
                        System.out.println("Reset rejected delivery to PENDING for order #" + orderId);
                    }
                }
            }

            // Existing logic for PREPARING / OUT_FOR_DELIVERY (delivery partner assignment)
            if ((status == Order.Status.PREPARING || status == Order.Status.OUT_FOR_DELIVERY)
                    && oldStatus != status) {
                
                Double restLat = order.getRestaurant().getLatitude();
                Double restLng = order.getRestaurant().getLongitude();
                
                if (restLat == null || restLng == null) {
                    System.out.println("Restaurant missing location, cannot assign delivery partner");
                } else {
                    User nearestPartner = userService.findNearestDeliveryPartner(restLat, restLng);
                    if (nearestPartner != null) {
                        Optional<Delivery> deliveryOpt = deliveryRepository.findByOrderId(orderId);
                        Delivery delivery;
                        if (deliveryOpt.isEmpty()) {
                            delivery = new Delivery();
                            delivery.setOrder(order);
                        } else {
                            delivery = deliveryOpt.get();
                        }
                        delivery.setDeliveryAgent(nearestPartner);
                        delivery.setStatus(Delivery.DeliveryStatus.ASSIGNED);
                        deliveryRepository.save(delivery);
                        
                        String smsMessage = "New order #" + order.getId() + " from " 
                            + order.getRestaurant().getName() + " is " + status.toString() 
                            + ". Please check app for details.";
                        smsService.sendSms(nearestPartner.getPhone(), smsMessage);
                    } else {
                        System.out.println("No delivery partner available");
                    }
                }
            }
            return savedOrder;
        }
        return null;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByRestaurantOwner(User owner) {
        if (owner == null) {
            System.out.println("Owner is null – user not authenticated");
            return List.of();
        }
        Optional<Restaurant> restaurantOpt = restaurantRepository.findByOwner(owner);
        if (restaurantOpt.isEmpty()) {
            System.out.println("No restaurant found for owner: " + owner.getEmail());
            return List.of();
        }
        Restaurant restaurant = restaurantOpt.get();
        return orderRepository.findByRestaurant(restaurant);
    }
}