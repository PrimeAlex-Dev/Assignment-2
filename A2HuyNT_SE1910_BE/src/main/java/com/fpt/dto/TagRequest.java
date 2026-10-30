package com.fpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TagRequest {

    @NotBlank(message = "Tên thẻ tag không được để trống")
    @Size(max = 50, message = "Tên thẻ tag tối đa 50 ký tự")
    private String tagName;

    @Size(max = 400, message = "Ghi chú tối đa 400 ký tự")
    private String note;
}
