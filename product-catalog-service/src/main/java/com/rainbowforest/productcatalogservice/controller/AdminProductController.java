package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.util.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import com.rainbowforest.productcatalogservice.entity.Review;
import com.rainbowforest.productcatalogservice.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/admin")
@Transactional
public class AdminProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private com.rainbowforest.productcatalogservice.repository.FlashSaleItemRepository flashSaleItemRepository;

    @PostMapping(value = "/products")
    public ResponseEntity<?> addProduct(@RequestBody Product product, HttpServletRequest request){
    	if(product != null) {
            // Kiểm tra các trường bắt buộc để tránh lỗi 500 do Database constraint
            if (product.getProductName() == null || product.getProductName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Tên sản phẩm không được để trống");
            }
            if (product.getPrice() == null) {
                return ResponseEntity.badRequest().body("Giá sản phẩm không được để trống");
            }
            if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Danh mục không được để trống");
            }

    		try {
    			Product savedProduct = productService.addProduct(product);
    	        return new ResponseEntity<Product>(
    	        		savedProduct,
    	        		headerGenerator.getHeadersForSuccessPostMethod(request, savedProduct.getId()),
    	        		HttpStatus.CREATED);
    		} catch (Exception e) {
				e.printStackTrace();
				// Trả về thông báo lỗi chi tiết để debug
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .headers(headerGenerator.getHeadersForError())
                        .body("Lỗi hệ thống khi lưu sản phẩm: " + e.getMessage());
			}
    	}
    	return ResponseEntity.badRequest().body("Dữ liệu sản phẩm không hợp lệ");       
    }
    
    @DeleteMapping(value = "/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id){
    	Product product = productService.getProductById(id);
    	if(product != null) {
    		try {
                // 1. Xóa các đánh giá liên quan
                List<Review> reviews = reviewRepository.findByProductId(id);
                if (reviews != null && !reviews.isEmpty()) {
                    reviewRepository.deleteAll(reviews);
                }

                // 2. Xóa khỏi các chương trình Flash Sale
                flashSaleItemRepository.deleteByProductId(id);

                // 3. Cuối cùng mới xóa sản phẩm
    			productService.deleteProduct(id);
    	        return new ResponseEntity<Void>(
    	        		headerGenerator.getHeadersForSuccessGetMethod(),
    	        		HttpStatus.OK);
    		}catch (Exception e) {
				e.printStackTrace();
    	        return new ResponseEntity<Void>(
    	        		headerGenerator.getHeadersForError(),
    	        		HttpStatus.INTERNAL_SERVER_ERROR);
			}
    	}
    	return new ResponseEntity<Void>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);      
    }

    @PutMapping(value = "/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable("id") Long id, @RequestBody Product product, HttpServletRequest request){
        Product currentProduct = productService.getProductById(id);
        if(currentProduct != null) {
            try {
                currentProduct.setProductName(product.getProductName());
                currentProduct.setPrice(product.getPrice());
                currentProduct.setDiscription(product.getDiscription());
                currentProduct.setCategory(product.getCategory());
                currentProduct.setAvailability(product.getAvailability());
                currentProduct.setBrandId(product.getBrandId());
                currentProduct.setSizes(product.getSizes());
                currentProduct.setColors(product.getColors());
                currentProduct.setActive(product.getActive());
                currentProduct.setVariants(product.getVariants());
                
                // Cập nhật danh sách ảnh từ request vào thực thể hiện tại
                currentProduct.setImages(product.getImages());
                if (currentProduct.getImages() == null && product.getImage() != null) {
                    List<String> imgs = new ArrayList<>();
                    imgs.add(product.getImage());
                    currentProduct.setImages(imgs);
                }
                
                // Gọi addProduct để xử lý lưu file ảnh và lưu vào database
                Product savedProduct = productService.addProduct(currentProduct);
                
                return new ResponseEntity<Product>(
                        savedProduct,
                        headerGenerator.getHeadersForSuccessPostMethod(request, savedProduct.getId()),
                        HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<Product>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<Product>(HttpStatus.NOT_FOUND);
    }



    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getAllReviews() {
        try {
            List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();
            System.out.println("Admin fetching all reviews. Count: " + reviews.size());
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/reviews/test")
    public ResponseEntity<List<Review>> testReviews() {
        List<Review> testList = new ArrayList<>();
        Review r = new Review();
        r.setId(999L);
        r.setContent("Test review from backend");
        r.setUserName("System Test");
        r.setRating(5);
        r.setStatus("VISIBLE");
        testList.add(r);
        return ResponseEntity.ok(testList);
    }

    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepository.findByProductId(productId));
    }

    @PutMapping("/reviews/{id}/status")
    public ResponseEntity<Review> updateReviewStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        return reviewRepository.findById(id).map(review -> {
            review.setStatus(payload.get("status"));
            return ResponseEntity.ok(reviewRepository.save(review));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reviews/{id}/reply")
    public ResponseEntity<Review> replyReview(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        return reviewRepository.findById(id).map(review -> {
            review.setReply(payload.get("reply"));
            return ResponseEntity.ok(reviewRepository.save(review));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reviews/stats")
    public ResponseEntity<java.util.Map<String, Object>> getReviewStats() {
        try {
            List<Review> reviews = reviewRepository.findAll();
            java.util.Map<String, Object> stats = new java.util.HashMap<>();
            long total = reviews.size();
            stats.put("totalCount", total);
            stats.put("averageRating", reviews.stream().mapToInt(Review::getRating).average().orElse(0.0));
            
            // Calculate distribution
            java.util.Map<String, Integer> distribution = new java.util.HashMap<>();
            for (int i = 1; i <= 5; i++) distribution.put(String.valueOf(i), 0);
            
            System.out.println("DEBUG - Processing " + reviews.size() + " reviews for stats");
            for (Review r : reviews) {
                int rating = r.getRating();
                System.out.println("DEBUG - Review ID: " + r.getId() + ", Rating: " + rating);
                if (rating >= 1 && rating <= 5) {
                    String key = String.valueOf(rating);
                    distribution.put(key, distribution.get(key) + 1);
                }
            }
            stats.put("distribution", distribution);
            
            System.out.println("DEBUG - Final Stats Map: " + stats);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
