package com.fpt.security;

import com.fpt.entity.SystemAccount;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // 1. Tạo JWT token từ SystemAccount (chứa accountId, email, role, name)
    public String generateToken(SystemAccount account) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        // Role 1 = ROLE_ADMIN, Role 2 = ROLE_STAFF
        String roleName = (account.getAccountRole() != null && account.getAccountRole() == 1)
                ? "ROLE_ADMIN"
                : "ROLE_STAFF";

        return Jwts.builder()
                .setSubject(account.getAccountEmail())
                .claim("accountId", account.getAccountId())
                .claim("accountName", account.getAccountName())
                .claim("accountRole", account.getAccountRole())
                .claim("role", roleName)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Lấy Email từ JWT token
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // 3. Kiểm tra tính hợp lệ của Token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token sai chữ ký, hết hạn hoặc không đúng định dạng
            return false;
        }
    }
}
