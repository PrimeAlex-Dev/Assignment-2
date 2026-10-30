package com.fpt.repository;

import com.fpt.entity.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Short> {

    // Khách vãng lai: Chỉ xem danh sách tin tức active (NewsStatus = 1)
    List<NewsArticle> findByNewsStatus(Integer newsStatus);

    // Tìm kiếm tin tức theo tiêu đề
    List<NewsArticle> findByNewsTitleContainingIgnoreCase(String keyword);

    // Tìm kiếm tin tức active theo tiêu đề (cho trang chủ public)
    List<NewsArticle> findByNewsStatusAndNewsTitleContainingIgnoreCase(Integer newsStatus, String keyword);

    // Staff: Xem lịch sử bài viết do chính staff đó tạo
    List<NewsArticle> findByCreatedBy_AccountId(Short accountId);

    // Kiểm tra xem có bài viết nào thuộc category không (phục vụ ràng buộc xóa Category)
    boolean existsByCategory_CategoryId(Short categoryId);

    // Kiểm tra xem có bài viết nào do account tạo không (phục vụ ràng buộc xóa Account của Admin)
    boolean existsByCreatedBy_AccountId(Short accountId);
}
