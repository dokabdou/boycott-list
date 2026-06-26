package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.service.PostService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PostService postService;

    @GetMapping("/pending")
    public List<Post> getPendingPosts() {
		System.out.println("AdminController: Fetching pending posts");
		List<Post> pendingPosts = postService.getPendingPosts();
		System.out.println("AdminController: Retrieved pending posts count: " + pendingPosts.size());
        return pendingPosts;
    }

    @PutMapping("/approve/{id}")
    public Post approve(@PathVariable String id, Authentication auth) {
        return postService.approvePost(id, auth.getName());
    }

    @PutMapping("/reject/{id}")
    public Post reject(@PathVariable String id, Authentication auth) {
        return postService.rejectPost(id, auth.getName());
    }

    @PostMapping("/posts")
    public Post createPost(@RequestBody Post post, Authentication auth) {
		System.out.println("AdminController: Creating post with info: " + post.info() + " by user: " + auth.getName());
        return postService.submitByAdmin(post, auth.getName());
    }

	@PutMapping("/posts/{id}")
	public Post editPost(@PathVariable String id, @RequestBody Post post, Authentication auth) {
		System.out.println("AdminController: Editing post " + id + " by " + auth.getName());
		return postService.editPost(id, post);
	}

	@DeleteMapping("/posts/{id}")
	public ResponseEntity<?> deletePost(@PathVariable String id, Authentication auth) {
		System.out.println("AdminController: Deleting post " + id + " by " + auth.getName());
		postService.deletePost(id);
		return ResponseEntity.ok().build();
	}
}