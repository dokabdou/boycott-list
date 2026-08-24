package com.example.backend.service;

import com.example.backend.model.Suggestion;
import com.example.backend.repository.SuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final SuggestionRepository suggestionRepository;

    public List<Suggestion> getAllSuggestions() {
        return suggestionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Suggestion> getSuggestionsForPost(String postId) {
        return suggestionRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    public Suggestion addSuggestion(String postId, String author, String content) {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(UUID.randomUUID().toString());
        suggestion.setPostId(postId);
        suggestion.setAuthor(author);
        suggestion.setContent(content);
        suggestion.setCreatedAt(Instant.now());
        return suggestionRepository.save(suggestion);
    }

    public Suggestion updateSuggestion(String id, String newContent) {
        Suggestion suggestion = suggestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Suggestion not found"));
        suggestion.setContent(newContent);
        return suggestionRepository.save(suggestion);
    }

    public void deleteSuggestion(String id) {
        suggestionRepository.deleteById(id);
    }
}