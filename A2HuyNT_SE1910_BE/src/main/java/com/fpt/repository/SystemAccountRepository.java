package com.fpt.repository;

import com.fpt.entity.SystemAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemAccountRepository extends JpaRepository<SystemAccount, Short> {

    Optional<SystemAccount> findByAccountEmail(String email);

    boolean existsByAccountEmail(String email);

    // Kiểm tra trùng email với các tài khoản khác khi cập nhật
    boolean existsByAccountEmailAndAccountIdNot(String email, Short accountId);

    // Tìm kiếm tài khoản theo tên hoặc email
    List<SystemAccount> findByAccountNameContainingIgnoreCaseOrAccountEmailContainingIgnoreCase(String name, String email);
}
