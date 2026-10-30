package com.fpt.service;

import com.fpt.dto.LoginRequest;
import com.fpt.dto.LoginResponse;
import com.fpt.dto.MessageResponse;

public interface AuthService {

    // Xác thực tài khoản và sinh JWT Token
    LoginResponse login(LoginRequest request);

    // Đăng xuất và xóa phiên làm việc
    MessageResponse logout();

    // Lấy thông tin tài khoản hiện tại từ Token
    LoginResponse getCurrentUser();
}
