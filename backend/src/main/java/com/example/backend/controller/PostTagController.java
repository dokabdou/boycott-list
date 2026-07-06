package com.example.backend.controller;

import com.example.backend.model.PostTag;
import com.example.backend.service.PostTagService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/public/tags")
@RequiredArgsConstructor
public class PostTagController {
	private final PostTagService tagService;

	// CRUD operations for tags can be added here if needed, such as updating or deleting tags.

	@GetMapping("/tag/{id}")
	@Operation(summary = "Get a tag by id")
	public PostTag getTagById(@PathVariable String id) {
		return tagService.getById(id);
	}

	@GetMapping("/approved")
	@Operation(summary = "Get all approved tags")
	public List<PostTag> getApprovedTags() {
		return tagService.getAll();
	}
}
