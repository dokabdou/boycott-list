package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.model.Suggestion;
import com.example.backend.service.CommentService;
import com.example.backend.service.PostService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.model.Category;
import com.example.backend.model.Comment;
import com.example.backend.service.SuggestionService;
import java.util.Map;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/public")
@Tag(name = "Public", description = "Endpoints available to everyone (anonymous submissions, view posts, etc.)")
@RequiredArgsConstructor
public class PublicPostController {

    private final PostService postService;
	private final CommentService commentService;
	private final SuggestionService suggestionService;


	// Post management endpoints
    @PostMapping("/submit")
    @Operation(summary = "Submit a company anonymously",
               description = "Creates a new boycott post in PENDING status. Requires source links.")
    public Post submitAnonymous(@RequestBody Post post) {
        // Frontend will send companyName, description, sourceLinks, tags
        return postService.submitAnonymous(post);
    }

    @GetMapping("/posts")
    @Operation(summary = "Get approved posts",
               description = "Retrieves all approved boycott posts.")
    public List<Post> getApprovedPosts() {
		System.out.println("PublicPostController: Fetching approved posts");
		List<Post> approvedPosts = postService.getApprovedPosts();
		System.out.println("PublicPostController: Retrieved approved posts count: " + approvedPosts.size());
        return approvedPosts;
    }

	@GetMapping("/posts/{id}")
	@Operation(summary = "Get a post by ID",
			   description = "Retrieves a specific post by its ID.")
	public ResponseEntity<Post> getPost(@PathVariable String id) {
		return postService.getPostById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	// Tags 
	/* @GetMapping("/tags")
    @Operation(summary = "Get approved tags",
               description = "Retrieves all approved tags.")
    public List<String> getApprovedTags() {
        // return tag names only
        return postService.getApprovedTags();
    } */

	// Suggestions management endpoints

	@GetMapping("/posts/{postId}/suggestions")
	@Operation(summary = "Get suggestions for a post",
			   description = "Retrieves all suggestions for a specific post.")
	public List<Suggestion> getSuggestions(@PathVariable String postId) {
		return suggestionService.getSuggestionsForPost(postId);
	}

	@PostMapping("/posts/{postId}/suggestions")
	@Operation(summary = "Add a suggestion to a post",
			   description = "Adds a new suggestion to a specific post.")
	public Suggestion addSuggestion(@PathVariable String postId,
									@RequestBody Map<String, String> body) {
		String author = body.get("author");   // always "anon wolf"
		String content = body.get("content");
		return suggestionService.addSuggestion(postId, author, content);
	}


	// Comments management endpoints 
	@GetMapping("/posts/{postId}/comments")
	@Operation(summary = "Get comments for a post",
			   description = "Retrieves all comments for a specific post.")
	public List<Comment> getComments(@PathVariable String postId) {
		return commentService.getCommentsForPost(postId);
	}

	@PostMapping("/posts/{postId}/comments")
	@Operation(summary = "Add a comment to a post",
			   description = "Adds a new comment to a specific post.")
	public Comment addComment(@PathVariable String postId,
							@RequestBody Map<String, String> body) {
		String parentId = body.get("parentId");   // can be null
		String author = body.get("author");
		String content = body.get("content");
		return commentService.addComment(postId, parentId, author, content);
	}
}