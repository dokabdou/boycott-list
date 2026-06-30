package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByStatus(Post.PostStatus status);
	List<Post> findByCategory(String category);
	List<Post> findByTagsContaining(String tag);
    // add methods for searching by tags, etc.
}