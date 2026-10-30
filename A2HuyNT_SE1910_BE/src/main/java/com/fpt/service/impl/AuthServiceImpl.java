package com.fpt.service.impl;

import com.fpt.dto.LoginRequest;
import com.fpt.dto.LoginResponse;
import com.fpt.dto.MessageResponse;
import com.fpt.entity.SystemAccount;
import com.fpt.repository.SystemAccountRepository;
import com.fpt.security.JwtTokenProvider;
import com.fpt.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private SystemAccountRepository systemAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. Tìm tài khoản theo Email
        SystemAccount account = systemAccountRepository.findByAccountEmail(request.getAccountEmail())
                .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu không chính xác"));

        // 2. Kiểm tra mật khẩu
        boolean isMatch = passwordEncoder.matches(request.getAccountPassword(), account.getAccountPassword());

        // Hỗ trợ trường hợp dữ liệu mẫu ban đầu trong SQL đang là chữ thô (plaintext) chưa qua BCrypt:
        if (!isMatch && account.getAccountPassword() != null && account.getAccountPassword().equals(request.getAccountPassword())) {
            // Tự động băm BCrypt và cập nhật lại vào Database
            account.setAccountPassword(passwordEncoder.encode(request.getAccountPassword()));
            systemAccountRepository.save(account);
            isMatch = true;
        }

        if (!isMatch) {
            throw new BadCredentialsException("Email hoặc mật khẩu không chính xác");
        }

        // 3. Tạo chuỗi JWT Token
        String token = jwtTokenProvider.generateToken(account);

        // 4. Trả về LoginResponse
        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .accountId(account.getAccountId())
                .accountName(account.getAccountName())
                .accountEmail(account.getAccountEmail())
                .accountRole(account.getAccountRole())
                .build();
    }

    @Override
    public MessageResponse logout() {
        // Xóa thông tin phiên làm việc hiện tại
        SecurityContextHolder.clearContext();
        return new MessageResponse("Đăng xuất thành công");
    }

    @Override
    public LoginResponse getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        }

        String email = auth.getName();
        SystemAccount account = systemAccountRepository.findByAccountEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tài khoản"));

        return LoginResponse.builder()
                .accountId(account.getAccountId())
                .accountName(account.getAccountName())
                .accountEmail(account.getAccountEmail())
                .accountRole(account.getAccountRole())
                .build();
    }
}
