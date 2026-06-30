package com.example.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "suggestions")
@Data
public class Suggestion {
    @Id
    private String id;

    private String postId;
    private String author;       // always "anon wolf" or admin
    private String content;      // the suggestion text
    private Instant createdAt;
}