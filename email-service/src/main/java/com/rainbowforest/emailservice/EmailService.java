package com.rainbowforest.emailservice;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    public void sendHtmlMessage(EmailRequest request) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, 
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, 
                StandardCharsets.UTF_8.name());

        Context context = new Context();
        context.setVariables(request.getTemplateModel());

        String html = templateEngine.process(request.getTemplateName(), context);

        helper.setTo(request.getTo());
        helper.setText(html, true);
        helper.setSubject(request.getSubject());
        helper.setFrom("ctushop@rainbowforest.com");

        emailSender.send(message);
    }
}
