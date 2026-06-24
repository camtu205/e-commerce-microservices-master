package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.entity.Address;
import com.rainbowforest.userservice.repository.AddressRepository;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import com.rainbowforest.userservice.repository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.rainbowforest.userservice.entity.PasswordResetToken;
import com.rainbowforest.userservice.repository.PasswordResetTokenRepository;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getCustomers() {
        return userRepository.findByRole_Id(3L); // 3 là ID cho CUSTOMER
    }

    @Override
    public List<User> getStaff() {
        return userRepository.findByRole_IdIn(java.util.Arrays.asList(1L, 2L)); // 1: ADMIN, 2: STAFF
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User saveUser(User user) {
        // 1. Kiểm tra tồn tại trước khi lưu để tránh lỗi 500 mơ hồ
        if (userRepository.findByUserName(user.getUserName()) != null) {
            throw new RuntimeException("Tên đăng nhập '" + user.getUserName() + "' đã tồn tại.");
        }
        if (user.getUserDetails() != null && user.getUserDetails().getEmail() != null) {
            if (userDetailsRepository.findByEmail(user.getUserDetails().getEmail()) != null) {
                throw new RuntimeException(
                        "Email '" + user.getUserDetails().getEmail() + "' đã được sử dụng bởi tài khoản khác.");
            }
        }

        user.setActive(1);

        // Hash password before saving
        if (user.getUserPassword() != null) {
            user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        }

        // Thiết lập mối liên kết 2 chiều giữa User và UserDetails
        if (user.getUserDetails() != null) {
            user.getUserDetails().setUser(user);
        }

        UserRole finalRole = null;

        // 1. Ưu tiên tìm Role theo ID
        if (user.getRole() != null && user.getRole().getId() != null) {
            finalRole = userRoleRepository.findById(user.getRole().getId()).orElse(null);
        }

        // 2. Tìm theo tên (Case-insensitive fallback)
        if (finalRole == null) {
            String roleToFind = (user.getRole() != null && user.getRole().getRoleName() != null)
                    ? user.getRole().getRoleName()
                    : "CUSTOMER";
            finalRole = userRoleRepository.findUserRoleByRoleName(roleToFind.toUpperCase());
        }

        // 3. Tạo mới nếu hoàn toàn không thấy
        if (finalRole == null) {
            finalRole = new UserRole();
            finalRole.setRoleName("CUSTOMER");
            finalRole = userRoleRepository.save(finalRole);
        }

        user.setRole(finalRole);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            existingUser.setUserName(user.getUserName());

            // Cập nhật Quyền (Role) nếu có
            if (user.getRole() != null) {
                UserRole role = null;
                if (user.getRole().getId() != null) {
                    role = userRoleRepository.findById(user.getRole().getId()).orElse(null);
                } else if (user.getRole().getRoleName() != null) {
                    role = userRoleRepository.findUserRoleByRoleName(user.getRole().getRoleName());
                }
                if (role != null)
                    existingUser.setRole(role);
            }

            // Cập nhật Details (bao gồm Avatar)
            if (user.getUserDetails() != null) {
                UserDetails details = existingUser.getUserDetails();
                if (details == null) {
                    details = new UserDetails();
                    existingUser.setUserDetails(details);
                    details.setUser(existingUser);
                }
                details.setFirstName(user.getUserDetails().getFirstName());
                details.setLastName(user.getUserDetails().getLastName());
                details.setEmail(user.getUserDetails().getEmail());
                details.setPhoneNumber(user.getUserDetails().getPhoneNumber());
                details.setStreet(user.getUserDetails().getStreet());
                details.setStreetNumber(user.getUserDetails().getStreetNumber());
                details.setLocality(user.getUserDetails().getLocality());
                details.setAvatar(user.getUserDetails().getAvatar());
            }

            return userRepository.save(existingUser);
        }
        return null;
    }

    @Override
    @Transactional
    public Address addAddress(Long userId, Address address) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            UserDetails details = user.getUserDetails();
            if (details == null) {
                details = new UserDetails();
                user.setUserDetails(details);
                details.setUser(user);
                userDetailsRepository.save(details);
            }

            if (address.isDefault()) {
                // Reset other default addresses
                details.getAddresses().forEach(a -> a.setDefault(false));
            } else if (details.getAddresses().isEmpty()) {
                address.setDefault(true);
            }

            address.setUserDetails(details);
            details.getAddresses().add(address);
            userDetailsRepository.save(details);
            return address;
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteAddress(Long addressId) {
        addressRepository.deleteById(addressId);
    }

    @Override
    @Transactional
    public String createPasswordResetTokenForUser(String email) {
        UserDetails details = userDetailsRepository.findByEmail(email);
        if (details == null || details.getUser() == null) {
            return null;
        }

        User user = details.getUser();

        // Generate 6-digit OTP
        String token = String.format("%06d", new java.util.Random().nextInt(1000000));

        // Find existing token by userId or create a new one to avoid unique constraint
        // violations
        PasswordResetToken myToken = passwordResetTokenRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    PasswordResetToken newToken = new PasswordResetToken();
                    newToken.setUser(user);
                    return newToken;
                });

        myToken.setToken(token);
        myToken.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(15));
        myToken.setUsed(false);

        passwordResetTokenRepository.saveAndFlush(myToken);

        return token;
    }

    @Override
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        java.util.Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        if (tokenOpt.isPresent()) {
            PasswordResetToken resetToken = tokenOpt.get();
            if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                return false;
            }

            User user = resetToken.getUser();
            user.setUserPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));
                
        if (!passwordEncoder.matches(currentPassword, user.getUserPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác.");
        }
        
        if (passwordEncoder.matches(newPassword, user.getUserPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
        }
        
        user.setUserPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
