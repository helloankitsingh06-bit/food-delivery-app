package com.edutech.fooddeliverysystem.entity;

import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;
    private String cuisine;
    private String address;
    private Double rating;
    private String imageUrl;

    // Latitude and Longitude for delivery partner assignment
    private Double latitude;
    private Double longitude;

    // 🔗 OWNER LINK
    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonIgnore
    private User owner;

    // 🔥 NEW - Just for receiving data from frontend (won't save to DB)
    @Transient
    private String ownerEmail;

    // 🔗 MENU RELATION
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Menu> menus;

    // ========== GETTERS ==========
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public String getCuisine() { return cuisine; }
    public String getAddress() { return address; }
    public Double getRating() { return rating; }
    public String getImageUrl() { return imageUrl; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public User getOwner() { return owner; }
    public String getOwnerEmail() { return ownerEmail; }
    public List<Menu> getMenus() { return menus; }

    // ========== SETTERS ==========
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setLocation(String location) { this.location = location; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    public void setAddress(String address) { this.address = address; }
    public void setRating(Double rating) { this.rating = rating; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setOwner(User owner) { this.owner = owner; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public void setMenus(List<Menu> menus) { this.menus = menus; }
}