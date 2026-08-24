package com.example.backend.repository;

import com.example.backend.model.PostTag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PostTagRepository extends JpaRepository<PostTag, String> {
    Optional<PostTag> findByName(String name);
}