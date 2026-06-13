package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.FlashSalePurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashSalePurchaseRepository extends JpaRepository<FlashSalePurchase, Long> {
    
    @Query("SELECT SUM(p.quantity) FROM FlashSalePurchase p WHERE p.userId = :userId AND p.flashSaleItem.id = :itemId")
    Integer getTotalPurchasedByUser(@Param("userId") String userId, @Param("itemId") Long itemId);

    List<FlashSalePurchase> findByUserId(String userId);
}
