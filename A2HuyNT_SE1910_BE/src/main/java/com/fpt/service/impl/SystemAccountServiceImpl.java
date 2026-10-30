package com.fpt.service.impl;

import com.fpt.dto.AccountCreateRequest;
import com.fpt.dto.AccountResponse;
import com.fpt.dto.AccountUpdateRequest;
import com.fpt.entity.SystemAccount;
import com.fpt.repository.NewsArticleRepository;
import com.fpt.repository.SystemAccountRepository;
import com.fpt.service.SystemAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SystemAccountServiceImpl implements SystemAccountService {

    @Autowired
    private SystemAccountRepository systemAccountRepository;

    @Autowired
    private NewsArticleRepository newsArticleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<AccountResponse> getAllAccounts(String keyword) {
        List<SystemAccount> accounts;
        if (keyword != null && !keyword.trim().isEmpty()) {
            accounts = systemAccountRepository.findByAccountNameContainingIgnoreCaseOrAccountEmailContainingIgnoreCase(
                    keyword.trim(), keyword.trim()
            );
        } else {
            accounts = systemAccountRepository.findAll();
        }
        return accounts.stream().map(this::mapToResponse).toList();
    }

    @Override
    public AccountResponse getAccountById(Short id) {
        SystemAccount account = systemAccountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản với ID: " + id));
        return mapToResponse(account);
    }

    @Override
    public AccountResponse createAccount(AccountCreateRequest request) {
        // 1. Kiểm tra email đã tồn tại chưa
        if (systemAccountRepository.existsByAccountEmail(request.getAccountEmail())) {
            throw new IllegalArgumentException("Email '" + request.getAccountEmail() + "' đã được sử dụng trong hệ thống!");
        }

        // 2. Khởi tạo đối tượng và mã hóa mật khẩu bằng BCrypt
        SystemAccount account = new SystemAccount();
        account.setAccountName(request.getAccountName());
        account.setAccountEmail(request.getAccountEmail());
        account.setAccountRole(request.getAccountRole());
        account.setAccountPassword(passwordEncoder.encode(request.getAccountPassword().trim()));

        SystemAccount savedAccount = systemAccountRepository.save(account);
        return mapToResponse(savedAccount);
    }

    @Override
    public AccountResponse updateAccount(Short id, AccountUpdateRequest request) {
        // 1. Tìm tài khoản cần cập nhật
        SystemAccount account = systemAccountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản với ID: " + id));

        // 2. Kiểm tra nếu đổi email thì email mới có bị trùng với tài khoản khác không
        if (systemAccountRepository.existsByAccountEmailAndAccountIdNot(request.getAccountEmail(), id)) {
            throw new IllegalArgumentException("Email '" + request.getAccountEmail() + "' đã được sử dụng bởi tài khoản khác!");
        }

        account.setAccountName(request.getAccountName());
        account.setAccountEmail(request.getAccountEmail());
        account.setAccountRole(request.getAccountRole());

        // 3. Xử lý mật khẩu khi cập nhật:
        // Nếu để trống hoặc null: Giữ nguyên mật khẩu cũ trong database.
        // Nếu có nhập mật khẩu mới: Kiểm tra tối thiểu 3 ký tự rồi mới mã hóa và lưu.
        if (request.getAccountPassword() != null && !request.getAccountPassword().trim().isEmpty()) {
            String newPassword = request.getAccountPassword().trim();
            if (newPassword.length() < 3) {
                throw new IllegalArgumentException("Mật khẩu mới tối thiểu 3 ký tự!");
            }
            account.setAccountPassword(passwordEncoder.encode(newPassword));
        }

        SystemAccount updatedAccount = systemAccountRepository.save(account);
        return mapToResponse(updatedAccount);
    }

    @Override
    public void deleteAccount(Short id) {
        // 1. Kiểm tra tài khoản có tồn tại không
        if (!systemAccountRepository.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy tài khoản với ID: " + id);
        }

        // 2. [RÀNG BUỘC CỦA ĐỀ BÀI]: Không cho xóa nếu tài khoản đã từng tạo bài viết tin tức
        if (newsArticleRepository.existsByCreatedBy_AccountId(id)) {
            throw new IllegalStateException("Không thể xóa tài khoản này vì tài khoản đã tạo bài viết tin tức trong hệ thống!");
        }

        // 3. Thực hiện xóa
        systemAccountRepository.deleteById(id);
    }

    // Hàm phụ trợ chuyển Entity -> Response DTO
    private AccountResponse mapToResponse(SystemAccount account) {
        return AccountResponse.builder()
                .accountId(account.getAccountId())
                .accountName(account.getAccountName())
                .accountEmail(account.getAccountEmail())
                .accountRole(account.getAccountRole())
                .build();
    }
}
