package com.fpt.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Tag")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TagID")
    private Integer tagId;

    @Column(name = "TagName", nullable = false, length = 50)
    private String tagName;

    @Column(name = "Note", length = 400)
    private String note;
}
