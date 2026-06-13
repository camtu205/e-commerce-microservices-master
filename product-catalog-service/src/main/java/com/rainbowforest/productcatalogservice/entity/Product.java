package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

@Entity
@Table (name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "product_name")
    @NotNull
    private String productName;

    @Column (name = "price")
    @NotNull
    private BigDecimal price;

    @Column (name = "discription")
    private String discription;

    @Column (name = "category")
    @NotNull
    private String category;

    @Column (name = "availability")
    private Integer availability = 0;

    @Column (name = "image", columnDefinition = "LONGTEXT")
    private String image;

    @Column(name = "brand_id")
    private Long brandId;

    @Column(name = "images", columnDefinition = "LONGTEXT")
    @JsonIgnore
    private String imagesJson;

    @Column(name = "sizes")
    private String sizes;

    @Column(name = "colors")
    private String colors;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "active", columnDefinition = "int default 1")
    private Integer active = 1;

    @Column(name = "sales_count", columnDefinition = "int default 0")
    private Integer salesCount = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductVariant> variants = new ArrayList<>();

    public List<ProductVariant> getVariants() {
        return variants;
    }

    public void setVariants(List<ProductVariant> variants) {
        this.variants.clear();
        if (variants != null) {
            for (ProductVariant v : variants) {
                v.setProduct(this);
                this.variants.add(v);
            }
            // Cập nhật số lượng tổng vào field availability để lưu vào DB
            this.availability = this.variants.stream().mapToInt(ProductVariant::getStock).sum();
        }
    }

    public Integer getSalesCount() {
        return (this.salesCount == null) ? 0 : this.salesCount;
    }

    public void setSalesCount(Integer salesCount) {
        this.salesCount = (salesCount == null) ? 0 : salesCount;
    }

    public Integer getActive() {
        return (this.active == null) ? 1 : this.active;
    }

    public void setActive(Integer active) {
        if (active == null) {
            this.active = 1;
        } else {
            this.active = active;
        }
    }

    public Long getBrandId() {
        return brandId;
    }

    public void setBrandId(Long brandId) {
        this.brandId = brandId;
    }

	public Product() {

	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getDiscription() {
		return discription;
	}

	public void setDiscription(String discription) {
		this.discription = discription;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public Integer getAvailability() {
        if (variants != null && !variants.isEmpty()) {
            return variants.stream().mapToInt(ProductVariant::getStock).sum();
        }
		return availability != null ? availability : 0;
	}

	public void setAvailability(Integer availability) {
		this.availability = availability;
	}

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    @JsonProperty("images")
    public List<String> getImages() {
        if (imagesJson == null || imagesJson.isEmpty() || imagesJson.equals("null") || imagesJson.equals("[]")) return new ArrayList<>();
        try {
            return new ObjectMapper().readValue(imagesJson, new TypeReference<List<String>>(){});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @JsonIgnore
    public String getImagesRaw() {
        return imagesJson;
    }

    @JsonSetter("images")
    public void setImages(Object images) {
        if (images instanceof String) {
            this.imagesJson = (String) images;
        } else if (images instanceof List) {
            try {
                this.imagesJson = new ObjectMapper().writeValueAsString(images);
            } catch (Exception e) {
                this.imagesJson = "[]";
            }
        }
    }

    public String getSizes() {
        return sizes;
    }

    public void setSizes(String sizes) {
        this.sizes = sizes;
    }

    public String getColors() {
        return colors;
    }

    public void setColors(String colors) {
        this.colors = colors;
    }

    public Double getAverageRating() {
        return averageRating != null ? averageRating : 0.0;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount != null ? reviewCount : 0;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    @PrePersist
    @PreUpdate
    private void syncAvailability() {
        if (variants != null && !variants.isEmpty()) {
            this.availability = variants.stream().mapToInt(ProductVariant::getStock).sum();
        }
    }
}
