package com.fpt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Short categoryId;
    private String categoryName;
    private String categoryDescription;
    private Short parentCategoryId;
    private Boolean isActive;
}
