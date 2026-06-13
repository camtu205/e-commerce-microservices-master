package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.PasswordResetToken;
import com.rainbowforest.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
    Optional<PasswordResetToken> findByUserId(Long userId);
    void deleteByUser(User user);
}
