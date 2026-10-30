package com.fpt.security;

import com.fpt.entity.SystemAccount;
import com.fpt.repository.SystemAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private SystemAccountRepository systemAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        SystemAccount account = systemAccountRepository.findByAccountEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + email));

        // Phân quyền: 1 = Admin, 2 = Staff
        String roleName = (account.getAccountRole() != null && account.getAccountRole() == 1)
                ? "ROLE_ADMIN"
                : "ROLE_STAFF";

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));

        return new User(
                account.getAccountEmail(),
                account.getAccountPassword(),
                authorities
        );
    }
}
