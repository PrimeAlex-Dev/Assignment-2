package com.fpt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {

    private Integer tagId;
    private String tagName;
    private String note;
}
