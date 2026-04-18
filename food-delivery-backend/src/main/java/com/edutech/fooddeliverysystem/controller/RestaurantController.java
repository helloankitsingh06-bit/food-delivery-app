package com.edutech.fooddeliverysystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.fooddeliverysystem.entity.Menu;
import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.service.MenuService;
import com.edutech.fooddeliverysystem.service.OrderService;
import com.edutech.fooddeliverysystem.service.RestaurantService;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private MenuService menuService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant) {
        return restaurantService.save(restaurant);
    }
    
    // ✅ NEW - GET ALL RESTAURANTS
    @GetMapping("/all")
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @PostMapping("/menu")
    public Menu addMenu(@RequestParam Long restaurantId, @RequestBody Menu menu) {
        return menuService.addMenuItem(restaurantId, menu);
    }

    @PutMapping("/order/update/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestParam Order.Status status) {
        return orderService.updateOrderStatus(id, status);
    }
    
    @GetMapping("/menu")
    public List<Menu> getMenu(@RequestParam Long restaurantId) {
        return menuService.getMenuByRestaurant(restaurantId);
    }

    @DeleteMapping("/menu/{id}")
    public String deleteMenu(@PathVariable Long id) {
        menuService.deleteMenuItem(id);
        return "Deleted successfully";
    }
    
    @PutMapping("/menu/{id}")
    public Menu updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        return menuService.updateMenuItem(id, menu);
    }
    // ADD THIS inside RestaurantController.java
@PostMapping("/create-for-owner")
public Restaurant createRestaurantForOwner(
    @RequestBody Restaurant restaurant,
    @RequestParam String ownerEmail) {
    return restaurantService.createRestaurantForOwner(restaurant, ownerEmail);
}
@GetMapping("/my")
public Restaurant getMyRestaurant(@RequestParam Long userId) {
    return restaurantService.getRestaurantByOwner(userId);
}
}