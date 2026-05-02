package com.edutech.fooddeliverysystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.edutech.fooddeliverysystem.entity.DeliveryPartner;
import com.edutech.fooddeliverysystem.repository.DeliveryPartnerRepository;

@Service
public class DeliveryPartnerService {

    @Autowired
    private DeliveryPartnerRepository repository;

    public DeliveryPartner savePartner(DeliveryPartner partner) {
        return repository.save(partner);
    }
}