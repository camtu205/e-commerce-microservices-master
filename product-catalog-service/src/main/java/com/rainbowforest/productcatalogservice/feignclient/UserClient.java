package com.rainbowforest.productcatalogservice.feignclient;

import com.rainbowforest.productcatalogservice.dto.Notification;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "User", url = "http://localhost:8811/")
public interface UserClient {

    @PostMapping(value = "/accounts/notifications/broadcast")
    public void broadcastNotification(@RequestBody Notification notification);
}
