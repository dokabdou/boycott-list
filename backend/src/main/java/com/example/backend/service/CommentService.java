package com.example.backend.service;

import com.example.backend.model.Comment;
import com.example.backend.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public List<Comment> getCommentsForPost(String postId) {
        // We’ll return all comments for the post; frontend builds the tree
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    public Comment addComment(String postId, String parentId, String author, String content) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setParentId(parentId);
        comment.setAuthor(author);
        comment.setContent(content);
        comment.setCreatedAt(Instant.now());
        return commentRepository.save(comment);
    }
}