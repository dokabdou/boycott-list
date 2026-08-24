package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByStatus(Post.PostStatus status);
    List<Post> findByCategory(String category);
    List<Post> findAllByOrderByCreatedAtDesc();
}