package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.FlashSale;
import com.rainbowforest.productcatalogservice.entity.FlashSaleItem;
import com.rainbowforest.productcatalogservice.service.FlashSaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/flash-sales")
@Transactional
public class FlashSaleController {

    @Autowired
    private FlashSaleService flashSaleService;

    @Autowired
    private com.rainbowforest.productcatalogservice.feignclient.UserClient userClient;

    private void broadcastFlashSale(String name) {
        try {
            com.rainbowforest.productcatalogservice.dto.Notification notification = new com.rainbowforest.productcatalogservice.dto.Notification();
            notification.setTitle("Sự kiện Flash Sale mới!");
            notification.setContent("Sự kiện '" + name + "' đang diễn ra với ưu đãi cực khủng. Hãy nhanh tay săn ngay!");
            notification.setType("PROMOTION");
            notification.setLink("/flash-sale");
            userClient.broadcastNotification(notification);
        } catch (Exception e) {
            System.err.println("Failed to broadcast flash sale: " + e.getMessage());
        }
    }

    @GetMapping
    public List<FlashSale> getAll() {
        return flashSaleService.getAllFlashSales();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashSale> getById(@PathVariable Long id) {
        FlashSale fs = flashSaleService.getFlashSaleById(id);
        return fs != null ? ResponseEntity.ok(fs) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<FlashSale> create(@RequestBody FlashSale fs) {
        FlashSale created = flashSaleService.createFlashSale(fs);
        broadcastFlashSale(created.getTitle());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashSale> update(@PathVariable Long id, @RequestBody FlashSale fs) {
        FlashSale updated = flashSaleService.updateFlashSale(id, fs);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        flashSaleService.deleteFlashSale(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<FlashSaleItem> addItem(@PathVariable Long id, @RequestBody FlashSaleItem item) {
        FlashSaleItem saved = flashSaleService.addItemToFlashSale(id, item);
        return saved != null ? new ResponseEntity<>(saved, HttpStatus.CREATED) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        flashSaleService.removeItemFromFlashSale(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/purchase/{itemId}")
    public ResponseEntity<?> purchaseItem(@PathVariable("itemId") Long itemId, @RequestParam String userId, @RequestParam int quantity) {
        try {
            boolean success = flashSaleService.purchaseFlashItem(itemId, userId, quantity);
            if (success) return ResponseEntity.ok().build();
            else return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
