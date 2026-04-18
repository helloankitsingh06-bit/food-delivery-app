package com.edutech.fooddeliverysystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;

    // 🔥 EXTRA FIELDS
    private String cuisine;
    private String address;
    private Double rating;
    private String imageUrl;

    // 🔗 OWNER LINK (VERY IMPORTANT)
    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonIgnore   // ✅ ADD THIS
    private User owner;

    // 🔗 MENU RELATION
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Menu> menus;
}