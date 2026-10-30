package com.fpt.controller;

import com.fpt.dto.MessageResponse;
import com.fpt.dto.TagRequest;
import com.fpt.dto.TagResponse;
import com.fpt.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TagController {

    @Autowired
    private TagService tagService;

    // 1. GET /api/tags: Lấy danh sách toàn bộ thẻ tag hoặc tìm kiếm theo tên
    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags(
            @RequestParam(required = false) String keyword
    ) {
        List<TagResponse> tags = tagService.getAllTags(keyword);
        return ResponseEntity.ok(tags);
    }

    // 2. GET /api/tags/{id}: Lấy chi tiết 1 thẻ tag
    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getTagById(@PathVariable Integer id) {
        TagResponse response = tagService.getTagById(id);
        return ResponseEntity.ok(response);
    }

    // 3. POST /api/tags: Thêm thẻ tag mới
    @PostMapping
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody TagRequest request) {
        TagResponse response = tagService.createTag(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 4. PUT /api/tags/{id}: Cập nhật thẻ tag
    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> updateTag(
            @PathVariable Integer id,
            @Valid @RequestBody TagRequest request
    ) {
        TagResponse response = tagService.updateTag(id, request);
        return ResponseEntity.ok(response);
    }

    // 5. DELETE /api/tags/{id}: Xóa thẻ tag
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteTag(@PathVariable Integer id) {
        tagService.deleteTag(id);
        return ResponseEntity.ok(new MessageResponse("Xóa thẻ tag thành công!"));
    }

    // Xử lý khi không tìm thấy thẻ tag (404 Not Found)
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<MessageResponse> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
    }

    // Xử lý lỗi dữ liệu không hợp lệ (400 Bad Request)
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
