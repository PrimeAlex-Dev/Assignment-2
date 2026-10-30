package com.fpt.controller;

import com.fpt.dto.LoginRequest;
import com.fpt.dto.LoginResponse;
import com.fpt.dto.MessageResponse;
import com.fpt.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    // 1. POST /api/auth/login: Đăng nhập hệ thống bằng Email và Password
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // 2. POST /api/auth/logout: Đăng xuất khỏi hệ thống
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        MessageResponse response = authService.logout();
        return ResponseEntity.ok(response);
    }

    // 3. GET /api/auth/me: Lấy thông tin tài khoản đang đăng nhập từ JWT Token
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser() {
        LoginResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }

    // Xử lý khi sai thông tin đăng nhập (trả về HTTP 401 Unauthorized kèm message rõ ràng)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<MessageResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý khi dữ liệu gửi lên vi phạm validation (@NotBlank, @Email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MessageResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(errorMessage));
    }
}
