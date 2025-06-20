package com.example.demo.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Log
public class JwtTokenUtil {

    private final JwtConfig jwtConfig;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.getSubject());
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.getExpiration());
    }

    public <T> T getClaimFromToken(String token, Function<io.jsonwebtoken.Claims, T> claimsResolver) {
        final var claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private io.jsonwebtoken.Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.warning("JWT parsing failed: " + e.getMessage());
            throw e;
        }
    }

    private boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        return doGenerateToken(claims, userDetails.getUsername());
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        final Date now = new Date();
        final Date expiryDate = new Date(now.getTime() + jwtConfig.getExpiration() * 1000L);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public String refreshToken(String token) {
        final var claims = getAllClaimsFromToken(token);
        claims.setIssuedAt(new Date());
        claims.setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration() * 1000L));

        return Jwts.builder()
                .setClaims(claims)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
}
