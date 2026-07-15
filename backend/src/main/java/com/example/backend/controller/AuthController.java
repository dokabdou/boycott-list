package com.example.backend.controller;

import com.example.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    private void addJwtCookie(HttpServletResponse response, String token, int maxAge) {
		// For production HTTPS, always use Secure
		String secureFlag = "Secure; ";   // remove if you ever go back to HTTP
		String cookie = String.format(
			"jwt=%s; HttpOnly; Path=/; Max-Age=%d; SameSite=Lax; %s",
			token != null ? token : "", maxAge, secureFlag
		);
		response.addHeader("Set-Cookie", cookie);
	}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
                                   HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
        String token = jwtUtil.generateToken(username);

        addJwtCookie(response, token, 86_400);  // 1 day
        return ResponseEntity.ok(Map.of("message", "Login successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth != null && auth.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("username", auth.getName()));
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        addJwtCookie(response, null, 0);  // delete cookie
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}