package com.fpt.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountCreateRequest {

    @NotBlank(message = "Tên tài khoản không được để trống")
    @Size(max = 100, message = "Tên tài khoản tối đa 100 ký tự")
    private String accountName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 70, message = "Email tối đa 70 ký tự")
    private String accountEmail;

    @NotNull(message = "Vui lòng chọn vai trò (Role)")
    private Integer accountRole; // 1: Admin, 2: Staff

    @NotBlank(message = "Mật khẩu không được để trống khi tạo mới tài khoản")
    @Size(min = 3, message = "Mật khẩu tối thiểu 3 ký tự")
    private String accountPassword;
}
