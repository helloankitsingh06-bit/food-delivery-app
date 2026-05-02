package com.edutech.fooddeliverysystem.repository;

import com.edutech.fooddeliverysystem.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findByPhoneAndCode(String phone, String code);
    void deleteByPhone(String phone);
}