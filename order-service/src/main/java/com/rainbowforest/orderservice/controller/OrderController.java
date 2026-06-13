package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.config.VNPayConfig;
import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.repository.UserRepository;
import com.rainbowforest.orderservice.repository.ProductRepository;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/shop")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;
    
    @PostMapping(value = "/order")
    public ResponseEntity<?> saveOrderManual(
            @RequestBody Order order,
            HttpServletRequest request){
        
        if (order.getOrderedDate() == null) {
            order.setOrderedDate(LocalDate.now());
        }

        System.out.println("--- INCOMING ORDER DEBUG ---");
        System.out.println("User: " + (order.getUser() != null ? order.getUser().getUserName() : "NULL"));
        System.out.println("Total: " + order.getTotal());
        System.out.println("Items count: " + (order.getItems() != null ? order.getItems().size() : 0));

        // Sync User ID and Save/Merge User locally
        if (order.getUser() != null) {
            User userFromRequest = order.getUser();
            try {
                // If ID is missing from request, try to get it from user-service
                if (userFromRequest.getId() == null && userFromRequest.getUserName() != null) {
                    User realUserFromService = userClient.getUserByName(userFromRequest.getUserName());
                    if (realUserFromService != null) {
                        userFromRequest.setId(realUserFromService.getId());
                    }
                }
                
                // Save or update user and RE-ASSIGN the managed instance to the order
                if (userFromRequest.getId() != null) {
                    User managedUser = userRepository.save(userFromRequest);
                    order.setUser(managedUser); 
                    System.out.println("Saved & Attached User: " + managedUser.getUserName() + " (ID: " + managedUser.getId() + ")");
                } else {
                    System.err.println("User ID is still NULL after sync attempt!");
                }
            } catch (Exception e) {
                System.err.println("Could not sync/save user: " + e.getMessage());
                // If service fails, but we have ID from request, we still try to save
                if (userFromRequest.getId() != null) {
                    userRepository.save(userFromRequest);
                }
            }
        }
        
        System.out.println("Received Order to Save: ID=" + order.getId());
        
        // Sync and Save/Merge Products locally
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                item.setOrder(order);
                if (item.getProduct() != null) {
                    Product p = item.getProduct();
                    // Set productId from transient id if needed
                    if (p.getId() != null) {
                        p.setProductId(p.getId());
                    }
                    
                    // Save or update product and RE-ASSIGN the managed instance to the item
                    if (p.getProductId() != null) {
                        Product managedProduct = productRepository.save(p);
                        item.setProduct(managedProduct);
                    }
                }
                System.out.println(" - Item: Qty=" + item.getQuantity() + ", Product=" + (item.getProduct() != null ? item.getProduct().getProductName() : "NULL"));
            });
        }
        
        try {
            Order savedOrder = orderService.saveOrder(order);
            return new ResponseEntity<Order>(
                    savedOrder, 
                    headerGenerator.getHeadersForSuccessPostMethod(request, savedOrder.getId()),
                    HttpStatus.CREATED);
        } catch (Exception ex) {
            ex.printStackTrace();
            // Return detailed error message for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving order: " + ex.getMessage() + " | Cause: " + (ex.getCause() != null ? ex.getCause().getMessage() : "Unknown"));
        }
    }

    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<Order> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cookie", required = false) String cartId,
    		HttpServletRequest request){
    	
        List<Item> cart = new ArrayList<>(); 
        User user = userClient.getUserById(userId);   
        if(user != null) {
        	Order order = this.createOrder(cart, user);
        	try{
                orderService.saveOrder(order);
                return new ResponseEntity<Order>(
                		order, 
                		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                		HttpStatus.CREATED);
            }catch (Exception ex){
                ex.printStackTrace();
                return new ResponseEntity<Order>(
                		headerGenerator.getHeadersForError(),
                		HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
  
        return new ResponseEntity<Order>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
    
    private Order createOrder(List<Item> cart, User user) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PAYMENT_EXPECTED");
        return order;
    }

    @GetMapping(value = "/order")
    public ResponseEntity<?> getAllOrders(){
        try {
            List<Order> orders = orderService.getAllOrders();
            return new ResponseEntity<List<Order>>(
                    orders,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving orders: " + ex.getMessage());
        }
    }

    @GetMapping(value = "/order/user/{userName}")
    public ResponseEntity<List<Order>> getOrdersByUserName(@PathVariable("userName") String userName) {
        try {
            List<Order> orders = orderService.getOrdersByUserName(userName);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/order/{orderId}/pay")
    public ResponseEntity<Order> payForOrder(
            @PathVariable("orderId") Long orderId,
            HttpServletRequest request) {
        try {
            Order order = orderService.payForOrder(orderId);
            if (order != null) {
                return new ResponseEntity<Order>(
                        order,
                        headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                        HttpStatus.OK);
            }
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            ex.printStackTrace();
            return new ResponseEntity<Order>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping(value = "/order/{orderId}")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable("orderId") Long orderId,
            @RequestBody Order orderDetails) {
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            String oldStatus = order.getStatus();
            String newStatus = orderDetails.getStatus();
            order.setStatus(newStatus);
            orderService.saveOrder(order);

            // Business Rules: Update spending based on status transition
            List<String> moneyReceived = java.util.Arrays.asList("PAID", "COMPLETED", "DELIVERED");

            // Transition: Money Received -> Not Money Received (Refund/Cancel)
            if (moneyReceived.contains(oldStatus) && 
                ("CANCELLED".equals(newStatus) || "REFUNDED".equals(newStatus) || "CANCELED".equals(newStatus))) {
                if (order.getUser() != null) {
                    System.out.println("Decreasing spending for user ID: " + order.getUser().getId() + " due to status " + newStatus);
                    userClient.updateSpending(order.getUser().getId(), -order.getTotal().doubleValue());
                }
            }
            
            // Transition: Not Money Received -> Money Received
            if (!moneyReceived.contains(oldStatus) && moneyReceived.contains(newStatus)) {
                if (order.getUser() != null) {
                    System.out.println("Increasing spending for user ID: " + order.getUser().getId() + " due to status " + newStatus);
                    userClient.updateSpending(order.getUser().getId(), order.getTotal().doubleValue());
                }
            }
        } else {
            return new ResponseEntity<Order>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<Order>(
            order,
            headerGenerator.getHeadersForSuccessGetMethod(),
            HttpStatus.OK);
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/order-details/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable("orderId") Long orderId) {
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            return new ResponseEntity<>(order, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/order/{orderId}/vnpay-url")
    public ResponseEntity<Map<String, String>> getVNPayUrl(
            @PathVariable("orderId") Long orderId,
            HttpServletRequest request) throws UnsupportedEncodingException {
        
        Order order = orderService.getOrderById(orderId);
        if (order == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        // 1. Khởi tạo các tham số cơ bản
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;
        
        // Tính toán số tiền (Giá trị trong hệ thống đã là VND)
        // VNPay yêu cầu số tiền * 100
        BigDecimal totalVND = order.getTotal() != null ? order.getTotal() : BigDecimal.ZERO;
        long vnp_Amount = totalVND.multiply(new BigDecimal(100)).longValue();
        
        // Tạo TxnRef chứa Order ID để có thể parse ngược lại trong callback
        String vnp_TxnRef = order.getId() + "_" + VNPayConfig.getRandomNumber(8);
        
        // Thông tin đơn hàng thật
        String userName = (order.getUser() != null) ? order.getUser().getUserName() : "Guest";
        String vnp_OrderInfo = "ThanhToan_DonHang_" + order.getId() + "_KhachHang_" + userName;
        
        String vnp_OrderType = "100000"; 
        String vnp_Locale = "vn";
        
        // LẤY DYNAMIC RETURN URL TỪ FRONTEND
        String referer = request.getHeader("Referer");
        String vnp_ReturnUrl = VNPayConfig.vnp_ReturnUrl;
        if (referer != null && (referer.contains("localhost") || referer.contains("127.0.0.1"))) {
            // Lấy gốc của URL (ví dụ http://localhost:5174)
            String[] parts = referer.split("/");
            if (parts.length >= 3) {
                vnp_ReturnUrl = parts[0] + "//" + parts[2];
            }
        }
        
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);

        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        
        // Thêm vnp_ExpireDate (15 phút sau khi tạo)
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());

        // LOG ĐỂ KIỂM TRA
        System.out.println("--- VNPAY DEBUG REAL DATA ---");
        System.out.println("Order ID: " + order.getId());
        System.out.println("Customer: " + userName);
        System.out.println("Total (VND): " + totalVND);
        System.out.println("Amount to VNPay (VND*100): " + vnp_Amount);
        System.out.println("TxnRef: " + vnp_TxnRef);

        // 2. Đưa tất cả vào Map (TreeMap tự sắp xếp A-Z)
        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate); // Cần thiết cho một số node Sandbox

        // 3. Xây dựng chuỗi
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data (Lưu ý: v2.1.0 yêu cầu Encode cả giá trị băm trong một số trường hợp)
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                
                // Build query (Encoded)
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
                     .append('=')
                     .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                
                if (i < fieldNames.size() - 1) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        // VNPay yêu cầu khoảng trắng là %20 thay vì dấu +
        String queryUrl = query.toString().replace("+", "%20");
        String hashDataStr = hashData.toString().replace("+", "%20");
        
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashDataStr);
        String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
        
        System.out.println("--- VNPAY DEBUG ---");
        System.out.println("HashData Strand: " + hashDataStr);
        System.out.println("Final URL: " + paymentUrl);
        System.out.println("-------------------");

        Map<String, String> res = new HashMap<>();
        res.put("url", paymentUrl);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "/vnpay-callback")
    public ResponseEntity<String> vnpayCallback(@RequestParam Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");
        
        if ("00".equals(vnp_ResponseCode)) {
            Long orderId = Long.parseLong(vnp_TxnRef.split("_")[0]);
            orderService.payForOrder(orderId);
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed");
    }

    @GetMapping(value = "/order/check-purchase")
    public boolean hasPurchasedProduct(
            @RequestParam("userId") Long userId,
            @RequestParam("productId") Long productId) {
        try {
            List<Order> userOrders = orderService.getOrdersByUserName(userClient.getUserById(userId).getUserName());
            return userOrders.stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()) || "DELIVERED".equals(o.getStatus()))
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> item.getProduct().getProductId().equals(productId));
        } catch (Exception e) {
            return false;
        }
    }
}
