package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

@Entity
@Table(name = "categories")
@Data
@Schema(description = "Categories that posts can belong to")
public class Category implements GenericModel {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean approved;

    public Category() {}

    public Category(String name) {
        this.name = name;
        this.approved = true;
    }
}