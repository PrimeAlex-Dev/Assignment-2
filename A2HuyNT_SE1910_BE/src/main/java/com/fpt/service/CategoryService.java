package com.fpt.service;

import com.fpt.dto.CategoryRequest;
import com.fpt.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    // Lấy toàn bộ danh sách danh mục (hỗ trợ tìm kiếm theo tên)
    List<CategoryResponse> getAllCategories(String keyword);

    // Lấy danh sách các danh mục đang hoạt động (IsActive = true)
    List<CategoryResponse> getActiveCategories();

    // Lấy chi tiết danh mục theo ID
    CategoryResponse getCategoryById(Short id);

    // Thêm mới danh mục
    CategoryResponse createCategory(CategoryRequest request);

    // Cập nhật danh mục
    CategoryResponse updateCategory(Short id, CategoryRequest request);

    // Xóa danh mục (kèm kiểm tra ràng buộc không được xóa nếu đã có bài viết)
    void deleteCategory(Short id);
}
