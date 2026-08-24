package com.example.backend.repository;

import com.example.backend.model.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SuggestionRepository extends JpaRepository<Suggestion, String> {
    List<Suggestion> findByPostIdOrderByCreatedAtDesc(String postId);
    List<Suggestion> findAllByOrderByCreatedAtDesc();
}