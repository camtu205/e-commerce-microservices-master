package com.rainbowforest.chatservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "product-catalog-service")
public interface ProductClient {

    @GetMapping("/products")
    List<Map<String, Object>> getAllProducts();

    @GetMapping(value = "/products", params = "name")
    List<Map<String, Object>> getProductsByName(@RequestParam("name") String name);

    @GetMapping(value = "/products", params = "category")
    List<Map<String, Object>> getProductsByCategory(@RequestParam("category") String category);
}
