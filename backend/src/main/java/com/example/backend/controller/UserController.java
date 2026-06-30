package com.example.backend.controller;

import com.example.backend.model.AppUser;
import com.example.backend.repository.AppUserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@Tag(name = "User", description = "Endpoints for managing users (Template for future user management)")
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository repo;

    public UserController(AppUserRepository repo) {
        this.repo = repo;
    }

    @GetMapping
	@Operation(summary = "List all users",
			   description = "Retrieves a list of all users. This is a template for future user management.")
    public List<AppUser> list() {
        return repo.findAll();
    }

    @PostMapping
	@Operation(summary = "Create a new user",
			   description = "Creates a new user. This is a template for future user management.")	
    public AppUser create(@RequestBody AppUser user) {
        return repo.save(user);
    }
}