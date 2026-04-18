package com.edutech.fooddeliverysystem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.fooddeliverysystem.entity.Menu;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.repository.MenuRepository;
import com.edutech.fooddeliverysystem.repository.RestaurantRepository;

@Service
public class MenuService {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    public Menu addMenuItem(Long restaurantId, Menu menu) {

    Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));

    menu.setRestaurant(restaurant);

    return menuRepository.save(menu);
    }

    public List<Menu> getMenuByRestaurant(Long restaurantId) {
        return menuRepository.findByRestaurantId(restaurantId);
    }

    public void deleteMenuItem(Long id) {
        menuRepository.deleteById(id);
    }
    public Menu updateMenuItem(Long id, Menu updatedMenu) {
    Menu menu = menuRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Menu not found"));

    menu.setName(updatedMenu.getName());
    menu.setPrice(updatedMenu.getPrice());

    return menuRepository.save(menu);
}
}