package com.example.backend.service;

import com.example.backend.model.Post;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final RestTemplate restTemplate;
    private final JavaMailSender mailSender;

    @Value("${DISCORD_WEBHOOK_URL:}")
    private String discordWebhookUrl;

    @Value("${NOTIFICATION_EMAIL_TO:}")
    private String emailTo;

    @Value("${NOTIFICATION_EMAIL_ENABLED:true}")
    private boolean emailEnabled;

    @Async
    public void notifyAnonymousSubmission(Post post) {
        if (post == null) {
            log.warn("Notification skipped because post is null");
            return;
        }

        log.info("Processing anonymous submission notification for company: {}", post.getCompanyName());

        // Discord
        if (!discordWebhookUrl.isBlank()) {
            try {
                sendDiscordNotification(post);
                log.info("Discord notification sent for {}", post.getCompanyName());
            } catch (Exception e) {
                log.error("Failed to send Discord notification for {}: {}", post.getCompanyName(), e.getMessage());
            }
        } else {
            log.warn("Discord webhook URL is blank, skipping Discord notification");
        }

        // Email
        if (emailEnabled && !emailTo.isBlank()) {
            try {
                sendEmailNotification(post);
                log.info("Email notification sent to {} for {}", emailTo, post.getCompanyName());
            } catch (Exception e) {
                log.error("Failed to send email notification for {}: {}", post.getCompanyName(), e.getMessage());
            }
        } else {
            log.warn("Email notification skipped: emailEnabled={}, emailTo='{}'", emailEnabled, emailTo);
        }
    }

    private void sendDiscordNotification(Post post) {
        Map<String, Object> embed = new HashMap<>();
        embed.put("title", "⚠️ New Boycott Submission");
        embed.put("color", 0xFF6B35);
        embed.put("description", String.format("**%s** submitted.", post.getCompanyName()));

        List<Map<String, Object>> fields = new ArrayList<>();
        fields.add(field("Company", post.getCompanyName(), true));
        fields.add(field("Categorie", post.getCategory() != null ? post.getCategory() : "Uncategorized", true));
        fields.add(field("Date", post.getCreatedAt() != null ? post.getCreatedAt().toString() : "N/A", true));
        fields.add(field("Description", truncate(post.getDescription(), 150), false));
        if (post.getSourceLinks() != null && !post.getSourceLinks().isEmpty()) {
            fields.add(field("Sources", String.join("\n", post.getSourceLinks()), false));
        }

        embed.put("fields", fields);

        Map<String, Object> payload = new HashMap<>();
        payload.put("embeds", List.of(embed));

        restTemplate.postForObject(discordWebhookUrl, payload, String.class);
    }

    private Map<String, Object> field(String name, String value, boolean inline) {
        Map<String, Object> f = new HashMap<>();
        f.put("name", name);
        f.put("value", value);
        f.put("inline", inline);
        return f;
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "N/A";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }

    private void sendEmailNotification(Post post) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(emailTo);
            helper.setSubject("New boycott submission: " + post.getCompanyName());

            String html = buildEmailTemplate(post);
            helper.setText(html, true);

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildEmailTemplate(Post post) {
        String company = post.getCompanyName();
        String category = post.getCategory() != null ? post.getCategory() : "Uncategorized";
        String description = post.getDescription() != null ? post.getDescription() : "No description provided.";
        String sources = post.getSourceLinks() != null
                ? String.join("<br>", post.getSourceLinks())
                : "None";

        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0b1e33; color: white; padding: 16px;">
                        <h2 style="margin: 0;">⚠️ New Boycott Submission</h2>
                    </div>
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <p><strong>Company:</strong> %s</p>
                        <p><strong>Category:</strong> %s</p>
                        <p><strong>Description:</strong><br>%s</p>
                        <p><strong>Sources:</strong><br>%s</p>
                        <p style="margin-top: 30px; font-size: 12px; color: #777;">Submitted anonymously via The Boycott List</p>
                    </div>
                </div>
                """.formatted(company, category, escapeHtml(description), escapeHtml(sources));
    }

    private String escapeHtml(String text) {
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;")
                   .replace("\n", "<br>");
    }
}