package com.edutech.fooddeliverysystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partner")
@Data
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String fullName;
    private String phoneNumber;
    private String email;

    private String city;
    private String areaLocality;

    @Column(columnDefinition = "TEXT")
    private String fullAddress;

    private String vehicleType;
    private String vehicleNumber;
    private String drivingLicenseNumber;

    private String aadhaarNumber;
    private String panNumber;

    private String bankAccountNumber;
    private String ifscCode;
}