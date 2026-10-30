package com.fpt.service;

import com.fpt.dto.AccountCreateRequest;
import com.fpt.dto.AccountResponse;
import com.fpt.dto.AccountUpdateRequest;

import java.util.List;

public interface SystemAccountService {

    // Lấy toàn bộ danh sách tài khoản (hỗ trợ tìm kiếm theo từ khóa)
    List<AccountResponse> getAllAccounts(String keyword);

    // Lấy chi tiết tài khoản theo ID
    AccountResponse getAccountById(Short id);

    // Thêm mới tài khoản
    AccountResponse createAccount(AccountCreateRequest request);

    // Cập nhật tài khoản
    AccountResponse updateAccount(Short id, AccountUpdateRequest request);

    // Xóa tài khoản (kèm kiểm tra ràng buộc: không được xóa nếu đã từng tạo bài viết)
    void deleteAccount(Short id);
}
