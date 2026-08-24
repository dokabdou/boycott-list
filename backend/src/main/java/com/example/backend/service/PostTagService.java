package com.example.backend.service;

import com.example.backend.model.PostTag;
import com.example.backend.repository.PostTagRepository;
import org.springframework.stereotype.Service;

@Service
public class PostTagService extends GenericCrudService<PostTag, PostTagRepository> {

    public PostTagService(PostTagRepository repository) {
        super(repository);
    }

    // If you need special logic for tag deletion affecting posts,
    // you'll have to implement it with a JPA query or separate service.
}