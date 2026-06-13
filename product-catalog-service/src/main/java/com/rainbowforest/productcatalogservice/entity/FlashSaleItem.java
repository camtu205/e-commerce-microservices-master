package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "flash_sale_items")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FlashSaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "flash_sale_id")
    @JsonIgnore
    private FlashSale flashSale;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "flash_price")
    @NotNull
    private BigDecimal flashPrice;

    @Column(name = "initial_quantity")
    private Integer initialQuantity = 0;

    @Column(name = "available_quantity")
    private Integer availableQuantity = 0;

    @Column(name = "max_per_user")
    private Integer maxPerUser;

    public FlashSaleItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FlashSale getFlashSale() { return flashSale; }
    public void setFlashSale(FlashSale flashSale) { this.flashSale = flashSale; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public BigDecimal getFlashPrice() { return flashPrice; }
    public void setFlashPrice(BigDecimal flashPrice) { this.flashPrice = flashPrice; }

    public Integer getInitialQuantity() {
        return initialQuantity != null ? initialQuantity : 0;
    }

    public void setInitialQuantity(Integer initialQuantity) {
        this.initialQuantity = initialQuantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity != null ? availableQuantity : 0;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public Integer getMaxPerUser() { return maxPerUser; }
    public void setMaxPerUser(Integer maxPerUser) { this.maxPerUser = maxPerUser; }
}
