package com.example.backend.service;

import com.example.backend.model.Post;
import com.example.backend.model.Tag;
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
    private final TagService tagService;   // we'll create a simple tag service later

    public Post submitAnonymous(Post post) {
        post.setAnonymous(true);
        post.setSubmittedBy("anonymous");
        post.setStatus(Post.PostStatus.PENDING);
        post.setCreatedAt(Instant.now());
        // We'll handle tags later – ensure they exist or are pending
		//return postRepository.save(post);
		Post savedPost = postRepository.save(post);
		System.out.println("PostService ==> Saved anonymous post ID: " + savedPost.getId());   //
        return savedPost;
    }

    public Post submitByAdmin(Post post, String adminUsername) {
        post.setAnonymous(false);
        post.setSubmittedBy(adminUsername);
        post.setStatus(Post.PostStatus.APPROVED);  // auto‑approved
        post.setCreatedAt(Instant.now());
        post.setReviewedAt(Instant.now());
        post.setReviewedBy(adminUsername);
        // Process tags – add new tags to the approved tag list
        tagService.addNewTags(post.getTags());
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
            post.setReviewedAt(Instant.now());
            post.setReviewedBy(adminUsername);
            // Now add the tags to the global tag list
            tagService.addNewTags(post.getTags());
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
		return tagService.getAllApprovedTags().stream()
				.map(Tag::getName)
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
		// keep status, submitter, dates unchanged
		tagService.addNewTags(updatedPost.getTags());   // add any new tags
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

	public List<Post> searchByTag(String tag) {
		return postRepository.findByTagsContaining(tag).stream()
				.filter(p -> p.getStatus() == Post.PostStatus.APPROVED)
				.collect(Collectors.toList());
	}

	public List<String> getAllCategories() {
		return postRepository.findAll().stream()
				.map(Post::getCategory)
				.filter(Objects::nonNull)
				.distinct()
				.sorted()
				.collect(Collectors.toList());
	}
}