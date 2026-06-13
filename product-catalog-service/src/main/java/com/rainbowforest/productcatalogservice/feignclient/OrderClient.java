package com.rainbowforest.productcatalogservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/shop/order/check-purchase")
    boolean hasPurchasedProduct(
            @RequestParam("userId") Long userId,
            @RequestParam("productId") Long productId);
}
