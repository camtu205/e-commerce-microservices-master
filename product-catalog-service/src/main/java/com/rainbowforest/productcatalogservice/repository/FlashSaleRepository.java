package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {
}
