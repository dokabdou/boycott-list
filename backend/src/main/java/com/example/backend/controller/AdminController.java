package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.model.PostTag;
import com.example.backend.model.Comment;
import com.example.backend.model.Category;
import com.example.backend.model.Suggestion;


import com.example.backend.service.PostService;
import com.example.backend.service.SuggestionService;
import com.example.backend.service.CommentService;
import com.example.backend.service.PostTagService;
import com.example.backend.service.CategoryService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Endpoints for admin users to manage posts, suggestions, tags, categories, and comments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PostService postService;
    private final SuggestionService suggestionService;
    private final CommentService commentService;
	private final PostTagService postTagService;
	private final CategoryService categoryService;
	

	// Post management endpoints for admins

    @GetMapping("/pending")
    @Operation(summary = "Get pending posts",
               description = "Retrieves all pending boycott posts.")	
    public List<Post> getPendingPosts() {
		System.out.println("AdminController: Fetching pending posts");
		List<Post> pendingPosts = postService.getPendingPosts();
		System.out.println("AdminController: Retrieved pending posts count: " + pendingPosts.size());
        return pendingPosts;
    }

	@PostMapping("/posts")
	@Operation(summary = "Create a post",
			   description = "Creates a new boycott post. Admins can create posts directly without going through the pending state.")
    public Post createPost(@RequestBody Post post, Authentication auth) {
		System.out.println("AdminController: Creating post with info: " + post.info() + " by user: " + auth.getName());
        return postService.submitByAdmin(post, auth.getName());
    }
	

    @PutMapping("/approve/{id}")
    @Operation(summary = "Approve a post",
               description = "Approves a pending boycott post.")
    public Post approve(@PathVariable String id, Authentication auth) {
        return postService.approvePost(id, auth.getName());
    }

    @PutMapping("/reject/{id}")
	@Operation(summary = "Reject a post",
			   description = "Rejects a pending boycott post.")
    public Post reject(@PathVariable String id, Authentication auth) {
        return postService.rejectPost(id, auth.getName());
    }

	@PutMapping("/posts/{id}")
	@Operation(summary = "Edit a post",
			   description = "Edits an existing boycott post.")
	public Post editPost(@PathVariable String id, @RequestBody Post post, Authentication auth) {
		System.out.println("AdminController: Editing post " + id + " by " + auth.getName());
		return postService.editPost(id, post);
	}

	@DeleteMapping("/posts/{id}")
	@Operation(summary = "Delete a post",
			   description = "Deletes an existing boycott post.")
	public ResponseEntity<?> deletePost(@PathVariable String id, Authentication auth) {
		System.out.println("AdminController: Deleting post " + id + " by " + auth.getName());
		postService.deletePost(id);
		return ResponseEntity.ok().build();
	}


	// Suggestion management endpoints for admins

	@GetMapping("/suggestions")
	@Operation(summary = "Get all suggestions",
			   description = "Retrieves all suggestions.")
	public List<Suggestion> getAllSuggestions() {
		return suggestionService.getAllSuggestions();
	}


	@PutMapping("/suggestions/{id}")
	@Operation(summary = "Update a suggestion",
			   description = "Updates an existing suggestion.")
	public Suggestion updateSuggestion(@PathVariable String id,
									@RequestBody Map<String, String> body,
									Authentication auth) {
		String newContent = body.get("content");
		System.out.println("Admin " + auth.getName() + " updating suggestion " + id);
		return suggestionService.updateSuggestion(id, newContent);
	}

	@DeleteMapping("/suggestions/{id}")
	@Operation(summary = "Delete a suggestion",
			   description = "Deletes an existing suggestion.")
	public ResponseEntity<?> deleteSuggestion(@PathVariable String id,
											Authentication auth) {
		System.out.println("Admin " + auth.getName() + " deleting suggestion " + id);
		suggestionService.deleteSuggestion(id);
		return ResponseEntity.ok().build();
	}


	// Comments management endpoints for admins

	@PutMapping("/comments/{id}")	
	@Operation(summary = "Update a comment",
			   description = "Updates an existing comment.")
	public Comment updateComment(@PathVariable String id,
								@RequestBody Map<String, String> body,
								Authentication auth) {
		String newContent = body.get("content");
		System.out.println("Admin " + auth.getName() + " updating comment " + id);
		return commentService.updateComment(id, newContent);
	}

	@DeleteMapping("/comments/{id}")
	@Operation(summary = "Delete a comment",
			   description = "Deletes an existing comment.")
	public ResponseEntity<?> deleteComment(@PathVariable String id,
										Authentication auth) {
		System.out.println("Admin " + auth.getName() + " deleting comment " + id);
		commentService.deleteComment(id);
		return ResponseEntity.ok().build();
	}


	// Tags management endpoints for admins

	@PostMapping("/tags/create")
	@Operation(summary = "Create a new tag",
			   description = "Creates a new tag. Only called after vetting.")
	public PostTag createTag(@RequestBody PostTag tag) {
		postTagService.create(tag);
		PostTag result = postTagService.create(tag);
		System.out.println("Create TAG :: " + result);
		return result;
	}
	
	@PostMapping("/tags/create-multiple")
	@Operation(summary = "Add new tags",
			   description = "Adds new tags to the system. Only called after vetting.")
	public ResponseEntity<?> addNewTags(@RequestBody List<PostTag> tags) {
		postTagService.createAll(tags);
		System.out.println("Create TAGSSS :: ");
		return ResponseEntity.ok().build();
	}

	@PutMapping("/tags/{id}")
	@Operation(summary = "Update a tag")
	public PostTag updateTag(@PathVariable String id, @RequestBody String newNameString) {
		System.out.println("UPDATE TAG :: ");
		return postTagService.updateById(id, newNameString);
	}

	@DeleteMapping("/tags/{id}")
	@Operation(summary = "Delete a tag",
			   description = "Deletes an existing tag. Only called after vetting.")
	public ResponseEntity<?> deleteTag(@PathVariable String id) {
		System.out.println("DELETE TAG :: " + id);
		postTagService.deleteById(id);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/tags/deleteSelected")
	@Operation(summary = "Delete all the tags")
	public ResponseEntity<?> deleteSelectedTags(List<String> tagIds) {
		System.out.println("DELETE TAGSS :: ");
		postTagService.deleteSelected(tagIds);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/tags/deleteAll")
	@Operation(summary = "Delete all the tags")
	public ResponseEntity<?> deleteAllTags() {
		System.out.println("DELETE ALL TAGS  :: ");
		postTagService.deleteAll();
		return ResponseEntity.ok().build();
	}

	// Categories management endpoints for admins

	@PostMapping("/categories/create")
	@Operation(summary = "Create a new category",
			   description = "Creates a new category. Only called after vetting.")
	public Category createCategory(@RequestBody Category category) {
		System.out.println("CREATE CAT :: ");
		return categoryService.create(category);
	}
	
	@PostMapping("/categories/create-multiple")
	@Operation(summary = "Add new categories",
			   description = "Adds new categories to the system. Only called after vetting.")
	public ResponseEntity<?> addNewCategories(@RequestBody List<Category> categories) {
		System.out.println("ADD CATSSS :: ");
		categoryService.createAll(categories);
		return ResponseEntity.ok().build();
	}

	@PutMapping("/categories/{id}")
	@Operation(summary = "Update a category")
	public Category updateCategory(@PathVariable String id, @RequestBody String newNameString) {
		System.out.println("UDAPTE CAT :: ");
		return categoryService.updateById(id, newNameString);
	}

	@DeleteMapping("/categories/{id}")
	@Operation(summary = "Delete a category")
	public ResponseEntity<?> deleteCategory(@PathVariable String id) {
		System.out.println("DEELTE CAT :: ");
		categoryService.deleteById(id);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/categories/deleteSelected")
	@Operation(summary = "Delete all selected categories")
	public ResponseEntity<?> deleteSelectedCategories(List<String> categoryIds) {
		System.out.println("DELETE CATSSS :: ");
		categoryService.deleteSelected(categoryIds);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/categories/deleteAll")
	@Operation(summary = "Delete all categories")
	public ResponseEntity<?> deleteAllCategories() {
		System.out.println("DELETE ALLL CATSS :: ");
		categoryService.deleteAll();
		return ResponseEntity.ok().build();
	}


	// IMPORT EXPORT posts
	// Export all posts
	@GetMapping("/export/posts")
	public List<Post> exportAllPosts() {
		return postService.getAllPosts();
	}

	// Import a single post
	@PostMapping("/import/single")
	public Post importSinglePost(@RequestBody Post post) {
		return postService.importPost(post);
	}

	// Bulk import
	@PostMapping("/import/bulk")
	public List<Post> importBulkPosts(@RequestBody List<Post> posts) {
		return postService.importPosts(posts);
	}
}