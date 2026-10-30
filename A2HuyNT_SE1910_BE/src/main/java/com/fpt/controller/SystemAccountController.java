package com.fpt.controller;

import com.fpt.dto.AccountCreateRequest;
import com.fpt.dto.AccountResponse;
import com.fpt.dto.AccountUpdateRequest;
import com.fpt.dto.MessageResponse;
import com.fpt.service.SystemAccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SystemAccountController {

    @Autowired
    private SystemAccountService systemAccountService;

    // 1. GET /api/accounts: Lấy toàn bộ danh sách tài khoản hoặc Tìm kiếm theo từ khóa
    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAllAccounts(
            @RequestParam(required = false) String keyword
    ) {
        List<AccountResponse> accounts = systemAccountService.getAllAccounts(keyword);
        return ResponseEntity.ok(accounts);
    }

    // 2. GET /api/accounts/{id}: Lấy chi tiết 1 tài khoản
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Short id) {
        AccountResponse response = systemAccountService.getAccountById(id);
        return ResponseEntity.ok(response);
    }

    // 3. POST /api/accounts: Thêm tài khoản mới (dành cho Admin, bắt buộc mật khẩu)
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountCreateRequest request) {
        AccountResponse response = systemAccountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 4. PUT /api/accounts/{id}: Cập nhật tài khoản (mật khẩu tùy chọn)
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @PathVariable Short id,
            @Valid @RequestBody AccountUpdateRequest request
    ) {
        AccountResponse response = systemAccountService.updateAccount(id, request);
        return ResponseEntity.ok(response);
    }

    // 5. DELETE /api/accounts/{id}: Xóa tài khoản (kèm kiểm tra ràng buộc không được xóa nếu đã tạo bài viết)
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteAccount(@PathVariable Short id) {
        systemAccountService.deleteAccount(id);
        return ResponseEntity.ok(new MessageResponse("Xóa tài khoản thành công!"));
    }

    // Xử lý khi vi phạm ràng buộc không được xóa (trả về 409 Conflict)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<MessageResponse> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý khi không tìm thấy tài khoản (trả về 404 Not Found)
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<MessageResponse> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý lỗi trùng email hoặc thiếu dữ liệu (trả về 400 Bad Request)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý lỗi vi phạm Bean Validation (@NotBlank, @Email...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MessageResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(errorMessage));
    }
}
