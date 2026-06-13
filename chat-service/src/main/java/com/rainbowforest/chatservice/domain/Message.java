package com.rainbowforest.chatservice.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long conversationId;
    
    private Long senderId; // 0 for Admin/Shop
    private String senderName;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private LocalDateTime timestamp;
    
    private String type; // TEXT, PRODUCT
    private Long productId;
    private String productName;
    private String productImage;

    @PrePersist
    public void prePersist() {
        timestamp = LocalDateTime.now();
    }
}
