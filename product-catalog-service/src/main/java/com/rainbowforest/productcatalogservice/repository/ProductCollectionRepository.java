package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.ProductCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductCollectionRepository extends JpaRepository<ProductCollection, Long> {
}
