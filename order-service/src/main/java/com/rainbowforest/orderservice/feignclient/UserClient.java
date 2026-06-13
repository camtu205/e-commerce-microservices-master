package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.rainbowforest.orderservice.domain.User;

@FeignClient(name = "User", url = "http://localhost:8811/")
public interface UserClient {

    @GetMapping(value = "/accounts/users/{id}")
    public User getUserById(@PathVariable("id") Long id);

    @GetMapping(value = "/accounts/users", params = "name")
    public User getUserByName(@RequestParam("name") String userName);

    @PostMapping(value = "/accounts/membership-tiers/update-spending/{userId}")
    public void updateSpending(@PathVariable("userId") Long userId, @RequestParam("amount") Double amount);

    @PostMapping(value = "/accounts/notifications/create")
    public void createNotification(@RequestBody com.rainbowforest.orderservice.domain.Notification notification);

    @PostMapping(value = "/accounts/notifications/notify-admins")
    public void notifyAdmins(@RequestBody com.rainbowforest.orderservice.domain.Notification notification);
}
