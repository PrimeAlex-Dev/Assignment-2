package com.fpt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String accessToken;
    private String tokenType; // "Bearer"

    // Thông tin người dùng đăng nhập
    private Short accountId;
    private String accountName;
    private String accountEmail;
    private Integer accountRole; // 1: Admin, 2: Staff
}
