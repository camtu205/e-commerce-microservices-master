package com.rainbowforest.chatservice.repository;

import com.rainbowforest.chatservice.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByConversationIdOrderByTimestampAsc(Long conversationId);
}
