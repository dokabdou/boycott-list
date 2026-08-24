package com.example.backend.service;

import com.example.backend.model.Category;
import com.example.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoryService extends GenericCrudService<Category, CategoryRepository> {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        super(categoryRepository);
        this.categoryRepository = categoryRepository;
    }

    @Override
    public Category create(Category category) {
        if (category == null || category.getName() == null || category.getName().isBlank()) {
            return null;
        }
        return categoryRepository.findByName(category.getName())
                .orElseGet(() -> {
                    Category newCat = new Category();
                    newCat.setName(category.getName());
                    newCat.setApproved(true);
                    newCat.setId(java.util.UUID.randomUUID().toString());
                    return categoryRepository.save(newCat);
                });
    }
}