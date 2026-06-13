package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.MembershipTier;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.repository.MembershipTierRepository;
import com.rainbowforest.userservice.repository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MembershipTierService {

    @Autowired
    private MembershipTierRepository membershipTierRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    public List<MembershipTier> getAllTiers() {
        return membershipTierRepository.findAllByActiveTrueOrderByTierOrderAsc();
    }

    public List<MembershipTier> getAllTiersForAdmin() {
        return membershipTierRepository.findAll();
    }

    @Transactional
    public MembershipTier saveTier(MembershipTier tier) {
        return membershipTierRepository.save(tier);
    }

    @Transactional
    public void deleteTier(Long id) {
        membershipTierRepository.deleteById(id);
    }

    @Autowired
    private com.rainbowforest.userservice.repository.UserRepository userRepository;

    @Transactional
    public void updateUserSpending(Long userId, Double amount) {
        com.rainbowforest.userservice.entity.User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getUserDetails() != null) {
            UserDetails details = user.getUserDetails();
            Double newSpending = (details.getTotalSpending() == null ? 0.0 : details.getTotalSpending()) + amount;
            details.setTotalSpending(newSpending);
            
            // Re-evaluate tier
            membershipTierRepository.findFittingTier(newSpending).ifPresent(details::setMembershipTier);
            
            userDetailsRepository.save(details);
        }
    }
}
