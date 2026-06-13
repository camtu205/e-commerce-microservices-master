package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.StoreInfo;
import com.rainbowforest.productcatalogservice.repository.StoreInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/store-info")
@CrossOrigin(origins = "*")
public class StoreInfoController {

    @Autowired
    private StoreInfoRepository repository;

    @GetMapping
    public StoreInfo getStoreInfo() {
        List<StoreInfo> all = repository.findAll();
        if (all.isEmpty()) {
            // Return default if empty
            return new StoreInfo(null, "CTUS LUX Heritage", "123 Ninh Kieu, Can Tho", "0123456789", "contact@ctuslux.com", "#", "#", "#", "© 2026 CTUS LUX. All rights reserved.", "Phong cách là cách để nói bạn là ai mà không cần phải nói.");
        }
        return all.get(0);
    }

    @PostMapping
    public StoreInfo saveStoreInfo(@RequestBody StoreInfo info) {
        List<StoreInfo> all = repository.findAll();
        if (!all.isEmpty()) {
            info.setId(all.get(0).getId());
        }
        return repository.save(info);
    }
}
