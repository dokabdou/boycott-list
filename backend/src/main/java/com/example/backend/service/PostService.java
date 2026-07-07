package com.example.backend.service;

import com.example.backend.model.Post;
import com.example.backend.model.PostTag;
import com.example.backend.model.Category;
import com.example.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostTagService tagService;
	private final CategoryService categoryService;

    public Post submitAnonymous(Post post) {
        post.setAnonymous(true);
        post.setSubmittedBy("anonymous");
        post.setStatus(Post.PostStatus.PENDING);
        post.setCreatedAt(Instant.now());
		//return postRepository.save(post);
		Post savedPost = postRepository.save(post);
		System.out.println("PostService ==> Saved anonymous post ID: " + savedPost.getId());   //
        return savedPost;
    }

    public Post submitByAdmin(Post post, String adminUsername) {
        post.setAnonymous(false);
        post.setSubmittedBy(adminUsername);
		
		Category createdCategory = categoryService.create(post.getCategory());
		post.setCategory(createdCategory.getName());


		post.setStatus(Post.PostStatus.APPROVED);  // auto‑approved
		post.setCreatedAt(Instant.now());
		post.setReviewedAt(Instant.now());
		post.setReviewedBy(adminUsername);

		// Tags are already on post (converted from strings via custom setter)
    	// Just ensure they exist in the tags collection
		tagService.createAll(post.getTags());
		//return postRepository.save(post);
		Post savedPost = postRepository.save(post);
		System.out.println("PostService ==> Saved post ID: " + savedPost.getId());   // ← add this
		return savedPost;
    }

    public List<Post> getPendingPosts() {
	List<Post> pendingPosts = postRepository.findByStatus(Post.PostStatus.PENDING);
	System.out.println("Retrieved pending posts count: " + pendingPosts.size());   // ←
        //return postRepository.findByStatus(Post.PostStatus.PENDING);
	System.out.println("PostService ==> Pending posts: " + pendingPosts); 
	return pendingPosts;
    }

    public List<Post> getApprovedPosts() {
        return postRepository.findByStatus(Post.PostStatus.APPROVED);
    }

    public Post approvePost(String id, String adminUsername) {
		Post post = postRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Post not found"));

		// Ensure category always has a valid, non-blank name
		if (post.getCategory() == null || post.getCategory().getName() == null || post.getCategory().getName().isBlank()) {
			post.setCategory("UnCategorized");
		}

		System.out.println("----- ApprovedPost :: " + post.getCategory());

		// Now category is guaranteed to be non-null and have a proper name
		Category createdCategory = categoryService.create(post.getCategory());
		post.setCategory(createdCategory.getName());

		post.setStatus(Post.PostStatus.APPROVED);
		post.setReviewedAt(Instant.now());
		post.setReviewedBy(adminUsername);
		tagService.createAll(post.getTags());

		System.out.println("PostService ==> Approved post ID: " + post.getId() + " by admin: " + adminUsername);
		return postRepository.save(post);
	}

    public Post rejectPost(String id, String adminUsername) {
        Optional<Post> opt = postRepository.findById(id);
        if (opt.isPresent()) {
            Post post = opt.get();
            post.setStatus(Post.PostStatus.REJECTED);
            post.setReviewedAt(Instant.now());
            post.setReviewedBy(adminUsername);
            return postRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }

	public List<String> getApprovedTags() {
		return tagService.getAll().stream()
				.map(PostTag::getName)
				.collect(Collectors.toList());
	}

	public Optional<Post> getPostById(String id) {
		return postRepository.findById(id);
	}

	public Post editPost(String id, Post updatedPost) {
		Post post = postRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Post not found"));
		post.setCompanyName(updatedPost.getCompanyName());

		if (updatedPost.getCategory() != null && !updatedPost.getCategory().getName().isBlank()) {
			post.setCategory(updatedPost.getCategory().getName());
		} else {
			post.setCategory("UnCategorized");
		}
		Category createdCategory = categoryService.create(post.getCategory());
		post.setCategory(createdCategory.getName());

		post.setDescription(updatedPost.getDescription());
		post.setSourceLinks(updatedPost.getSourceLinks());
		
		List<String> tagNames = updatedPost.getTags().stream()
            .map(PostTag::getName)
            .collect(Collectors.toList());
		post.setTags(tagNames);

		post.setHighlights(updatedPost.getHighlights());
		tagService.createAll(updatedPost.getTags());
		return postRepository.save(post);
	}

	public void deletePost(String id) {
		postRepository.deleteById(id);
	}

	public List<Post> getApprovedPostsByCategory(String category) {
		return postRepository.findByCategory(category).stream()
				.filter(p -> p.getStatus() == Post.PostStatus.APPROVED)
				.collect(Collectors.toList());
	}
}