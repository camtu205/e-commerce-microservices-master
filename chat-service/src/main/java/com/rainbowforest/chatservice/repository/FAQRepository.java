package com.rainbowforest.chatservice.repository;

import com.rainbowforest.chatservice.domain.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FAQRepository extends JpaRepository<FAQ, Long> {
    List<FAQ> findAllByOrderByKeywordAsc();
}
