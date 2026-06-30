package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@Tag(name = "Ping", description = "Endpoint to check if the backend is running. (Template for future health checks)")
public class PingController {

    @GetMapping("/api/ping")
    @Operation(summary = "Check backend status",
               description = "Checks if the backend is running. (Template for future health checks)")
    public String ping() {
        return "pong from backend";
    }
}
