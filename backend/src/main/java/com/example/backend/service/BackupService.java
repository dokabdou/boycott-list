package com.example.backend.service;

import com.example.backend.model.Post;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupService {

    private final PostService postService;
    private final ObjectMapper objectMapper;

    @Value("${backup.directory:/backups}")
    private String backupDirectory;

    /**
     * Automatic backup every day at 23:00 – only exports on the last day of the month.
     */
    @Scheduled(cron = "0 0 23 * * ?")
    public void scheduledMonthlyBackup() {
        LocalDate today = LocalDate.now();
        int lastDay = YearMonth.from(today).lengthOfMonth();

        if (today.getDayOfMonth() == lastDay) {
            log.info("Last day of month detected – running automatic monthly backup.");
            exportMonthlyBackup();
        } else {
            log.info("Not the last day of the month – skipping automatic backup.");
        }
    }

    public String exportImmediateBackup() {
        log.info("Creating immediate backup...");
        return doExport("Monthly_Backup_" + LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")) + ".json");
    }

    public String exportMonthlyBackup() {
        log.info("Creating monthly backup...");
        return doExport("Monthly_Backup_all_posts_" + LocalDate.now()
                .format(DateTimeFormatter.ISO_DATE) + ".json");
    }

    private String doExport(String filename) {
        try {
            List<Post> posts = postService.getAllPosts();
            log.debug("Found {} posts to export", posts.size());

            File dir = new File(backupDirectory);
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                if (created) {
                    log.info("Created backup directory: {}", dir.getAbsolutePath());
                } else {
                    log.warn("Backup directory already exists or could not be created: {}", dir.getAbsolutePath());
                }
            }

            File file = new File(dir, filename);
            objectMapper.writeValue(file, posts);

            log.info("Backup written successfully to: {}", file.getAbsolutePath());
            return file.getAbsolutePath();
        } catch (Exception e) {
            log.error("Failed to create backup '{}': {}", filename, e.getMessage(), e);
            throw new RuntimeException("Failed to create backup: " + filename, e);
        }
    }
}