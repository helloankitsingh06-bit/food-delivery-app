package com.edutech.fooddeliverysystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ REQUIRED (used for login / display / API)
    private String username;

    // ✅ REQUIRED (full name)
    private String name;
    
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // 🔗 One user can own multiple restaurants
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Restaurant> restaurants;

    public enum Role {
        CUSTOMER,
        RESTAURANT,
        DELIVERY
    }
}