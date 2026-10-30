package com.fpt.repository;

import com.fpt.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Short> {

    List<Category> findByCategoryNameContainingIgnoreCase(String name);

    List<Category> findByIsActiveTrue();
}
