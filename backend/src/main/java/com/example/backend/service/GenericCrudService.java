package com.example.backend.service;

import com.example.backend.model.GenericModel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public abstract class GenericCrudService<
    T extends GenericModel,
    R extends MongoRepository<T, String>
> {
	/**
	 * The repository used for CRUD operations.
	 * For Tags and Categories, in order to avoid code duplication because the service implementations are similar.
	 */

    protected final R repository;

    public GenericCrudService(R repository) {
        this.repository = repository;
    }

    public T create(T entity) {
        if (entity == null || entity.getName() == null || entity.getName().isBlank()) {
            return null;
        }
        Optional<T> existing = repository.findAll().stream()
                .filter(e -> e.getName().equalsIgnoreCase(entity.getName()))
                .findFirst();
        if (existing.isPresent()) {
            return null;
        }
        entity.setApproved(true);
        return repository.save(entity);
    }

    public List<T> createAll(List<T> entities) {
        if (entities == null) return List.of();
        return entities.stream()
                .map(this::create)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public T getById(String id) {
        return repository.findById(id).orElse(null);
    }

    public List<T> getAll() {
		List<T> result = repository.findAll();
		System.out.println("GET ALL :: " + result);
        return result;
    }

    public T updateById(String id, String newName) {
        T entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entity not found"));
        entity.setName(newName);
        return repository.save(entity);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }

    public void deleteSelected(List<String> entities) {
        if (entities != null) {
            entities.forEach(e -> repository.deleteById(e));
        }
    }

    public void deleteAll() {
        repository.deleteAll();
    }
}