package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.util.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import com.rainbowforest.productcatalogservice.entity.Review;
import com.rainbowforest.productcatalogservice.repository.ReviewRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.feignclient.OrderClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
@Transactional
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping (value = "/products")
    public ResponseEntity<List<Product>> getAllProducts(){
        List<Product> products =  productService.getAllActiveProduct();
        if(!products.isEmpty()) {
        	return new ResponseEntity<List<Product>>(
        			products,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);       
    }

    @GetMapping(value = "/products", params = "category")
    public ResponseEntity<List<Product>> getAllProductByCategory(@RequestParam ("category") String category){
        List<Product> products = productService.getAllActiveProductByCategory(category);
        if(!products.isEmpty()) {
        	return new ResponseEntity<List<Product>>(
        			products,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/products/{id}")
    public ResponseEntity<Product> getOneProductById(@PathVariable ("id") long id){
        Product product =  productService.getProductById(id);
        if(product != null) {
        	return new ResponseEntity<Product>(
        			product,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<Product>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/products", params = "name")
    public ResponseEntity<List<Product>> getAllProductsByName(@RequestParam ("name") String name){
        List<Product> products =  productService.getAllActiveProductsByName(name);
        if(!products.isEmpty()) {
        	return new ResponseEntity<List<Product>>(
        			products,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping("/products/images/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getProductImage(@PathVariable String fileName) {
        try {
            java.nio.file.Path path = java.nio.file.Paths.get("product-images/" + fileName);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderClient orderClient;

    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "VISIBLE");
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        // Rule 1: Only buyers can review
        boolean hasBought = orderClient.hasPurchasedProduct(review.getUserId(), review.getProductId());
        if (!hasBought) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn chỉ có thể đánh giá sản phẩm đã mua.");
        }

        // Rule 2: One review per product per user
        if (reviewRepository.existsByUserIdAndProductId(review.getUserId(), review.getProductId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Bạn đã đánh giá sản phẩm này rồi.");
        }

        // Rule 3: Rating 1-5
        if (review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Rating phải từ 1 đến 5 sao.");
        }

        review.setCreatedAt(java.time.LocalDateTime.now());
        review.setUpdatedAt(java.time.LocalDateTime.now());
        review.setStatus("VISIBLE");
        Review savedReview = reviewRepository.save(review);

        // Rule 4: Update average rating
        updateProductRating(review.getProductId());

        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }

    @PostMapping("/reviews/{id}/useful")
    public ResponseEntity<Review> markUseful(@PathVariable Long id) {
        return reviewRepository.findById(id).map(review -> {
            review.setIsUseful(review.getIsUseful() + 1);
            return ResponseEntity.ok(reviewRepository.save(review));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void updateProductRating(Long productId) {
        productRepository.findById(productId).ifPresent(product -> {
            List<Review> reviews = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "VISIBLE");
            int count = reviews.size();
            double average = reviews.stream()
                    .mapToInt(r -> r.getRating() != null ? r.getRating() : 0)
                    .average()
                    .orElse(0.0);
            
            product.setReviewCount(count);
            product.setAverageRating(Math.round(average * 10.0) / 10.0);
            productRepository.saveAndFlush(product);
            System.out.println("Updated Product " + productId + ": Rating=" + product.getAverageRating() + ", Count=" + count);
        });
    }

    @PutMapping("/products/{id}/increment-sales")
    public ResponseEntity<Void> incrementSales(@PathVariable Long id, @RequestParam int quantity) {
        productService.incrementSalesCount(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/products/{id}/reduce-variant-stock")
    public ResponseEntity<Void> reduceVariantStock(
            @PathVariable Long id, 
            @RequestParam String color, 
            @RequestParam String size, 
            @RequestParam int quantity) {
        productService.reduceVariantStock(id, color, size, quantity);
        return ResponseEntity.ok().build();
    }
}
