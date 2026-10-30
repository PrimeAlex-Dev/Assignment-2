package com.fpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticleRequest {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    @Size(max = 170, message = "Tiêu đề tối đa 170 ký tự")
    private String newsTitle;

    @Size(max = 150, message = "Headline tối đa 150 ký tự")
    private String headline;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String newsContent;

    @Size(max = 400, message = "Nguồn tin tối đa 400 ký tự")
    private String newsSource;

    @NotNull(message = "Vui lòng chọn danh mục bài viết")
    private Short categoryId;

    private Integer newsStatus; // 1: active, 0: inactive

    private Short createdById;

    private Short updatedById;

    // Danh sách ID các Tag được chọn từ giao diện (checkbox / multi-select)
    private Set<Integer> tagIds;
}
