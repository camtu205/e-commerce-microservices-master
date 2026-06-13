package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipTierRepository extends JpaRepository<MembershipTier, Long> {
    
    List<MembershipTier> findAllByActiveTrueOrderByTierOrderAsc();

    @Query("SELECT mt FROM MembershipTier mt WHERE mt.active = true AND mt.minSpending <= :spending AND (mt.maxSpending IS NULL OR mt.maxSpending >= :spending) ORDER BY mt.tierOrder DESC LIMIT 1")
    Optional<MembershipTier> findFittingTier(Double spending);
}
