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
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import jakarta.servlet.http.Cookie;

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

		String token = null;

		// 1. Try Authorization header first
		final String authHeader = request.getHeader("Authorization");
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			token = authHeader.substring(7);
		}

		// 2. Fallback: read from HttpOnly cookie
		if (token == null && request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if ("jwt".equals(cookie.getName())) {
					token = cookie.getValue();
					break;
				}
			}
		}

		// 3. No token present → continue (public endpoints)
		if (token == null) {
			filterChain.doFilter(request, response);
			return;
		}

		// 4. Extract username from token
		String username = null;
		try {
			username = jwtUtil.getUsernameFromToken(token);
		} catch (Exception e) {
			filterChain.doFilter(request, response);
			return;
		}

		// 5. Validate token and set SecurityContext
		if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails userDetails = userDetailsService.loadUserByUsername(username);
			try {
				if (jwtUtil.validateToken(token)) {
					UsernamePasswordAuthenticationToken authToken =
							new UsernamePasswordAuthenticationToken(
									userDetails,
									null,
									userDetails.getAuthorities()
							);
					authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authToken);
				}
			} catch (Exception e) {
				// Validation failed – continue without authentication
			}
		}

		// 6. Always continue the chain
		filterChain.doFilter(request, response);
	}
}