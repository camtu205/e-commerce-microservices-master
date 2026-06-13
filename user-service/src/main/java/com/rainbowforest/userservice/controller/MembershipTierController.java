package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.MembershipTier;
import com.rainbowforest.userservice.service.MembershipTierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts/membership-tiers")
public class MembershipTierController {

    @Autowired
    private MembershipTierService membershipTierService;

    @GetMapping
    public List<MembershipTier> getAll() {
        return membershipTierService.getAllTiers();
    }

    @GetMapping("/admin")
    public List<MembershipTier> getAllForAdmin() {
        return membershipTierService.getAllTiersForAdmin();
    }

    @PostMapping
    public MembershipTier save(@RequestBody MembershipTier tier) {
        return membershipTierService.saveTier(tier);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        membershipTierService.deleteTier(id);
        return ResponseEntity.ok().build();
    }

    // Internal call from Order Service to update spending
    @PostMapping("/update-spending/{userId}")
    public ResponseEntity<Void> updateSpending(@PathVariable Long userId, @RequestParam Double amount) {
        membershipTierService.updateUserSpending(userId, amount);
        return ResponseEntity.ok().build();
    }
}

