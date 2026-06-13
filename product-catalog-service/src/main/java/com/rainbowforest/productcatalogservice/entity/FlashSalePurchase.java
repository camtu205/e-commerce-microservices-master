package com.rainbowforest.productcatalogservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "flash_sale_purchases")
public class FlashSalePurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    @ManyToOne
    @JoinColumn(name = "flash_sale_item_id")
    private FlashSaleItem flashSaleItem;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "purchase_time")
    private LocalDateTime purchaseTime;

    public FlashSalePurchase() {}

    public FlashSalePurchase(String userId, FlashSaleItem flashSaleItem, int quantity) {
        this.userId = userId;
        this.flashSaleItem = flashSaleItem;
        this.quantity = quantity;
        this.purchaseTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public FlashSaleItem getFlashSaleItem() { return flashSaleItem; }
    public void setFlashSaleItem(FlashSaleItem flashSaleItem) { this.flashSaleItem = flashSaleItem; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public LocalDateTime getPurchaseTime() { return purchaseTime; }
    public void setPurchaseTime(LocalDateTime purchaseTime) { this.purchaseTime = purchaseTime; }
}
