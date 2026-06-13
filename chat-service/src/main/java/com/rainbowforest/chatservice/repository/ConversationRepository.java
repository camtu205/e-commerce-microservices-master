package com.rainbowforest.chatservice.repository;

import com.rainbowforest.chatservice.domain.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByCustomerId(Long customerId);
    List<Conversation> findAllByOrderByUpdatedAtDesc();
}
