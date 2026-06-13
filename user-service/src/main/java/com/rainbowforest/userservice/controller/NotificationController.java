package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.Notification;
import com.rainbowforest.userservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.rainbowforest.userservice.repository.UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @PostMapping("/mark-as-read/{id}")
    public Notification markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @PostMapping("/mark-all-read/{userId}")
    public void markAllRead(@PathVariable Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @PostMapping("/create")
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationRepository.save(notification);
    }

    @PostMapping("/broadcast")
    public void broadcastNotification(@RequestBody Notification notification) {
        // This is a simple implementation: find all users and create a notification for each.
        // In a real system, you might use a more efficient approach like a 'global' notification flag.
        List<com.rainbowforest.userservice.entity.User> users = userRepository.findAll();
        for (com.rainbowforest.userservice.entity.User user : users) {
            Notification n = new Notification();
            n.setUserId(user.getId());
            n.setTitle(notification.getTitle());
            n.setContent(notification.getContent());
            n.setType(notification.getType());
            n.setLink(notification.getLink());
            notificationRepository.save(n);
        }
    }

    @PostMapping("/notify-admins")
    public void notifyAdmins(@RequestBody Notification notification) {
        List<com.rainbowforest.userservice.entity.User> users = userRepository.findAll();
        for (com.rainbowforest.userservice.entity.User user : users) {
            if (user.getRole() != null && "ADMIN".equals(user.getRole().getRoleName())) {
                Notification n = new Notification();
                n.setUserId(user.getId());
                n.setTitle(notification.getTitle());
                n.setContent(notification.getContent());
                n.setType(notification.getType());
                n.setLink(notification.getLink());
                notificationRepository.save(n);
            }
        }
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
    }
}
