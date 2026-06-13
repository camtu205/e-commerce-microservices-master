package com.rainbowforest.chatservice.controller;

import com.rainbowforest.chatservice.domain.Conversation;
import com.rainbowforest.chatservice.domain.Message;
import com.rainbowforest.chatservice.repository.ConversationRepository;
import com.rainbowforest.chatservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.rainbowforest.chatservice.domain.FAQ;
import com.rainbowforest.chatservice.repository.FAQRepository;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private FAQRepository faqRepository;

    @GetMapping("/admin/faqs")
    public List<FAQ> getAllFAQs() {
        return faqRepository.findAllByOrderByKeywordAsc();
    }

    @PostMapping("/admin/faqs")
    public FAQ createFAQ(@RequestBody FAQ faq) {
        faq.setCreatedAt(java.time.LocalDateTime.now());
        faq.setUpdatedAt(java.time.LocalDateTime.now());
        return faqRepository.save(faq);
    }

    @PutMapping("/admin/faqs/{id}")
    public ResponseEntity<FAQ> updateFAQ(@PathVariable Long id, @RequestBody FAQ faqDetails) {
        return faqRepository.findById(id).map(faq -> {
            faq.setKeyword(faqDetails.getKeyword());
            faq.setAnswer(faqDetails.getAnswer());
            faq.setUpdatedAt(java.time.LocalDateTime.now());
            return ResponseEntity.ok(faqRepository.save(faq));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/faqs/{id}")
    public ResponseEntity<Void> deleteFAQ(@PathVariable Long id) {
        return faqRepository.findById(id).map(faq -> {
            faqRepository.delete(faq);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private com.rainbowforest.chatservice.service.AssistantService assistantService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message chatMessage) {
        // Chỉ Bot trả lời tin nhắn của Khách (không trả lời tin nhắn của chính Bot hoặc Admin)
        boolean isFromCustomer = chatMessage.getSenderId() != null && chatMessage.getSenderId() > 0;
        
        System.out.println("Received message from: " + chatMessage.getSenderName() + " content: " + chatMessage.getContent());
        // 1. Save or Update Conversation
        Conversation conversation = conversationRepository.findById(chatMessage.getConversationId())
                .orElseGet(() -> {
                    Conversation newConv = new Conversation();
                    newConv.setCustomerId(chatMessage.getSenderId());
                    newConv.setCustomerName(chatMessage.getSenderName());
                    newConv.setLastMessage(chatMessage.getContent());
                    return conversationRepository.save(newConv);
                });
        
        conversation.setLastMessage(chatMessage.getContent());
        conversationRepository.save(conversation);

        // 2. Save Message
        Message savedMessage = messageRepository.save(chatMessage);
        System.out.println("--- MS CHAT: Tin nhan da luu vao DB ID: " + savedMessage.getId());

        try {
            // 3. Broadcast to Admin (Gửi cho Admin trước)
            System.out.println("--- MS CHAT: Dang gui broadcast toi /topic/admin-messages");
            messagingTemplate.convertAndSend("/topic/admin-messages", savedMessage);
            
            // 4. Send to specific Customer topic
            System.out.println("--- MS CHAT: Dang gui toi /topic/messages." + conversation.getCustomerId());
            messagingTemplate.convertAndSend("/topic/messages." + conversation.getCustomerId(), savedMessage);
            
            System.out.println("--- MS CHAT: Hoan tat gui tin nhan qua WebSocket");

            // 5. Trigger Virtual Assistant if from Customer
            if (isFromCustomer) {
                // Nếu là yêu cầu gặp nhân viên, không để Bot trả lời
                if (chatMessage.getContent() != null && chatMessage.getContent().contains("[YÊU CẦU GẶP NHÂN VIÊN]")) {
                    System.out.println("--- MS CHAT: KHACH YEU CAU GAP NHAN VIEN. Bot se khong tra loi.");
                    return;
                }

                new Thread(() -> {
                    try {
                        Thread.sleep(1500); // Giả lập thời gian suy nghĩ của Bot (1.5s)
                        String botReply = assistantService.analyzeAndReply(chatMessage);
                        assistantService.sendAssistantReply(conversation.getId(), conversation.getCustomerId(), botReply);
                    } catch (Exception e) {
                        System.err.println("--- MS CHAT: LOI TRO LY AO: " + e.getMessage());
                    }
                }).start();
            }
        } catch (Exception e) {
            System.err.println("--- MS CHAT: LOI KHI GUI WEBSOCKET: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @GetMapping("/history/{conversationId}")
    public List<Message> getChatHistory(@PathVariable Long conversationId) {
        return messageRepository.findAllByConversationIdOrderByTimestampAsc(conversationId);
    }

    @GetMapping("/conversations")
    public List<Conversation> getConversations() {
        return conversationRepository.findAllByOrderByUpdatedAtDesc();
    }

    @GetMapping("/conversation/customer/{customerId}")
    public Conversation getOrCreateConversation(@PathVariable Long customerId, @RequestParam String customerName) {
        return conversationRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation();
                    newConv.setCustomerId(customerId);
                    newConv.setCustomerName(customerName);
                    return conversationRepository.save(newConv);
                });
    }
}
