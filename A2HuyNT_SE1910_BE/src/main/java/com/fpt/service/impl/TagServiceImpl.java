package com.fpt.service.impl;

import com.fpt.dto.TagRequest;
import com.fpt.dto.TagResponse;
import com.fpt.entity.Tag;
import com.fpt.repository.TagRepository;
import com.fpt.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TagServiceImpl implements TagService {

    @Autowired
    private TagRepository tagRepository;

    @Override
    public List<TagResponse> getAllTags(String keyword) {
        List<Tag> tags;
        if (keyword != null && !keyword.trim().isEmpty()) {
            tags = tagRepository.findByTagNameContainingIgnoreCase(keyword.trim());
        } else {
            tags = tagRepository.findAll();
        }
        return tags.stream().map(this::mapToResponse).toList();
    }

    @Override
    public TagResponse getTagById(Integer id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy thẻ tag với ID: " + id));
        return mapToResponse(tag);
    }

    @Override
    public TagResponse createTag(TagRequest request) {
        Tag tag = new Tag();
        tag.setTagName(request.getTagName().trim());
        tag.setNote(request.getNote());

        Tag savedTag = tagRepository.save(tag);
        return mapToResponse(savedTag);
    }

    @Override
    public TagResponse updateTag(Integer id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy thẻ tag với ID: " + id));

        tag.setTagName(request.getTagName().trim());
        tag.setNote(request.getNote());

        Tag updatedTag = tagRepository.save(tag);
        return mapToResponse(updatedTag);
    }

    @Override
    public void deleteTag(Integer id) {
        if (!tagRepository.existsById(id)) {
            throw new NoSuchElementException("Không tìm thấy thẻ tag với ID: " + id);
        }
        tagRepository.deleteById(id);
    }

    private TagResponse mapToResponse(Tag tag) {
        return TagResponse.builder()
                .tagId(tag.getTagId())
                .tagName(tag.getTagName())
                .note(tag.getNote())
                .build();
    }
}
