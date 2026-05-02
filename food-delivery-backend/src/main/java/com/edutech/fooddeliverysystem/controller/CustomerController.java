package com.edutech.fooddeliverysystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.edutech.fooddeliverysystem.entity.Menu;
import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.service.MenuService;
import com.edutech.fooddeliverysystem.service.OrderService;
import com.edutech.fooddeliverysystem.service.RestaurantService;
import com.edutech.fooddeliverysystem.service.UserService;
import com.edutech.fooddeliverysystem.dto.OrderRequestDto;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private MenuService menuService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @GetMapping("/restaurants")
    public List<Restaurant> getRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/menu/{restaurantId}")
    public List<Menu> getMenu(@PathVariable Long restaurantId) {
        return menuService.getMenuByRestaurant(restaurantId);
    }

    // ✅ UPDATED: placeOrder using @AuthenticationPrincipal (with logging)
    @PostMapping("/order")
    public Order placeOrder(
            @RequestParam Long restaurantId,
            @RequestBody OrderRequestDto orderRequest,
            @AuthenticationPrincipal User currentUser) {

        System.out.println("=== PLACE ORDER ===");
        System.out.println("restaurantId: " + restaurantId);
        System.out.println("currentUser: " + (currentUser != null ? currentUser.getEmail() : "NULL"));

        return orderService.placeOrderWithDetails(orderRequest, restaurantId, currentUser);
    }

    @GetMapping("/order/{id}")
    public Order trackOrder(@PathVariable Long id) {
        return orderService.getOrderById(id).orElse(null);
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }
}