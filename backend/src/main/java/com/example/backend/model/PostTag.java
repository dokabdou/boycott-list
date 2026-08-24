package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

@Entity
@Table(name = "tags")
@Data
@Schema(description = "Tags that are associated to a post")
public class PostTag implements GenericModel {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean approved;

    public PostTag() {}

    public PostTag(String name) {
        this.name = name;
        this.approved = true;
    }
}