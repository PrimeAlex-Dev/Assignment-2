package com.fpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
    private String categoryName;

    @Size(max = 250, message = "Mô tả tối đa 250 ký tự")
    private String categoryDescription;

    private Short parentCategoryId;

    private Boolean isActive;
}
