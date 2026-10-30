package com.fpt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Short categoryId;
    private String categoryName;
    private String categoryDescription;
    private Short parentCategoryId;
    private String parentCategoryName;
    private Boolean isActive;
}
