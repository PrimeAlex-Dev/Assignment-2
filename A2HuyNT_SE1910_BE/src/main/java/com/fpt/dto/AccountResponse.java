package com.fpt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private Short accountId;
    private String accountName;
    private String accountEmail;
    private Integer accountRole; // 1: Admin, 2: Staff
}
