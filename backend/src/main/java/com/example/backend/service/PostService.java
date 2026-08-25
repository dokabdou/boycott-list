package com.example.backend.service;

import com.example.backend.model.*;
import com.example.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostTagService tagService;
    private final CategoryService categoryService;
	private final NotificationService notificationService;

    private String generateId() {
        return UUID.randomUUID().toString();
    }

    public Post submitAnonymous(Post post) {
        post.setId(generateId());
		post.setAnonymous(true);
		post.setSubmittedBy("anonymous");
		post.setStatus(Post.PostStatus.PENDING);
		post.setCreatedAt(Instant.now());

		Post savedPost = postRepository.save(post);

		// Send notifications (async)
		notificationService.notifyAnonymousSubmission(savedPost);

		return savedPost;
    }

    public Post submitByAdmin(Post post, String adminUsername) {
        post.setId(generateId());
        post.setAnonymous(false);
        post.setSubmittedBy(adminUsername);
        post.setStatus(Post.PostStatus.APPROVED);
        post.setCreatedAt(Instant.now());
        post.setReviewedAt(Instant.now());
        post.setReviewedBy(adminUsername);

        // Ensure category exists
        if (post.getCategory() != null && !post.getCategory().isBlank()) {
            Category cat = new Category(post.getCategory());
            cat = categoryService.create(cat);
            post.setCategory(cat != null ? cat.getName() : "UnCategorized");
        } else {
            post.setCategory("UnCategorized");
        }

        // Ensure tags exist (optional – only create missing tags in DB)
        if (post.getTags() != null) {
            tagService.createAll(post.getTags().stream().map(PostTag::new).toList());
        }
        return postRepository.save(post);
    }

    public List<Post> getPendingPosts() {
        return postRepository.findByStatus(Post.PostStatus.PENDING);
    }

    public List<Post> getApprovedPosts() {
        return postRepository.findByStatus(Post.PostStatus.APPROVED);
    }

    public Post approvePost(String id, String adminUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setStatus(Post.PostStatus.APPROVED);
        post.setReviewedAt(Instant.now());
        post.setReviewedBy(adminUsername);

        if (post.getCategory() == null || post.getCategory().isBlank()) {
            post.setCategory("UnCategorized");
        }
        // Ensure category exists in categories table
        Category cat = new Category(post.getCategory());
        cat = categoryService.create(cat);
        post.setCategory(cat != null ? cat.getName() : "UnCategorized");
        return postRepository.save(post);
    }

    public Post rejectPost(String id, String adminUsername) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setStatus(Post.PostStatus.REJECTED);
        post.setReviewedAt(Instant.now());
        post.setReviewedBy(adminUsername);
        return postRepository.save(post);
    }

    public List<String> getApprovedTags() {
        return tagService.getAll().stream().map(PostTag::getName).toList();
    }

    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

    public Post editPost(String id, Post updatedPost) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setCompanyName(updatedPost.getCompanyName());
        post.setCategory(updatedPost.getCategory());
        post.setDescription(updatedPost.getDescription());
        post.setSourceLinks(updatedPost.getSourceLinks());
        post.setTags(updatedPost.getTags());
        post.setHighlights(updatedPost.getHighlights());

        // Ensure category exists
        if (post.getCategory() != null && !post.getCategory().isBlank()) {
            Category cat = new Category(post.getCategory());
            cat = categoryService.create(cat);
            post.setCategory(cat != null ? cat.getName() : "UnCategorized");
        }

        // Update tags collection
        if (post.getTags() != null) {
            tagService.createAll(post.getTags().stream().map(PostTag::new).toList());
        }
        return postRepository.save(post);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

	public void deletePosts(List<String> ids) {
		postRepository.deleteAllById(ids);
	}

    public List<Post> getApprovedPostsByCategory(String category) {
        return postRepository.findByCategory(category).stream()
                .filter(p -> p.getStatus() == Post.PostStatus.APPROVED)
                .toList();
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

	public Post importPost(Post post) {
		post.setId(UUID.randomUUID().toString());
		if (post.getStatus() == null) post.setStatus(Post.PostStatus.PENDING);
		if (post.getCreatedAt() == null) post.setCreatedAt(Instant.now());

		post.setReviewedAt(Instant.now());

		if (post.getCategory() != null && !post.getCategory().isBlank()) {
			Category category = new Category(post.getCategory());
			Category created = categoryService.create(category);
			post.setCategory(created != null ? created.getName() : "UnCategorized");
		} else {
			post.setCategory("UnCategorized");
		}
		if (post.getTags() != null) {
			tagService.createAll(post.getTags().stream().map(PostTag::new).toList());
		}

		return postRepository.save(post);
	}

	public List<Post> importPosts(List<Post> posts) {
		return posts.stream()
				.map(this::importPost)
				.toList();
	}
}