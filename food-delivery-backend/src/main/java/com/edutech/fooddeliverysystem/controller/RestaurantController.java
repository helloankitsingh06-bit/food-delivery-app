package com.edutech.fooddeliverysystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.edutech.fooddeliverysystem.entity.Menu;
import com.edutech.fooddeliverysystem.entity.Order;
import com.edutech.fooddeliverysystem.entity.Restaurant;
import com.edutech.fooddeliverysystem.entity.User;
import com.edutech.fooddeliverysystem.service.MenuService;
import com.edutech.fooddeliverysystem.service.OrderService;
import com.edutech.fooddeliverysystem.service.RestaurantService;
import com.edutech.fooddeliverysystem.service.UserService;
import com.edutech.fooddeliverysystem.repository.RestaurantRepository;

import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    @Autowired
    private UserService userService;
    
    @Autowired
    private RestaurantRepository restaurantRepository;

    // ✅ CREATE RESTAURANT - FIXED VERSION
    @PostMapping("/create")
    public ResponseEntity<?> createRestaurant(@RequestBody Restaurant request) {
        try {
            // Check if ownerEmail is provided
            if (request.getOwnerEmail() == null || request.getOwnerEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("Owner email is required");
            }
            
            // Create new restaurant object
            Restaurant restaurant = new Restaurant();
            restaurant.setName(request.getName());
            restaurant.setAddress(request.getAddress());
            restaurant.setCuisine(request.getCuisine());
            restaurant.setImageUrl(request.getImageUrl());
            restaurant.setLocation(request.getLocation());
            restaurant.setRating(request.getRating());
            
            // Save with owner email
            Restaurant savedRestaurant = restaurantService.createRestaurantForOwner(restaurant, request.getOwnerEmail());
            return ResponseEntity.ok(savedRestaurant);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating restaurant: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }
    
    // ✅ GET RESTAURANTS BY OWNER EMAIL
    @GetMapping("/my-restaurants")
    public ResponseEntity<?> getMyRestaurants(@RequestParam String email) {
        try {
            List<Restaurant> restaurants = restaurantService.getRestaurantsByOwner(email);
            return ResponseEntity.ok(restaurants);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ ENDPOINT: GET RESTAURANT BY OWNER ID
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getRestaurantByOwnerId(@PathVariable Long ownerId) {
        Optional<Restaurant> restaurant = restaurantRepository.findByOwnerId(ownerId);
        if (restaurant.isPresent()) {
            return ResponseEntity.ok(restaurant.get());
        }
        return ResponseEntity.notFound().build();
    }

    // ✅ ENDPOINT: UPDATE RESTAURANT
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurantDetails) {
        Optional<Restaurant> restaurant = restaurantRepository.findById(id);
        if (restaurant.isPresent()) {
            Restaurant existing = restaurant.get();
            existing.setName(restaurantDetails.getName());
            existing.setLocation(restaurantDetails.getLocation());
            existing.setAddress(restaurantDetails.getAddress());
            existing.setCuisine(restaurantDetails.getCuisine());
            existing.setImageUrl(restaurantDetails.getImageUrl());
            existing.setRating(restaurantDetails.getRating());
            return ResponseEntity.ok(restaurantRepository.save(existing));
        }
        return ResponseEntity.notFound().build();
    }

    // ✅ ENDPOINT: DELETE RESTAURANT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        restaurantRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ✅ ADD MENU
    @PostMapping("/menu")
    public Menu addMenu(@RequestParam Long restaurantId, @RequestBody Menu menu) {
        return menuService.addMenuItem(restaurantId, menu);
    }

    // ✅ ADD MENU WITH IMAGE
    @PostMapping("/menu-with-image")
    public Menu addMenuWithImage(
            @RequestParam("restaurantId") Long restaurantId,
            @RequestParam("name") String name,
            @RequestParam("price") double price,
            @RequestParam("description") String description,
            @RequestParam("quantity") int quantity,
            @RequestParam("image") MultipartFile image) {

        try {
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Path path = Paths.get("src/main/resources/static/images/" + fileName);
            Files.write(path, image.getBytes());

            Menu menu = new Menu();
            menu.setName(name);
            menu.setPrice(price);
            menu.setDescription(description);
            menu.setQuantity(quantity);
            menu.setImageUrl(fileName);

            return menuService.addMenuItem(restaurantId, menu);

        } catch (Exception e) {
            throw new RuntimeException("Image upload failed");
        }
    }

    // ✅ UPDATE MENU WITH IMAGE
    @PutMapping("/menu-with-image/{id}")
    public ResponseEntity<?> updateMenuWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") double price,
            @RequestParam("description") String description,
            @RequestParam("quantity") int quantity,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            // Create menu object with updated data
            Menu menu = new Menu();
            menu.setName(name);
            menu.setPrice(price);
            menu.setDescription(description);
            menu.setQuantity(quantity);
            
            // Save new image if uploaded
            if (image != null && !image.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path path = Paths.get("src/main/resources/static/images/" + fileName);
                Files.write(path, image.getBytes());
                menu.setImageUrl(fileName);
            }
            
            Menu updatedMenu = menuService.updateMenuItem(id, menu);
            return ResponseEntity.ok(updatedMenu);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to update menu item: " + e.getMessage());
        }
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
    public Order updateOrder(@PathVariable Long id,
                            @RequestParam Order.Status status) {
        return orderService.updateOrderStatus(id, status);
    }

    // ✅ GET MY RESTAURANT (by userId)
    @GetMapping("/my")
    public Restaurant getMyRestaurant(@RequestParam Long userId) {
        return restaurantService.getRestaurantByOwner(userId);
    }
}