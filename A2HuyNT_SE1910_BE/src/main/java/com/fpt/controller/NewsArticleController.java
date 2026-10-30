package com.fpt.controller;

import com.fpt.dto.MessageResponse;
import com.fpt.dto.NewsArticleRequest;
import com.fpt.dto.NewsArticleResponse;
import com.fpt.entity.SystemAccount;
import com.fpt.repository.SystemAccountRepository;
import com.fpt.service.NewsArticleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/news-articles")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NewsArticleController {

    @Autowired
    private NewsArticleService newsArticleService;

    @Autowired
    private SystemAccountRepository systemAccountRepository;

    // 1. GET /api/news-articles/public: Dành cho Khách vãng lai xem tin tức ACTIVE
    @GetMapping("/public")
    public ResponseEntity<List<NewsArticleResponse>> getActiveArticles(
            @RequestParam(required = false) String keyword
    ) {
        List<NewsArticleResponse> articles = newsArticleService.getActiveArticles(keyword);
        return ResponseEntity.ok(articles);
    }

    // 2. GET /api/news-articles: Dành cho Quản trị Staff/Admin xem toàn bộ tin tức
    @GetMapping
    public ResponseEntity<List<NewsArticleResponse>> getAllArticles(
            @RequestParam(required = false) String keyword
    ) {
        List<NewsArticleResponse> articles = newsArticleService.getAllArticles(keyword);
        return ResponseEntity.ok(articles);
    }

    // 3. GET /api/news-articles/my-history: Lịch sử tin tức do Staff đang đăng nhập tạo
    @GetMapping("/my-history")
    public ResponseEntity<List<NewsArticleResponse>> getMyArticles(Authentication auth) {
        Short staffId = getAuthenticatedAccountId(auth);
        List<NewsArticleResponse> articles = newsArticleService.getMyArticles(staffId);
        return ResponseEntity.ok(articles);
    }

    // 4. GET /api/news-articles/{id}: Xem chi tiết 1 bài báo (Cả khách vãng lai và Staff đều xem được)
    @GetMapping("/{id}")
    public ResponseEntity<NewsArticleResponse> getArticleById(@PathVariable Short id) {
        NewsArticleResponse response = newsArticleService.getArticleById(id);
        return ResponseEntity.ok(response);
    }

    // 5. POST /api/news-articles: Viết bài báo mới (dành cho Staff)
    @PostMapping
    public ResponseEntity<NewsArticleResponse> createArticle(
            @Valid @RequestBody NewsArticleRequest request,
            Authentication auth
    ) {
        Short staffId = getAuthenticatedAccountId(auth);
        if (staffId == null) {
            staffId = request.getCreatedById();
        }
        NewsArticleResponse response = newsArticleService.createArticle(request, staffId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 6. PUT /api/news-articles/{id}: Cập nhật bài báo
    @PutMapping("/{id}")
    public ResponseEntity<NewsArticleResponse> updateArticle(
            @PathVariable Short id,
            @Valid @RequestBody NewsArticleRequest request,
            Authentication auth
    ) {
        Short staffId = getAuthenticatedAccountId(auth);
        if (staffId == null) {
            staffId = request.getUpdatedById();
        }
        NewsArticleResponse response = newsArticleService.updateArticle(id, request, staffId);
        return ResponseEntity.ok(response);
    }

    // 7. DELETE /api/news-articles/{id}: Xóa bài báo
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteArticle(@PathVariable Short id) {
        newsArticleService.deleteArticle(id);
        return ResponseEntity.ok(new MessageResponse("Xóa bài viết tin tức thành công!"));
    }

    // Helper: Lấy AccountID từ thông tin người dùng đang gửi Token
    private Short getAuthenticatedAccountId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return systemAccountRepository.findByAccountEmail(auth.getName())
                .map(SystemAccount::getAccountId)
                .orElse(null);
    }

    // Xử lý khi không tìm thấy bài viết (404 Not Found)
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<MessageResponse> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý lỗi logic / dữ liệu không hợp lệ (400 Bad Request)
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
