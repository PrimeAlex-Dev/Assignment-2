package com.fpt.service.impl;

import com.fpt.dto.CategoryRequest;
import com.fpt.dto.CategoryResponse;
import com.fpt.entity.Category;
import com.fpt.repository.CategoryRepository;
import com.fpt.repository.NewsArticleRepository;
import com.fpt.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private NewsArticleRepository newsArticleRepository;

    @Override
    public List<CategoryResponse> getAllCategories(String keyword) {
        List<Category> allCategories = categoryRepository.findAll();
        // Tạo map ID -> Name để hiển thị tên danh mục cha nhanh chóng
        Map<Short, String> categoryNameMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getCategoryId, Category::getCategoryName, (existing, replacement) -> existing));

        List<Category> filteredCategories;
        if (keyword != null && !keyword.trim().isEmpty()) {
            filteredCategories = categoryRepository.findByCategoryNameContainingIgnoreCase(keyword.trim());
        } else {
            filteredCategories = allCategories;
        }

        return filteredCategories.stream()
                .map(cat -> mapToResponse(cat, categoryNameMap))
                .toList();
    }

    @Override
    public List<CategoryResponse> getActiveCategories() {
        List<Category> allCategories = categoryRepository.findAll();
        Map<Short, String> categoryNameMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getCategoryId, Category::getCategoryName, (existing, replacement) -> existing));

        return categoryRepository.findByIsActiveTrue().stream()
                .map(cat -> mapToResponse(cat, categoryNameMap))
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(Short id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy danh mục với ID: " + id));

        String parentName = null;
        if (category.getParentCategoryId() != null) {
            parentName = categoryRepository.findById(category.getParentCategoryId())
                    .map(Category::getCategoryName)
                    .orElse(null);
        }

        return mapToResponse(category, parentName);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setCategoryName(request.getCategoryName().trim());
        category.setCategoryDescription(request.getCategoryDescription());

        // Kiểm tra danh mục cha nếu có truyền
        if (request.getParentCategoryId() != null) {
            if (!categoryRepository.existsById(request.getParentCategoryId())) {
                throw new IllegalArgumentException("Danh mục cha không tồn tại!");
            }
            category.setParentCategoryId(request.getParentCategoryId());
        } else {
            category.setParentCategoryId(null);
        }

        // Mặc định isActive là true nếu không truyền
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Category savedCategory = categoryRepository.save(category);
        return getCategoryById(savedCategory.getCategoryId());
    }

    @Override
    public CategoryResponse updateCategory(Short id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy danh mục với ID: " + id));

        // Kiểm tra không cho phép chọn chính mình làm danh mục cha
        if (id.equals(request.getParentCategoryId())) {
            throw new IllegalArgumentException("Danh mục không thể là danh mục cha của chính nó!");
        }

        // Kiểm tra danh mục cha nếu có truyền
        if (request.getParentCategoryId() != null) {
            if (!categoryRepository.existsById(request.getParentCategoryId())) {
                throw new IllegalArgumentException("Danh mục cha không tồn tại!");
            }
            category.setParentCategoryId(request.getParentCategoryId());
        } else {
            category.setParentCategoryId(null);
        }

        category.setCategoryName(request.getCategoryName().trim());
        category.setCategoryDescription(request.getCategoryDescription());
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Category updatedCategory = categoryRepository.save(category);
        return getCategoryById(updatedCategory.getCategoryId());
    }

    @Override
    public void deleteCategory(Short id) {
        // 1. Kiểm tra danh mục có tồn tại không
        if (!categoryRepository.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy danh mục với ID: " + id);
        }

        // 2. [RÀNG BUỘC CỦA ĐỀ BÀI]: Không cho xóa nếu danh mục đã có bài viết tin tức liên quan
        if (newsArticleRepository.existsByCategory_CategoryId(id)) {
            throw new IllegalStateException("Không thể xóa danh mục này vì đã có bài viết tin tức thuộc danh mục!");
        }

        // 3. Thực hiện xóa danh mục
        categoryRepository.deleteById(id);
    }

    // Mapper với map danh mục cha
    private CategoryResponse mapToResponse(Category category, Map<Short, String> nameMap) {
        String parentName = null;
        if (category.getParentCategoryId() != null) {
            parentName = nameMap.get(category.getParentCategoryId());
        }
        return mapToResponse(category, parentName);
    }

    private CategoryResponse mapToResponse(Category category, String parentName) {
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .categoryDescription(category.getCategoryDescription())
                .parentCategoryId(category.getParentCategoryId())
                .parentCategoryName(parentName)
                .isActive(category.getIsActive())
                .build();
    }
}
