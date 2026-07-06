package com.example.backend.repository;

import com.example.backend.model.PostTag;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface PostTagRepository extends MongoRepository<PostTag, String> {
    Optional<PostTag> findByName(String name);
}