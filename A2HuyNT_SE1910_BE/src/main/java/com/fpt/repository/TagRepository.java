package com.fpt.repository;

import com.fpt.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Integer> {

    // Tìm kiếm tag theo tên
    List<Tag> findByTagNameContainingIgnoreCase(String name);
}
