package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.service.CommentService;
import com.example.backend.service.PostService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.model.Comment;
import com.example.backend.service.CommentService;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicPostController {

    private final PostService postService;
	private final CommentService commentService;

    @PostMapping("/submit")
    public Post submitAnonymous(@RequestBody Post post) {
        // Frontend will send companyName, description, sourceLinks, tags
        return postService.submitAnonymous(post);
    }

    @GetMapping("/posts")
    public List<Post> getApprovedPosts() {
        return postService.getApprovedPosts();
    }

    @GetMapping("/tags")
    public List<String> getApprovedTags() {
        // return tag names only
        return postService.getApprovedTags();
    }

	@GetMapping("/posts/{postId}/comments")
	public List<Comment> getComments(@PathVariable String postId) {
		return commentService.getCommentsForPost(postId);
	}

	@PostMapping("/posts/{postId}/comments")
	public Comment addComment(@PathVariable String postId,
							@RequestBody Map<String, String> body) {
		String parentId = body.get("parentId");   // can be null
		String author = body.get("author");
		String content = body.get("content");
		return commentService.addComment(postId, parentId, author, content);
	}

	@GetMapping("/posts/{id}")
	public ResponseEntity<Post> getPost(@PathVariable String id) {
		return postService.getPostById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}
}