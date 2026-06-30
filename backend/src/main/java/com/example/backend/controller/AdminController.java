package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.model.Comment;
import com.example.backend.model.Suggestion;
import com.example.backend.service.PostService;
import com.example.backend.service.SuggestionService;
import com.example.backend.service.CommentService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PostService postService;
    private final SuggestionService suggestionService;
    private final CommentService commentService;
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

	@GetMapping("/suggestions")
	public List<Suggestion> getAllSuggestions() {
		return suggestionService.getAllSuggestions();
	}


	@PutMapping("/suggestions/{id}")
	public Suggestion updateSuggestion(@PathVariable String id,
									@RequestBody Map<String, String> body,
									Authentication auth) {
		String newContent = body.get("content");
		System.out.println("Admin " + auth.getName() + " updating suggestion " + id);
		return suggestionService.updateSuggestion(id, newContent);
	}

	@DeleteMapping("/suggestions/{id}")
	public ResponseEntity<?> deleteSuggestion(@PathVariable String id,
											Authentication auth) {
		System.out.println("Admin " + auth.getName() + " deleting suggestion " + id);
		suggestionService.deleteSuggestion(id);
		return ResponseEntity.ok().build();
	}

	@PutMapping("/comments/{id}")
	public Comment updateComment(@PathVariable String id,
								@RequestBody Map<String, String> body,
								Authentication auth) {
		String newContent = body.get("content");
		System.out.println("Admin " + auth.getName() + " updating comment " + id);
		return commentService.updateComment(id, newContent);
	}

	@DeleteMapping("/comments/{id}")
	public ResponseEntity<?> deleteComment(@PathVariable String id,
										Authentication auth) {
		System.out.println("Admin " + auth.getName() + " deleting comment " + id);
		commentService.deleteComment(id);
		return ResponseEntity.ok().build();
	}
}