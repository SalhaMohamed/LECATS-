package com.project.lecats.repository;

import com.project.lecats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Angalia kama email tayari ipo
    boolean existsByEmail(String email);

    // Tafuta user kwa email
    Optional<User> findByEmail(String email);
}
