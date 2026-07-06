package com.example.backend.service;

import com.example.backend.model.PostTag;
import com.example.backend.repository.PostTagRepository;
import org.springframework.stereotype.Service;

@Service
public class PostTagService extends GenericCrudService<PostTag, PostTagRepository> {
	// Moved the service code to the GenericCrudService to avoid code duplication with CategoryService

	public PostTagService(PostTagRepository tagRepository) {
		super(tagRepository);
	}

}