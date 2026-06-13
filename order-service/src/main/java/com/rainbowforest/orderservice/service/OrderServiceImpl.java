package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.UserClient userClient;

    @Autowired
    private com.rainbowforest.orderservice.feignclient.EmailClient emailClient;

    private void sendNotification(Long userId, String title, String content, String type, String link) {
        try {
            com.rainbowforest.orderservice.domain.Notification notification = new com.rainbowforest.orderservice.domain.Notification();
            notification.setUserId(userId);
            notification.setTitle(title);
            notification.setContent(content);
            notification.setType(type);
            notification.setLink(link);
            userClient.createNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    private void notifyAdmins(String title, String content, String type, String link) {
        try {
            com.rainbowforest.orderservice.domain.Notification notification = new com.rainbowforest.orderservice.domain.Notification();
            notification.setTitle(title);
            notification.setContent(content);
            notification.setType(type);
            notification.setLink(link);
            userClient.notifyAdmins(notification);
        } catch (Exception e) {
            System.err.println("Failed to notify admins: " + e.getMessage());
        }
    }


    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByUserName(String userName) {
        return orderRepository.findAllByUserUserName(userName);
    }


    @Autowired
    private com.rainbowforest.orderservice.feignclient.ProductClient productClient;

    private void updateSalesCount(Order order) {
        if (order.isStockReduced()) {
            System.out.println("Stock already reduced for order " + order.getId() + ". Skipping.");
            return;
        }

        if (order.getItems() != null) {
            for (com.rainbowforest.orderservice.domain.Item item : order.getItems()) {
                if (item.getProduct() != null && item.getProduct().getProductId() != null) {
                    try {
                        if (item.getSelectedColor() != null && item.getSelectedSize() != null) {
                            // Ưu tiên trừ kho theo biến thể (màu + size)
                            productClient.reduceVariantStock(
                                item.getProduct().getProductId(), 
                                item.getSelectedColor(), 
                                item.getSelectedSize(), 
                                item.getQuantity()
                            );
                        } else {
                            // Fallback cho sản phẩm cũ không phân loại
                            productClient.incrementSalesCount(item.getProduct().getProductId(), item.getQuantity());
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to update stock for product " + item.getProduct().getProductId() + ": " + e.getMessage());
                    }
                }
            }
        }
        
        order.setStockReduced(true);
        orderRepository.save(order);
    }

    @Override
    public Order saveOrder(Order order) {
        boolean isNew = (order.getId() == null);
        Order savedOrder = orderRepository.save(order);
        
        // For cash orders or manual orders that are already placed
        if ("PAID".equals(savedOrder.getStatus()) || "PENDING".equals(savedOrder.getStatus())) {
            updateSalesCount(savedOrder);
        }

        if (isNew && savedOrder.getUser() != null) {
            sendNotification(
                savedOrder.getUser().getId(),
                "Đặt hàng thành công",
                "Đơn hàng #" + savedOrder.getId() + " của bạn đã được tiếp nhận.",
                "ORDER",
                "/order/" + savedOrder.getId()
            );
            
            // Notify Admin
            notifyAdmins(
                "Đơn hàng mới #" + savedOrder.getId(),
                "Khách hàng " + (savedOrder.getUser() != null ? savedOrder.getUser().getUserName() : "Vãng lai") + " đã đặt một đơn hàng mới.",
                "ORDER",
                "/orders"
            );
        }
        
        return savedOrder;
    }

    @Override
    public Order payForOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null && ("PAYMENT_EXPECTED".equals(order.getStatus()) || "PENDING".equals(order.getStatus()))) {
            order.setStatus("PAID");
            order = orderRepository.save(order);
            
            // Update sales count
            updateSalesCount(order);

            // Update user spending and membership tier
            if (order.getUser() != null) {
                System.out.println("Updating spending for user ID: " + order.getUser().getId() + ", amount: " + order.getTotal());
                userClient.updateSpending(order.getUser().getId(), order.getTotal().doubleValue());
                
                // Send payment notification
                sendNotification(
                    order.getUser().getId(),
                    "Thanh toán thành công",
                    "Đơn hàng #" + order.getId() + " đã được thanh toán thành công. Cảm ơn bạn!",
                    "ORDER",
                    "/order/" + order.getId()
                );

                // Notify Admin
                notifyAdmins(
                    "Đơn hàng #" + order.getId() + " đã thanh toán",
                    "Đơn hàng #" + order.getId() + " của " + order.getUser().getUserName() + " đã thanh toán thành công.",
                    "ORDER",
                    "/orders"
                );

                // Send Confirmation Email
                sendOrderConfirmationEmail(order);
            } else {
                System.err.println("Cannot update spending: User is NULL for order ID: " + order.getId());
            }
        }
        if (order != null) {
            if (order.getItems() != null) {
                order.getItems().size(); 
            }
            if (order.getUser() != null) {
                order.getUser().getUserName();
            }
        }
        return order;
    }

    private void sendOrderConfirmationEmail(Order order) {
        try {
            // Fetch full user details to get email
            com.rainbowforest.orderservice.domain.User user = userClient.getUserById(order.getUser().getId());
            if (user == null || user.getUserDetails() == null || user.getUserDetails().getEmail() == null) {
                System.err.println("Cannot send email: User email not found");
                return;
            }

            java.util.Map<String, Object> emailRequest = new java.util.HashMap<>();
            emailRequest.put("to", user.getUserDetails().getEmail());
            emailRequest.put("subject", "Xác nhận đơn hàng #" + order.getId() + " - CTUS LUX HERITAGE");
            emailRequest.put("templateName", "order-confirmation");

            java.util.Map<String, Object> model = new java.util.HashMap<>();
            model.put("orderId", "#" + order.getId());
            model.put("orderDate", new java.util.Date().toString());
            model.put("address", order.getShippingAddress());
            model.put("totalAmount", order.getTotal());
            
            java.util.List<java.util.Map<String, Object>> items = new java.util.ArrayList<>();
            for (com.rainbowforest.orderservice.domain.Item item : order.getItems()) {
                java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("productName", item.getProduct().getProductName());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("price", item.getProduct() != null ? item.getProduct().getPrice() : 0);
                items.add(itemMap);
            }
            model.put("items", items);
            
            emailRequest.put("templateModel", model);

            emailClient.sendEmail(emailRequest);
            System.out.println("Order confirmation email sent to: " + user.getUserDetails().getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }
}
