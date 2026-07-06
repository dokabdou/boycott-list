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
		post.setCategory(categoryService.create(post.getCategory()));
        post.setStatus(Post.PostStatus.APPROVED);  // auto‑approved
        post.setCreatedAt(Instant.now());
        post.setReviewedAt(Instant.now());
        post.setReviewedBy(adminUsername);
        post.setTags(tagService.createAll(post.getTags()));
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
        Optional<Post> opt = postRepository.findById(id);
        if (opt.isPresent()) {
            Post post = opt.get();
            post.setStatus(Post.PostStatus.APPROVED);
			post.setCategory(categoryService.create(post.getCategory()));
            post.setReviewedAt(Instant.now());
            post.setReviewedBy(adminUsername);
            post.setTags(tagService.createAll(post.getTags()));
			System.out.println("PostService ==> Approved post ID: " + post.getId() + " by admin: " + adminUsername);   // ← add this
            return postRepository.save(post);
        }
        throw new RuntimeException("Post not found");
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
		post.setCategory(updatedPost.getCategory());
		post.setDescription(updatedPost.getDescription());
		post.setSourceLinks(updatedPost.getSourceLinks());
		post.setTags(updatedPost.getTags());
		post.setHighlights(updatedPost.getHighlights());
		post.setTags(tagService.createAll(updatedPost.getTags()));   // add any new tags
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