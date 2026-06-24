package com.rainbowforest.userservice.service;

import java.util.List;

import com.rainbowforest.userservice.entity.User;

public interface UserService {
    List<User> getAllUsers();

    List<User> getCustomers();

    List<User> getStaff();

    User getUserById(Long id);

    User getUserByName(String userName);

    User saveUser(User user);

    User updateUser(Long id, User user);

    com.rainbowforest.userservice.entity.Address addAddress(Long userId,
            com.rainbowforest.userservice.entity.Address address);

    void deleteAddress(Long addressId);

    // Forgot Password
    String createPasswordResetTokenForUser(String email);

    boolean resetPassword(String token, String newPassword);

    // Change Password
    void changePassword(Long id, String currentPassword, String newPassword);
}
