package com.example.backend.controller;

import com.example.backend.service.HomeDescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HomeDescriptionController {

    private final HomeDescriptionService homeDescriptionService;

    @GetMapping("/public/home-description")
    public ResponseEntity<Map<String, String>> getHomeDescription() {
        return ResponseEntity.ok(Map.of("content", homeDescriptionService.getHomeDescription()));
    }

    @PutMapping("/admin/home-description")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateHomeDescription(@RequestBody Map<String, String> body) {
        String newContent = body.get("content");
        if (newContent == null || newContent.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content is required"));
        }
        String updated = homeDescriptionService.updateHomeDescription(newContent);
        return ResponseEntity.ok(Map.of("content", updated));
    }
}