package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "home_description")
@Data
public class HomeDescription {

    @Id
    private Long id = 1L;   // single row

    @Column(columnDefinition = "TEXT")
    private String content;

    public HomeDescription() {}

    public HomeDescription(String content) {
        this.content = content;
    }
}