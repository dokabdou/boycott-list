package com.example.backend.service;

import com.example.backend.model.Category;
import com.example.backend.model.Post;
import com.example.backend.repository.CategoryRepository;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class CategoryService extends GenericCrudService<Category, CategoryRepository> {
	// Moved the service code to the GenericCrudService to avoid code duplication with TagService

	//private final MongoTemplate mongoTemplate;

	public CategoryService(CategoryRepository categoryRepository/* , MongoTemplate mongoTemplate */) {
		super(categoryRepository);
		//this.mongoTemplate = mongoTemplate;
	}

	// Only methods specific to CategoryService should be added here. All common CRUD operations are handled by GenericCrudService.

	/* public void renameInPosts(String oldName, String newName) {
        Query query = new Query(Criteria.where("category").is(oldName));
        Update update = new Update().set("category", newName);
        mongoTemplate.updateMulti(query, update, Post.class);
    }

    // Remove category from all posts
    public void removeFromPosts(String name) {
        Query query = new Query(Criteria.where("category").is(name));
        Update update = new Update().unset("category");
        mongoTemplate.updateMulti(query, update, Post.class);
    } */
}
