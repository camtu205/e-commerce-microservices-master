package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.FlashSale;
import com.rainbowforest.productcatalogservice.entity.FlashSaleItem;
import com.rainbowforest.productcatalogservice.repository.FlashSaleRepository;
import com.rainbowforest.productcatalogservice.repository.FlashSaleItemRepository;
import com.rainbowforest.productcatalogservice.repository.FlashSalePurchaseRepository;
import com.rainbowforest.productcatalogservice.entity.FlashSalePurchase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FlashSaleService {

    @Autowired
    private FlashSaleRepository flashSaleRepository;

    @Autowired
    private FlashSaleItemRepository flashSaleItemRepository;

    @Autowired
    private FlashSalePurchaseRepository flashSalePurchaseRepository;

    public List<FlashSale> getAllFlashSales() {
        return flashSaleRepository.findAll();
    }

    public FlashSale getFlashSaleById(Long id) {
        return flashSaleRepository.findById(id).orElse(null);
    }

    @Transactional
    public FlashSale createFlashSale(FlashSale flashSale) {
        if (flashSale.getStatus() == null) {
            updateStatus(flashSale);
        }
        return flashSaleRepository.save(flashSale);
    }

    @Transactional
    public FlashSale updateFlashSale(Long id, FlashSale details) {
        FlashSale flashSale = flashSaleRepository.findById(id).orElse(null);
        if (flashSale != null) {
            flashSale.setTitle(details.getTitle());
            flashSale.setDescription(details.getDescription());
            flashSale.setStartTime(details.getStartTime());
            flashSale.setEndTime(details.getEndTime());
            flashSale.setStatus(details.getStatus());
            updateStatus(flashSale);
            return flashSaleRepository.save(flashSale);
        }
        return null;
    }

    @Transactional
    public void deleteFlashSale(Long id) {
        flashSaleRepository.deleteById(id);
    }

    @Transactional
    public FlashSaleItem addItemToFlashSale(Long flashSaleId, FlashSaleItem item) {
        FlashSale flashSale = flashSaleRepository.findById(flashSaleId).orElse(null);
        if (flashSale != null) {
            item.setFlashSale(flashSale);
            if (item.getAvailableQuantity() == 0) {
                item.setAvailableQuantity(item.getInitialQuantity());
            }
            return flashSaleItemRepository.save(item);
        }
        return null;
    }

    @Transactional
    public void removeItemFromFlashSale(Long itemId) {
        flashSaleItemRepository.deleteById(itemId);
    }

    @Transactional
    public boolean purchaseFlashItem(Long itemId, String userId, int quantity) {
        FlashSaleItem item = flashSaleItemRepository.findById(itemId).orElse(null);
        if (item == null) return false;

        // Rule 1 & 2: Check time and status
        FlashSale fs = item.getFlashSale();
        LocalDateTime now = LocalDateTime.now();
        if (!"Active".equals(fs.getStatus()) || now.isBefore(fs.getStartTime()) || now.isAfter(fs.getEndTime())) {
            throw new RuntimeException("Flash Sale is not active");
        }

        // Rule 3: Check user limit
        Integer purchased = flashSalePurchaseRepository.getTotalPurchasedByUser(userId, itemId);
        int alreadyPurchased = (purchased == null) ? 0 : purchased;
        if (alreadyPurchased + quantity > item.getMaxPerUser()) {
            throw new RuntimeException("User purchase limit reached (Max: " + item.getMaxPerUser() + ")");
        }

        // Rule 2.7: Atomic decrement
        int updated = flashSaleItemRepository.decrementQuantity(itemId, quantity);
        if (updated == 0) {
            throw new RuntimeException("Insufficient stock in Flash Sale");
        }

        // Record purchase
        FlashSalePurchase purchase = new FlashSalePurchase(userId, item, quantity);
        flashSalePurchaseRepository.save(purchase);
        
        return true;
    }

    private void updateStatus(FlashSale fs) {
        LocalDateTime now = LocalDateTime.now();
        if (fs.getStatus() != null && fs.getStatus().equals("Disabled")) return;
        
        if (now.isBefore(fs.getStartTime())) {
            fs.setStatus("Upcoming");
        } else if (now.isAfter(fs.getEndTime())) {
            fs.setStatus("Ended");
        } else {
            fs.setStatus("Active");
        }
    }

    @Scheduled(fixedRate = 60000) // Check every minute
    @Transactional
    public void autoUpdateStatuses() {
        List<FlashSale> sales = flashSaleRepository.findAll();
        for (FlashSale fs : sales) {
            String oldStatus = fs.getStatus();
            updateStatus(fs);
            if (!fs.getStatus().equals(oldStatus)) {
                flashSaleRepository.save(fs);
            }
        }
    }
}
