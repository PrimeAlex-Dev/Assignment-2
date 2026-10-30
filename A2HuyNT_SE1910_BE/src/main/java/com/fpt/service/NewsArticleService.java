package com.fpt.service;

import com.fpt.dto.NewsArticleRequest;
import com.fpt.dto.NewsArticleResponse;

import java.util.List;

public interface NewsArticleService {

    // Lấy toàn bộ danh sách bài viết (quản lý Staff / Admin, hỗ trợ tìm kiếm)
    List<NewsArticleResponse> getAllArticles(String keyword);

    // Lấy danh sách bài viết đang Active (cho Khách vãng lai xem báo)
    List<NewsArticleResponse> getActiveArticles(String keyword);

    // Lấy lịch sử bài viết do Staff tạo (My History)
    List<NewsArticleResponse> getMyArticles(Short staffId);

    // Xem chi tiết 1 bài viết theo ID
    NewsArticleResponse getArticleById(Short id);

    // Tạo bài viết mới
    NewsArticleResponse createArticle(NewsArticleRequest request, Short staffId);

    // Cập nhật bài viết
    NewsArticleResponse updateArticle(Short id, NewsArticleRequest request, Short staffId);

    // Xóa bài viết
    void deleteArticle(Short id);
}
