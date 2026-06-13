package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "email-service", url = "http://localhost:8815/")
public interface EmailClient {

    @PostMapping("/api/email/send")
    void sendEmail(@RequestBody Map<String, Object> emailRequest);
}
