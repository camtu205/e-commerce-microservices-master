package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.rainbowforest.userservice.feignclient.EmailClient emailClient;

    @GetMapping(value = "/accounts/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        // Luôn trả về 200 OK để xác nhận API hoạt động
        return new ResponseEntity<List<User>>(
                users,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/accounts/customers")
    public ResponseEntity<List<User>> getCustomers() {
        List<User> users = userService.getCustomers();
        return new ResponseEntity<List<User>>(
                users,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/accounts/staff")
    public ResponseEntity<List<User>> getStaff() {
        List<User> users = userService.getStaff();
        return new ResponseEntity<List<User>>(
                users,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @GetMapping(value = "/accounts/users", params = "name")
    public ResponseEntity<User> getUserByName(@RequestParam("name") String userName) {
        User user = userService.getUserByName(userName);
        if (user != null) {
            return new ResponseEntity<User>(
                    user,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<User>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/accounts/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<User>(
                    user,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<User>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/accounts/users")
    public ResponseEntity<?> addUser(@RequestBody User user, HttpServletRequest request) {
        if (user != null) {
            try {
                User savedUser = userService.saveUser(user);
                return new ResponseEntity<User>(
                        savedUser,
                        headerGenerator.getHeadersForSuccessPostMethod(request, savedUser.getId()),
                        HttpStatus.CREATED);
            } catch (Exception e) {
                // Trả về thông báo lỗi chi tiết để debug thay vì 500 chung chung
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Lỗi Backend chi tiết: " + e.getMessage());
            }
        }
        return new ResponseEntity<String>("Payload bị trống hoặc không hợp lệ.", HttpStatus.BAD_REQUEST);
    }

    @PostMapping(value = "/accounts/login")
    public ResponseEntity<User> login(@RequestBody User loginUser) {
        User user = userService.getUserByName(loginUser.getUserName());
        if (user != null && passwordEncoder.matches(loginUser.getUserPassword(), user.getUserPassword())) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PutMapping(value = "/accounts/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        if (updatedUser != null) {
            return new ResponseEntity<User>(
                    updatedUser,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<User>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/accounts/users/{id}/addresses")
    public ResponseEntity<com.rainbowforest.userservice.entity.Address> addAddress(@PathVariable("id") Long id,
            @RequestBody com.rainbowforest.userservice.entity.Address address) {
        com.rainbowforest.userservice.entity.Address savedAddress = userService.addAddress(id, address);
        if (savedAddress != null) {
            return new ResponseEntity<>(savedAddress, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping(value = "/accounts/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable("addressId") Long addressId) {
        userService.deleteAddress(addressId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/accounts/find-email")
    public ResponseEntity<?> findEmailByUsername(@RequestParam("username") String username) {
        User user = userService.getUserByName(username);
        if (user != null && user.getUserDetails() != null && user.getUserDetails().getEmail() != null) {
            String email = user.getUserDetails().getEmail();
            // Masking email for security: an***@gmail.com
            int atIndex = email.indexOf("@");
            if (atIndex > 2) {
                String maskedEmail = email.substring(0, 2) + "***" + email.substring(atIndex);
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("maskedEmail", maskedEmail);
                response.put("fullEmail", email);
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(java.util.Collections.singletonMap("maskedEmail", email));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Username không tồn tại hoặc tài khoản chưa cập nhật email.");
    }

    @RequestMapping(value = "/accounts/forgot-password", method = {
            org.springframework.web.bind.annotation.RequestMethod.POST,
            org.springframework.web.bind.annotation.RequestMethod.GET })
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> requestBody) {
        String email = requestBody.get("email");
        String otp = userService.createPasswordResetTokenForUser(email);
        if (otp != null) {
            try {
                java.util.Map<String, Object> emailRequest = new java.util.HashMap<>();
                emailRequest.put("to", email);
                emailRequest.put("subject", "Khôi phục mật khẩu - CTUS LUX HERITAGE");
                emailRequest.put("templateName", "forgot-password");

                java.util.Map<String, Object> model = new java.util.HashMap<>();
                model.put("otp", otp);
                emailRequest.put("templateModel", model);

                emailClient.sendEmail(emailRequest);
                return ResponseEntity.ok("OTP has been sent to your email.");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email.");
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email not found.");
    }

    @PostMapping("/accounts/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> requestBody) {
        String otp = requestBody.get("otp");
        String newPassword = requestBody.get("newPassword");
        boolean success = userService.resetPassword(otp, newPassword);
        if (success) {
            return ResponseEntity.ok("Password has been reset successfully.");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP.");
    }

    @PutMapping("/accounts/users/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable("id") Long id, @RequestBody java.util.Map<String, String> requestBody) {
        String currentPassword = requestBody.get("currentPassword");
        String newPassword = requestBody.get("newPassword");
        
        try {
            userService.changePassword(id, currentPassword, newPassword);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Đổi mật khẩu thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Collections.singletonMap("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }
}
