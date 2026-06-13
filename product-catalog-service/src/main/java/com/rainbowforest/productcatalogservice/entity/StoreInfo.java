package com.rainbowforest.productcatalogservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String storeName;
    private String address;
    private String phone;
    private String email;
    private String facebookUrl;
    private String instagramUrl;
    private String youtubeUrl;
    private String copyrightText;
    
    @Column(columnDefinition = "TEXT")
    private String aboutUs; // Short description for footer
}
