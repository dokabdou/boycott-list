package com.example.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

@Document(collection = "comments")
@Data
public class Comment {
    @Id
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    private String postId;       // reference to the Post
    private String parentId;     // null if top-level
    private String author;       // submitted by the user
    private String content;
    private Instant createdAt;
}