package com.fpt.controller;

import com.fpt.dto.CategoryRequest;
import com.fpt.dto.CategoryResponse;
import com.fpt.dto.MessageResponse;
import com.fpt.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 1. GET /api/categories: Lấy toàn bộ danh sách danh mục hoặc tìm kiếm theo tên
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            @RequestParam(required = false) String keyword
    ) {
        List<CategoryResponse> categories = categoryService.getAllCategories(keyword);
        return ResponseEntity.ok(categories);
    }

    // 2. GET /api/categories/active: Lấy danh sách các danh mục đang hoạt động (dùng cho dropdown)
    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        List<CategoryResponse> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    // 3. GET /api/categories/{id}: Lấy chi tiết 1 danh mục
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Short id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    // 4. POST /api/categories: Thêm danh mục mới (dành cho Staff / Admin)
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 5. PUT /api/categories/{id}: Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Short id,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    // 6. DELETE /api/categories/{id}: Xóa danh mục (kèm ràng buộc: không xóa nếu đã có bài viết)
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteCategory(@PathVariable Short id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(new MessageResponse("Xóa danh mục thành công!"));
    }

    // Xử lý khi vi phạm ràng buộc không được xóa (trả về 409 Conflict)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<MessageResponse> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý khi không tìm thấy danh mục (trả về 404 Not Found)
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<MessageResponse> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý lỗi logic / dữ liệu không hợp lệ (trả về 400 Bad Request)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý lỗi vi phạm Bean Validation (@NotBlank...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MessageResponse> handleValidation(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(errorMessage));
    }
}
