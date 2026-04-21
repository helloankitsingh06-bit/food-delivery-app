package com.edutech.fooddeliverysystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.fooddeliverysystem.entity.Menu;
import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.service.MenuService;
import com.edutech.fooddeliverysystem.service.OrderService;
import com.edutech.fooddeliverysystem.service.RestaurantService;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant")
@CrossOrigin(origins = "*")
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

    @GetMapping("/all")
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    // ✅ FIXED HERE
    @PostMapping("/menu")
    public Menu addMenu(@RequestParam Long restaurantId, @RequestBody Menu menu) {
        return menuService.addMenuItem(restaurantId, menu);
    }

    @GetMapping("/menu")
    public List<Menu> getMenuByQuery(@RequestParam Long restaurantId) {
        return menuService.getMenuByRestaurant(restaurantId);
    }

    @GetMapping("/menu/{restaurantId}")
    public List<Menu> getMenu(@PathVariable Long restaurantId) {
        return menuService.getMenuByRestaurant(restaurantId);
    }

    @PutMapping("/menu/{id}")
    public Menu updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        return menuService.updateMenuItem(id, menu);
    }

    @DeleteMapping("/menu/{id}")
        public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/order/update/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestParam Order.Status status) {
        return orderService.updateOrderStatus(id, status);
    }

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