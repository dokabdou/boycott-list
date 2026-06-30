package com.example.backend.repository;

import com.example.backend.model.Suggestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SuggestionRepository extends MongoRepository<Suggestion, String> {
    List<Suggestion> findByPostIdOrderByCreatedAtDesc(String postId);
	List<Suggestion> findAllByOrderByCreatedAtDesc();
}