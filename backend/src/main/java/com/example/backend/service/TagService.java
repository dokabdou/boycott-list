package com.example.backend.service;

import com.example.backend.model.Tag;
import com.example.backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<Tag> getAllApprovedTags() {
        // For simplicity, we don't filter by approved – all tags are approved once added from an approved post.
        return tagRepository.findAll();
    }

    public void addNewTags(List<String> tagNames) {
        if (tagNames == null) return;
        for (String name : tagNames) {
            if (tagRepository.findByName(name).isEmpty()) {
                Tag tag = new Tag();
                tag.setName(name);
                tag.setApproved(true);   // only called after vetting
                tagRepository.save(tag);
            }
        }
    }
}