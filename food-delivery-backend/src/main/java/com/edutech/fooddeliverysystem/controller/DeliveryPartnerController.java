package com.edutech.fooddeliverysystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.fooddeliverysystem.entity.DeliveryPartner;
import com.edutech.fooddeliverysystem.service.DeliveryPartnerService;

@RestController
@RequestMapping("/api/delivery-partner")

public class DeliveryPartnerController {

    @Autowired
    private DeliveryPartnerService service;

    @PostMapping("/register")
    public DeliveryPartner registerPartner(@RequestBody DeliveryPartner partner) {
        System.out.println("📥 Received delivery partner: " + partner);
        System.out.println("Full name: " + (partner != null ? partner.getFullName() : "null"));
        System.out.println("Phone: " + (partner != null ? partner.getPhoneNumber() : "null"));
        return service.savePartner(partner);
    }
}