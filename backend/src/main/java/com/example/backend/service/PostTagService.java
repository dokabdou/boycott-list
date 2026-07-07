package com.example.backend.service;

import com.example.backend.model.PostTag;
import com.example.backend.repository.PostTagRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class PostTagService extends GenericCrudService<PostTag, PostTagRepository> {
	// Moved the service code to the GenericCrudService to avoid code duplication with CategoryService
	private final MongoTemplate mongoTemplate;

    public PostTagService(PostTagRepository repository, MongoTemplate mongoTemplate) {
        super(repository);
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void deleteById(String id) {
        PostTag tag = getById(id);
        if (tag != null) {
            // Remove the tag from all posts that contain it
            Query query = new Query(Criteria.where("tags.name").is(tag.getName()));
            Update update = new Update().pull("tags", Query.query(Criteria.where("name").is(tag.getName())));
            mongoTemplate.updateMulti(query, update, "posts");
        }
        super.deleteById(id);
    }
}