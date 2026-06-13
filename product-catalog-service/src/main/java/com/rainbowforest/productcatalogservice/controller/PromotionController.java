package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Promotion;
import com.rainbowforest.productcatalogservice.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/promotions")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private com.rainbowforest.productcatalogservice.feignclient.UserClient userClient;

    private void broadcastPromotion(String title, String code) {
        try {
            com.rainbowforest.productcatalogservice.dto.Notification notification = new com.rainbowforest.productcatalogservice.dto.Notification();
            notification.setTitle("Khuyến mãi mới: " + title);
            notification.setContent("Sử dụng mã " + code + " để nhận ưu đãi ngay hôm nay!");
            notification.setType("PROMOTION");
            notification.setLink("/promotions");
            userClient.broadcastNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to broadcast promotion: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    @GetMapping("/{code}")
    public ResponseEntity<Promotion> getPromotionByCode(@PathVariable String code) {
        return promotionRepository.findByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin")
    public Promotion savePromotion(@RequestBody Promotion promotion) {
        Promotion saved = promotionRepository.save(promotion);
        broadcastPromotion(saved.getTitle(), saved.getCode());
        return saved;
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotionDetails) {
        return promotionRepository.findById(id)
                .map(promotion -> {
                    promotion.setTitle(promotionDetails.getTitle());
                    promotion.setCode(promotionDetails.getCode());
                    promotion.setDiscount(promotionDetails.getDiscount());
                    promotion.setValidUntil(promotionDetails.getValidUntil());
                    promotion.setUsageLimit(promotionDetails.getUsageLimit());
                    promotion.setUnlimited(promotionDetails.isUnlimited());
                    promotion.setApplicableProducts(promotionDetails.getApplicableProducts());
                    return ResponseEntity.ok(promotionRepository.save(promotion));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        if (promotionRepository.existsById(id)) {
            promotionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
