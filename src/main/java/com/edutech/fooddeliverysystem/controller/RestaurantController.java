package com.edutech.fooddeliverysystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
        return restaurantService.createRestaurant(restaurant);
    }

    @PostMapping("/menu")
    public Menu addMenu(@RequestBody Menu menu) {
        return menuService.addMenuItem(menu);
    }

    @PutMapping("/order/update/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestParam Order.Status status) {
        return orderService.updateOrderStatus(id, status);
    }
}