package com.rainbowforest.productcatalogservice.service;

import java.util.List;

import com.rainbowforest.productcatalogservice.entity.Product;

public interface ProductService {
    public List<Product> getAllProduct();
    public List<Product> getAllActiveProduct();
    public List<Product> getAllProductByCategory(String category);
    public List<Product> getAllActiveProductByCategory(String category);
    public Product getProductById(Long id);
    public List<Product> getAllProductsByName(String name);
    public List<Product> getAllActiveProductsByName(String name);
    public Product addProduct(Product product);
    public void deleteProduct(Long productId);
    public void incrementSalesCount(Long productId, int quantity);
    public void reduceVariantStock(Long productId, String color, String size, int quantity);
}
