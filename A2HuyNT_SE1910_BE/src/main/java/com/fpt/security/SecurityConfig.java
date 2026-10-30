package com.fpt.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // 1. Bean mã hóa mật khẩu dùng thuật toán BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. Bean AuthenticationManager hỗ trợ xác thực đăng nhập
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // 3. Cấu hình CORS cho phép ReactJS gọi API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép các cổng chạy React thông dụng (3000 hoặc Vite 5173)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // 4. Cấu hình chuỗi bảo vệ SecurityFilterChain
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Cấu hình CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Tắt CSRF vì REST API dùng JWT
                .csrf(AbstractHttpConfigurer::disable)

                // Cấu hình Session sang chế độ STATELESS (không lưu session)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Phân quyền các Endpoint
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập tự do vào API auth (login, logout)
                        .requestMatchers("/api/auth/**").permitAll()

                        // Khách vãng lai xem tin tức active không cần đăng nhập
                        .requestMatchers(HttpMethod.GET, "/api/news-articles/**").permitAll()

                        // Cho phép preflight request của trình duyệt (OPTIONS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Quyền ADMIN: Quản lý tài khoản
                        .requestMatchers("/api/accounts/**").hasRole("ADMIN")

                        // Quyền STAFF: Quản lý Category & viết bài
                        .requestMatchers("/api/categories/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/tags/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/news-articles/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/news-articles/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/news-articles/**").hasRole("STAFF")

                        // Tất cả các request khác phải đăng nhập
                        .anyRequest().authenticated()
                )

                // Thêm Filter JWT trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
