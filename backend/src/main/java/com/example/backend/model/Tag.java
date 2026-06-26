package com.example.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tags")
@Data
public class Tag {
    @Id
    private String id;
    private String name;
    private boolean approved;   // true if it comes from an approved post
}