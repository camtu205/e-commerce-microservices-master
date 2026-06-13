package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import java.util.List;

public interface OrderService {
    public Order saveOrder(Order order);
    public Order getOrderById(Long id);
    public Order payForOrder(Long id);
    public List<Order> getAllOrders();
    List<Order> getOrdersByUserName(String userName);
}
