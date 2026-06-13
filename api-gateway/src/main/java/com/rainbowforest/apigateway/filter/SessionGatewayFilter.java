package com.rainbowforest.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

// @Component
public class SessionGatewayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return exchange.getSession().flatMap(session -> {
            // Lấy Session ID từ Redis và gắn vào Header để gửi xuống các service con
            ServerHttpRequest request = exchange.getRequest().mutate()
                    .header("Cookie", "SESSION=" + session.getId())
                    .build();
            
            return chain.filter(exchange.mutate().request(request).build());
        });
    }

    @Override
    public int getOrder() {
        return -1; // Chạy ưu tiên cao nhất
    }
}