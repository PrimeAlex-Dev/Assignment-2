package com.fpt.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SystemAccount")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemAccount {

    @Id
    @Column(name = "AccountID")
    private Short accountId;

    @Column(name = "AccountName", length = 100)
    private String accountName;

    @Column(name = "AccountEmail", length = 70)
    private String accountEmail;

    @Column(name = "AccountRole")
    private Integer accountRole;

    @Column(name = "AccountPassword", length = 100)
    private String accountPassword;
}
