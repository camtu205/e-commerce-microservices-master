package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.StoreInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreInfoRepository extends JpaRepository<StoreInfo, Long> {
}
