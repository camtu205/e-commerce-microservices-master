package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.FlashSaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, Long> {
    
    @Modifying
    @Query("UPDATE FlashSaleItem f SET f.availableQuantity = f.availableQuantity - :quantity " +
           "WHERE f.id = :itemId AND f.availableQuantity >= :quantity")
    int decrementQuantity(@Param("itemId") Long itemId, @Param("quantity") int quantity);
    
    void deleteByProductId(Long productId);
}
