package org.akira.auratech.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String secret;

    public String generateToken(String username) {
       Map<String, Object> claims = new HashMap<>();
       return Jwts.builder()
               .claims(claims)
               .subject(username)
               .issuedAt(new Date(System.currentTimeMillis()))
               .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Token co thoi han 10 gio
               .signWith(getKey())
               .compact();
    }
    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public String extractUsername(String jwt) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey()) // Nhét khóa vào để xác thực chữ ký của token
                .build()
                .parseSignedClaims(jwt) // THẦN THÁNH: Dòng này sẽ ngầm băm xxxxx.yyyyy + secretKey rồi so sánh với zzzzz
                .getPayload(); //Lấy phần nội dung (payload) của token
        return claims.getSubject(); //Lấy phần subject (tên người dùng) từ payload
    }

    public boolean isTokenValid(String jwt, UserDetails userDetails) {
        final String username = extractUsername(jwt);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(jwt);
    }

    private boolean isTokenExpired(String jwt) {
        Claims claims = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
        return claims.getExpiration().before(new Date()); // Hạn dùng mà trước bây gi thì coi như hết hạn
    }
}
