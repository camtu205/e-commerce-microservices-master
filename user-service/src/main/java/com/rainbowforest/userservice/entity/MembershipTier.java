package com.rainbowforest.userservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "membership_tiers")
public class MembershipTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tier_name", nullable = false, unique = true)
    private String tierName;

    @Column(name = "min_spending")
    private Double minSpending = 0.0;

    @Column(name = "max_spending")
    private Double maxSpending;

    @Column(name = "description")
    private String description;

    @Column(name = "discount_percent")
    private Double discountPercent = 0.0;

    @Column(name = "free_shipping")
    private boolean freeShipping = false;

    @Column(name = "priority_flash_sale")
    private boolean priorityFlashSale = false;

    @Column(name = "reward_multiplier")
    private Integer rewardMultiplier = 1;

    @Column(name = "active")
    private boolean active = true;

    @Column(name = "tier_order")
    private Integer tierOrder = 0;

    public MembershipTier() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTierName() {
        return tierName;
    }

    public void setTierName(String tierName) {
        this.tierName = tierName;
    }

    public Double getMinSpending() {
        return minSpending;
    }

    public void setMinSpending(Double minSpending) {
        this.minSpending = minSpending;
    }

    public Double getMaxSpending() {
        return maxSpending;
    }

    public void setMaxSpending(Double maxSpending) {
        this.maxSpending = maxSpending;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(Double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public boolean isFreeShipping() {
        return freeShipping;
    }

    public void setFreeShipping(boolean freeShipping) {
        this.freeShipping = freeShipping;
    }

    public boolean isPriorityFlashSale() {
        return priorityFlashSale;
    }

    public void setPriorityFlashSale(boolean priorityFlashSale) {
        this.priorityFlashSale = priorityFlashSale;
    }

    public Integer getRewardMultiplier() {
        return rewardMultiplier;
    }

    public void setRewardMultiplier(Integer rewardMultiplier) {
        this.rewardMultiplier = rewardMultiplier;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getTierOrder() {
        return tierOrder;
    }

    public void setTierOrder(Integer tierOrder) {
        this.tierOrder = tierOrder;
    }
}
