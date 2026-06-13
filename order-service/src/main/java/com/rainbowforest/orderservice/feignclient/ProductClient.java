package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.domain.Product;

@FeignClient(name = "product-catalog-service", url = "http://localhost:8810/")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    public Product getProductById(@PathVariable(value = "id") Long productId);

    @org.springframework.web.bind.annotation.PutMapping(value = "/products/{id}/increment-sales")
    public void incrementSalesCount(@PathVariable(value = "id") Long productId, @org.springframework.web.bind.annotation.RequestParam("quantity") int quantity);

    @org.springframework.web.bind.annotation.PutMapping(value = "/products/{id}/reduce-variant-stock")
    public void reduceVariantStock(
            @PathVariable(value = "id") Long productId, 
            @org.springframework.web.bind.annotation.RequestParam("color") String color, 
            @org.springframework.web.bind.annotation.RequestParam("size") String size, 
            @org.springframework.web.bind.annotation.RequestParam("quantity") int quantity);
}
