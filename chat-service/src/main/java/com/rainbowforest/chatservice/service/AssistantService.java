package com.rainbowforest.chatservice.service;

import com.rainbowforest.chatservice.domain.Message;
import com.rainbowforest.chatservice.feignclient.ProductClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
public class AssistantService {

    @Autowired
    private ProductClient productClient;

    @Autowired
    private com.rainbowforest.chatservice.repository.MessageRepository messageRepository;

    @Autowired
    private com.rainbowforest.chatservice.repository.FAQRepository faqRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private String normalizeString(String s) {
        if (s == null) return "";
        // Chuẩn hóa về NFC (Dựng sẵn) để so khớp tiếng Việt chính xác nhất
        return Normalizer.normalize(s, Normalizer.Form.NFC).toLowerCase().trim();
    }

    private String removeAccents(String s) {
        if (s == null) return "";
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replace('đ', 'd').replace('Đ', 'D').toLowerCase().trim();
    }

    public String analyzeAndReply(Message userMessage) {
        String originalContent = userMessage.getContent();
        String content = normalizeString(originalContent);
        String normalizedContent = removeAccents(originalContent);
        
        System.out.println("--- BOT: Dang phan tich tin nhan: " + originalContent);
        
        // 0. Hardcoded test keyword
        if (content.contains("testbot")) {
            return "Chào bạn! Tôi là Trợ lý ảo. Nếu bạn thấy tin nhắn này, nghĩa là logic xử lý của Bot đang hoạt động hoàn hảo!";
        }

        // 1. Kiểm tra FAQ từ Database
        try {
            List<com.rainbowforest.chatservice.domain.FAQ> faqs = faqRepository.findAll();
            if (faqs == null || faqs.isEmpty()) {
                System.out.println("--- BOT: [CANH BAO] Khong tim thay FAQ nao trong Database!");
            } else {
                System.out.println("--- BOT: Tim thay " + faqs.size() + " FAQ trong DB");
                for (com.rainbowforest.chatservice.domain.FAQ faq : faqs) {
                    // Tách các từ khóa bằng dấu phẩy (ví dụ: "chính hãng, real, fake" -> ["chính hãng", "real", "fake"])
                    String[] keywordParts = faq.getKeyword().split(",");
                    
                    for (String part : keywordParts) {
                        String keyword = normalizeString(part);
                        String normalizedKeyword = removeAccents(part);
                        
                        if (keyword.length() < 2) continue; // Bỏ qua các từ quá ngắn

                        if (content.contains(keyword) || normalizedContent.contains(normalizedKeyword)) {
                            System.out.println("--- BOT: MATCH THANH CONG! Tu khoa khớp: '" + keyword + "'");
                            return faq.getAnswer();
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("--- BOT: LOI TRUY VAN DATABASE: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 1. Giao tiếp cơ bản (Hardcoded fallback)
        if (content.contains("chào") || content.contains("hi") || content.contains("hello")) {
            return "Xin chào! Tôi là Trợ lý ảo của CTUS LUX. Tôi có thể giúp gì cho bạn? Bạn có thể hỏi về sản phẩm, giá cả hoặc chính sách giao hàng nhé!";
        }

        // 2. Chính sách giao hàng & Hệ thống
        if (content.contains("ship") || content.contains("giao hàng") || content.contains("phí vận chuyển")) {
            return "CTUS LUX miễn phí giao hàng cho đơn hàng từ 500k trở lên. Thời gian giao hàng từ 2-4 ngày làm việc tùy khu vực bạn nhé.";
        }

        if (content.contains("đổi trả") || content.contains("bảo hành")) {
            return "Chính sách của chúng tôi cho phép đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên tem mác và chưa qua sử dụng.";
        }

        // 3. Tư vấn sản phẩm theo giá
        if (content.contains("dưới") || content.contains("rẻ") || content.contains("giá thấp")) {
            try {
                List<Map<String, Object>> products = productClient.getAllProducts();
                double maxPrice = 500000; 
                
                String numeric = content.replaceAll("[^0-9]", "");
                if (!numeric.isEmpty()) {
                    maxPrice = Double.parseDouble(numeric);
                    if (maxPrice < 1000) maxPrice *= 1000; 
                }

                final double limit = maxPrice;
                List<Map<String, Object>> filtered = products.stream()
                        .filter(p -> {
                            Object priceObj = p.get("price");
                            if (priceObj instanceof Number) {
                                return ((Number) priceObj).doubleValue() <= limit;
                            }
                            return false;
                        })
                        .limit(3)
                        .collect(Collectors.toList());

                if (filtered.isEmpty()) {
                    return "Rất tiếc, hiện tại tôi chưa tìm thấy sản phẩm nào dưới " + (int)limit + " VNĐ. Bạn có muốn xem các sản phẩm khác không?";
                }

                StringBuilder reply = new StringBuilder("Đây là một số gợi ý sản phẩm dưới " + (int)limit + " VNĐ cho bạn:\n");
                for (Map<String, Object> p : filtered) {
                    reply.append("- ").append(p.get("productName"))
                         .append(": ").append(String.format("%,.0f", ((Number)p.get("price")).doubleValue())).append(" VNĐ\n");
                }
                reply.append("\nBạn nhấn vào danh mục sản phẩm để xem chi tiết nhé!");
                return reply.toString();
            } catch (Exception e) {
                return "Tôi đang gặp chút trục trặc khi lấy dữ liệu giá. Bạn vui lòng thử lại sau giây lát nhé!";
            }
        }

        // 4. Tư vấn theo tên/loại sản phẩm
        if (content.contains("có") && (content.contains("không") || content.contains("còn"))) {
            String searchName = content.replace("có", "").replace("không", "").replace("còn", "").trim();
            if (searchName.length() > 2) {
                try {
                    List<Map<String, Object>> products = productClient.getProductsByName(searchName);
                    if (!products.isEmpty()) {
                        Map<String, Object> p = products.get(0);
                        return "Vâng, sản phẩm '" + p.get("productName") + "' vẫn còn hàng bạn nhé. Giá của sản phẩm là " + 
                               String.format("%,.0f", ((Number)p.get("price")).doubleValue()) + " VNĐ.";
                    }
                } catch (Exception e) {}
            }
        }

        return "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Tôi sẽ chuyển tin nhắn này cho nhân viên tư vấn, bạn đợi một chút nhé! 👩‍💼";
    }

    public void sendAssistantReply(Long conversationId, Long customerId, String replyContent) {
        Message botMsg = new Message();
        botMsg.setConversationId(conversationId);
        botMsg.setSenderId(0L); 
        botMsg.setSenderName("Trợ lý ảo");
        botMsg.setContent(replyContent);
        botMsg.setTimestamp(LocalDateTime.now());
        botMsg.setType("TEXT");

        // Luôn lưu vào Database để có thể xem lại lịch sử
        messageRepository.save(botMsg);
        System.out.println("--- BOT: Da luu tin nhan phan hoi vao DB");

        // Broadcast tới cả khách và admin
        messagingTemplate.convertAndSend("/topic/messages." + customerId, botMsg);
        messagingTemplate.convertAndSend("/topic/admin-messages", botMsg);
        System.out.println("--- BOT: Da gui tin nhan qua WebSocket toi /topic/messages." + customerId);
    }
}
