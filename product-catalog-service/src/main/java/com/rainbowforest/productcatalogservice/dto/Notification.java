package com.rainbowforest.productcatalogservice.dto;

import lombok.Data;

@Data
public class Notification {
    private Long userId;
    private String title;
    private String content;
    private String type; // ORDER, PROMOTION, SYSTEM
    private String link;
}
