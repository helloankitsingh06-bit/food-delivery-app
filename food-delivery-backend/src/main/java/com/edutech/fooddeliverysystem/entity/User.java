package com.edutech.fooddeliverysystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String name;

    @Column(unique = true)
    private String email;

    private String password;
    private String phone;

    private LocalDateTime phoneVerifiedAt;   // ✅ NEW FIELD

    @Column(nullable = true)
    private Double latitude;

    @Column(nullable = true)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Restaurant> restaurants;

    public enum Role {
        CUSTOMER,
        RESTAURANT,
        DELIVERY
    }

    // ========== GETTERS ==========
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPhone() { return phone; }
    public LocalDateTime getPhoneVerifiedAt() { return phoneVerifiedAt; }
    public Role getRole() { return role; }
    public List<Restaurant> getRestaurants() { return restaurants; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }

    // ========== SETTERS ==========
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setPhoneVerifiedAt(LocalDateTime phoneVerifiedAt) { this.phoneVerifiedAt = phoneVerifiedAt; }
    public void setRole(Role role) { this.role = role; }
    public void setRestaurants(List<Restaurant> restaurants) { this.restaurants = restaurants; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

}