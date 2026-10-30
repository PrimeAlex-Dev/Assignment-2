package com.fpt.service.impl;

import com.fpt.dto.NewsArticleRequest;
import com.fpt.dto.NewsArticleResponse;
import com.fpt.dto.TagResponse;
import com.fpt.entity.Category;
import com.fpt.entity.NewsArticle;
import com.fpt.entity.SystemAccount;
import com.fpt.entity.Tag;
import com.fpt.repository.CategoryRepository;
import com.fpt.repository.NewsArticleRepository;
import com.fpt.repository.SystemAccountRepository;
import com.fpt.repository.TagRepository;
import com.fpt.service.NewsArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class NewsArticleServiceImpl implements NewsArticleService {

    @Autowired
    private NewsArticleRepository newsArticleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private SystemAccountRepository systemAccountRepository;

    @Override
    public List<NewsArticleResponse> getAllArticles(String keyword) {
        List<NewsArticle> articles;
        if (keyword != null && !keyword.trim().isEmpty()) {
            articles = newsArticleRepository.findByNewsTitleContainingIgnoreCase(keyword.trim());
        } else {
            articles = newsArticleRepository.findAll();
        }
        return articles.stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<NewsArticleResponse> getActiveArticles(String keyword) {
        List<NewsArticle> articles;
        if (keyword != null && !keyword.trim().isEmpty()) {
            articles = newsArticleRepository.findByNewsStatusAndNewsTitleContainingIgnoreCase(1, keyword.trim());
        } else {
            articles = newsArticleRepository.findByNewsStatus(1);
        }
        return articles.stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<NewsArticleResponse> getMyArticles(Short staffId) {
        List<NewsArticle> articles = newsArticleRepository.findByCreatedBy_AccountId(staffId);
        return articles.stream().map(this::mapToResponse).toList();
    }

    @Override
    public NewsArticleResponse getArticleById(Short id) {
        NewsArticle article = newsArticleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết tin tức với ID: " + id));
        return mapToResponse(article);
    }

    @Override
    public NewsArticleResponse createArticle(NewsArticleRequest request, Short staffId) {
        // 1. Kiểm tra danh mục tồn tại
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Danh mục được chọn không tồn tại!"));

        // 2. Tìm thông tin Staff tạo bài
        SystemAccount staff = null;
        if (staffId != null) {
            staff = systemAccountRepository.findById(staffId).orElse(null);
        }

        // 3. Tìm các Tag được chọn
        Set<Tag> tags = new HashSet<>();
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
        }

        // 4. Khởi tạo bài viết
        NewsArticle article = new NewsArticle();
        article.setNewsTitle(request.getNewsTitle().trim());
        article.setHeadline(request.getHeadline());
        article.setNewsContent(request.getNewsContent());
        article.setNewsSource(request.getNewsSource());
        article.setCategory(category);
        article.setTags(tags);
        article.setNewsStatus(request.getNewsStatus() != null ? request.getNewsStatus() : 1);
        article.setCreatedDate(LocalDateTime.now());
        article.setCreatedBy(staff);

        NewsArticle savedArticle = newsArticleRepository.save(article);
        return mapToResponse(savedArticle);
    }

    @Override
    public NewsArticleResponse updateArticle(Short id, NewsArticleRequest request, Short staffId) {
        // 1. Tìm bài viết cần cập nhật
        NewsArticle article = newsArticleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết tin tức với ID: " + id));

        // 2. Kiểm tra danh mục tồn tại
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Danh mục được chọn không tồn tại!"));

        // 3. Tìm thông tin Staff cập nhật
        SystemAccount staff = null;
        if (staffId != null) {
            staff = systemAccountRepository.findById(staffId).orElse(null);
        }

        // 4. Cập nhật Tags
        if (request.getTagIds() != null) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            article.setTags(tags);
        }

        article.setNewsTitle(request.getNewsTitle().trim());
        article.setHeadline(request.getHeadline());
        article.setNewsContent(request.getNewsContent());
        article.setNewsSource(request.getNewsSource());
        article.setCategory(category);
        article.setNewsStatus(request.getNewsStatus() != null ? request.getNewsStatus() : article.getNewsStatus());
        article.setModifiedDate(LocalDateTime.now());
        article.setUpdatedBy(staff);

        NewsArticle updatedArticle = newsArticleRepository.save(article);
        return mapToResponse(updatedArticle);
    }

    @Override
    public void deleteArticle(Short id) {
        NewsArticle article = newsArticleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bài viết tin tức với ID: " + id));

        // Xóa liên kết trong bảng trung gian NewsTag trước khi xóa bài viết
        article.getTags().clear();
        newsArticleRepository.save(article);

        newsArticleRepository.delete(article);
    }

    // Hàm chuyển đổi Entity sang Response DTO
    private NewsArticleResponse mapToResponse(NewsArticle article) {
        Set<TagResponse> tagResponses = Collections.emptySet();
        if (article.getTags() != null) {
            tagResponses = article.getTags().stream()
                    .map(t -> TagResponse.builder()
                            .tagId(t.getTagId())
                            .tagName(t.getTagName())
                            .note(t.getNote())
                            .build())
                    .collect(Collectors.toSet());
        }

        return NewsArticleResponse.builder()
                .newsArticleId(article.getNewsArticleId())
                .newsTitle(article.getNewsTitle())
                .headline(article.getHeadline())
                .createdDate(article.getCreatedDate())
                .newsContent(article.getNewsContent())
                .newsSource(article.getNewsSource())
                .newsStatus(article.getNewsStatus())
                .modifiedDate(article.getModifiedDate())
                .categoryId(article.getCategory() != null ? article.getCategory().getCategoryId() : null)
                .categoryName(article.getCategory() != null ? article.getCategory().getCategoryName() : null)
                .createdById(article.getCreatedBy() != null ? article.getCreatedBy().getAccountId() : null)
                .createdByName(article.getCreatedBy() != null ? article.getCreatedBy().getAccountName() : null)
                .updatedById(article.getUpdatedBy() != null ? article.getUpdatedBy().getAccountId() : null)
                .updatedByName(article.getUpdatedBy() != null ? article.getUpdatedBy().getAccountName() : null)
                .tags(tagResponses)
                .build();
    }
}
