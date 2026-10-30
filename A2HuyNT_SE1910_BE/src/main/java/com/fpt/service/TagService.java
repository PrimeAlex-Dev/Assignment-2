package com.fpt.service;

import com.fpt.dto.TagRequest;
import com.fpt.dto.TagResponse;

import java.util.List;

public interface TagService {

    // Lấy toàn bộ danh sách thẻ tag (hỗ trợ tìm kiếm theo tên)
    List<TagResponse> getAllTags(String keyword);

    // Lấy chi tiết thẻ tag theo ID
    TagResponse getTagById(Integer id);

    // Thêm mới thẻ tag
    TagResponse createTag(TagRequest request);

    // Cập nhật thẻ tag
    TagResponse updateTag(Integer id, TagRequest request);

    // Xóa thẻ tag
    void deleteTag(Integer id);
}
