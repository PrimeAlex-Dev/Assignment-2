package com.fpt.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CategoryID")
    private Short categoryId;

    @Column(name = "CategoryName", nullable = false, length = 100)
    private String categoryName;

    @Column(name = "CategoryDesciption", length = 250)
    private String categoryDescription;

    @Column(name = "ParentCategoryID")
    private Short parentCategoryId;

    @Column(name = "IsActive")
    private Boolean isActive;
}
