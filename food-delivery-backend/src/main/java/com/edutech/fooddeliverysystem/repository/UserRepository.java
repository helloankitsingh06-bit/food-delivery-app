package com.edutech.fooddeliverysystem.repository;

import com.edutech.fooddeliverysystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);   // ✅ changed to Optional
    
    boolean existsByPhone(String phone);
    Optional<User> findByPhone(String phone);
    List<User> findByRole(User.Role role);
}