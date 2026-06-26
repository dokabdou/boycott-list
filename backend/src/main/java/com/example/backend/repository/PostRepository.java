package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByStatus(Post.PostStatus status);
    // add methods for searching by tags, etc.
}