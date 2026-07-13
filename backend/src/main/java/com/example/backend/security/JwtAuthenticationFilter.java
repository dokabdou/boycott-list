package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
	protected void doFilterInternal(HttpServletRequest request,
									HttpServletResponse response,
									FilterChain filterChain)
			throws ServletException, IOException {

		String authHeader = request.getHeader("Authorization");

		// If no token is present, just continue (do NOT return 403)
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = authHeader.substring(7);
		try {
			// Fallback extraction of username (subject) from JWT payload when JwtUtil lacks extractUsername
			String username = null;
			try {
				String[] parts = token.split("\\.");
				if (parts.length > 1) {
					String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
					java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"sub\"\\s*:\\s*\"([^\"]+)\"").matcher(payload);
					if (m.find()) {
						username = m.group(1);
					}
				}
			} catch (IllegalArgumentException ignored) {
			}
			if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				UserDetails userDetails = userDetailsService.loadUserByUsername(username);
				if (jwtUtil.validateToken(token)) {
					UsernamePasswordAuthenticationToken authToken =
							new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
					SecurityContextHolder.getContext().setAuthentication(authToken);
				}
			}
		} catch (Exception e) {
			// Invalid token – just don't authenticate, don't throw
		}

		filterChain.doFilter(request, response);
	}
}