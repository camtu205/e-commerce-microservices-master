package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Banner;
import com.rainbowforest.productcatalogservice.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    // Public API: Get all active banners
    @GetMapping("/banners")
    public List<Banner> getActiveBanners() {
        return bannerRepository.findAllByIsActiveOrderByOrderIndexAsc(true);
    }

    // Admin APIs
    @GetMapping("/admin/banners")
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    @PostMapping("/admin/banners")
    public Banner createBanner(@RequestBody Banner banner) {
        return bannerRepository.save(banner);
    }

    @PutMapping("/admin/banners/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        return bannerRepository.findById(id)
                .map(banner -> {
                    banner.setImageUrl(bannerDetails.getImageUrl());
                    banner.setTitle(bannerDetails.getTitle());
                    banner.setSubtitle(bannerDetails.getSubtitle());
                    banner.setLinkUrl(bannerDetails.getLinkUrl());
                    banner.setOrderIndex(bannerDetails.getOrderIndex());
                    banner.setIsActive(bannerDetails.getIsActive());
                    return ResponseEntity.ok(bannerRepository.save(banner));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/banners/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        return bannerRepository.findById(id)
                .map(banner -> {
                    bannerRepository.delete(banner);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
