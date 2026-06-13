package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, String status);
    List<Review> findByUserId(Long userId);
    List<Review> findAllByOrderByCreatedAtDesc();
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
