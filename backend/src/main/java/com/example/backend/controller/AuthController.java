package com.example.backend.controller;

import com.example.backend.security.JwtUtil;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;


	private Cookie buildJwtCookie(String token, int maxAge) {
		Cookie cookie = new Cookie("jwt", token);
		cookie.setHttpOnly(true);
		cookie.setPath("/");
		cookie.setMaxAge(maxAge);

		// Secure only over HTTPS – auto-detect
		// (Alternatively, you can use a config property)
		cookie.setSecure(false);   // ← FORCE FALSE for HTTP testing

		// Allow the cookie to be sent even if the request is cross-origin
		// (SameSite=None requires Secure, but you can omit if not cross-origin)
		cookie.setAttribute("SameSite", "Lax");
		return cookie;
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

		// Create HttpOnly cookie
		Cookie cookie = buildJwtCookie(token, 86_400);
		cookie.setHttpOnly(true);       // JavaScript can't read it
		cookie.setSecure(true);         // only sent over HTTPS
		cookie.setPath("/");            // available for all paths
		cookie.setMaxAge(86400);        // 1 day (matches token expiry)

		response.addCookie(cookie);

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
		Cookie cookie = buildJwtCookie(null, 0);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath("/");
		cookie.setMaxAge(0); // delete immediately
		response.addCookie(cookie);
		return ResponseEntity.ok(Map.of("message", "Logged out"));
	}
}