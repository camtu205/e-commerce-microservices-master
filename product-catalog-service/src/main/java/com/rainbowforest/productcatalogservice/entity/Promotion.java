package com.rainbowforest.productcatalogservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    @NotNull
    private String title;

    @Column(name = "code", unique = true)
    @NotNull
    private String code;

    @Column(name = "discount")
    @NotNull
    private int discount;

    @Column(name = "valid_until")
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate validUntil;

    @Column(name = "usage_limit")
    private int usageLimit;

    @Column(name = "is_unlimited")
    private boolean isUnlimited;

    @Column(name = "applicable_products", columnDefinition = "TEXT")
    private String applicableProducts;

    public Promotion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getDiscount() { return discount; }
    public void setDiscount(int discount) { this.discount = discount; }

    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }

    public int getUsageLimit() { return usageLimit; }
    public void setUsageLimit(int usageLimit) { this.usageLimit = usageLimit; }

    public boolean isUnlimited() { return isUnlimited; }
    public void setUnlimited(boolean isUnlimited) { this.isUnlimited = isUnlimited; }

    public String getApplicableProducts() { return applicableProducts; }
    public void setApplicableProducts(String applicableProducts) { this.applicableProducts = applicableProducts; }
}
