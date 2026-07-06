package com.example.backend.controller;

import com.example.backend.model.Category;
import com.example.backend.service.CategoryService;

import io.swagger.v3.oas.annotations.Operation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class CategoryController {

	private final CategoryService categoryService;
	// Categories are created in the AdminController when a post is approved, so we only need to provide endpoints to get categories here.

	@GetMapping("/{id}")
	@Operation(summary = "Get a category by id")
	public Category getCategoryById(@PathVariable String id) {
		return categoryService.getById(id);
	}

	@GetMapping("")
	@Operation(summary = "Get all approved categories")
	public List<Category> getAllCategories() {
		return categoryService.getAll();
	}

    /* private final MongoTemplate mongoTemplate;

    // Rename a category – update all posts that have the old category name
    @PutMapping("/{oldName}")
    public ResponseEntity<?> renameCategory(@PathVariable String oldName,
                                            @RequestBody Map<String, String> body) {
        String newName = body.get("newName");
        if (newName == null || newName.isBlank()) {
            return ResponseEntity.badRequest().body("newName is required");
        }

        Query query = new Query(Criteria.where("category").is(oldName));
        Update update = new Update().set("category", newName);
        mongoTemplate.updateMulti(query, update, Post.class);

        return ResponseEntity.ok().build();
    }

    // Delete a category – remove it from all posts
    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteCategory(@PathVariable String name) {
        Query query = new Query(Criteria.where("category").is(name));
        Update update = new Update().unset("category");   // removes the field
        mongoTemplate.updateMulti(query, update, Post.class);

        return ResponseEntity.ok().build();
    } */
}