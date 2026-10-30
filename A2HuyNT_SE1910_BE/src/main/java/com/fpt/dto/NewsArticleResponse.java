package com.fpt.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticleResponse {

    private String newsArticleId;
    private String newsTitle;
    private String headline;
    private LocalDateTime createdDate;
    private String newsContent;
    private String newsSource;
    private Integer newsStatus;
    private LocalDateTime modifiedDate;

    // Thông tin danh mục trả về cho React hiển thị trực tiếp
    private Short categoryId;
    private String categoryName;

    // Thông tin người tạo / người sửa
    private Short createdById;
    private String createdByName;
    private Short updatedById;
    private String updatedByName;

    // Danh sách các tag của bài viết
    private Set<TagResponse> tags;
}
