package com.rainbowforest.productcatalogservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rainbowforest.productcatalogservice.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    public List<Product> findAllByActive(Integer active);
    public List<Product> findAllByCategoryAndActive(String category, Integer active);
    public List<Product> findAllByProductNameContainingAndActive(String name, Integer active);
}
