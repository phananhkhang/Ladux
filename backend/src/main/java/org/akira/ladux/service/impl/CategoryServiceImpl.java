package org.akira.ladux.service.impl;

import org.akira.ladux.dto.request.CategoryRequest;
import org.akira.ladux.dto.response.CategoryResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Category;
import org.akira.ladux.repository.CategoryRepository;
import org.akira.ladux.repository.ProductRepository;
import org.akira.ladux.service.CategoryService;
import org.akira.ladux.utils.SlugUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository repo;
    private final ProductRepository productRepo;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return repo.findAll(pageable)
                .map(CategoryResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'id:' + #id")
    public CategoryResponse getCategoryById(int id) {
        return CategoryResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'name:' + #name")
    public CategoryResponse getCategoryByName(String name) {
        return CategoryResponse.fromEntity(repo.findByName(name));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'slug:' + #slug")
    public CategoryResponse getCategoryBySlug(String slug) {
        return CategoryResponse.fromEntity(repo.findBySlug(slug));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'root:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<CategoryResponse> getRootCategories(Pageable pageable) {
        return repo.findByParentIsNull(pageable)
                .map(CategoryResponse::fromEntity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) {
        Category parent = null;
        if (request.parentId() != null) {
            parent = repo.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.parentId()));
        }
        Category category = Category.builder()
                .name(request.name())
                .slug(SlugUtils.toSlug(request.name()))
                .parent(parent)
                .imageUrl(blankToNull(request.imageUrl()))
                .build();
        return CategoryResponse.fromEntity(repo.save(category));
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(int id, CategoryRequest request) {
        Category category = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + id));
        if (request.name() != null) {
            category.setName(request.name());
            category.setSlug(SlugUtils.toSlug(request.name()));
        }
        if (request.parentId() != null) {
            Category parent = repo.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.parentId()));
            validateParentDoesNotCreateCycle(category, parent);
            category.setParent(parent);
        }
        // imageUrl optional: null/absent = keep current; empty string = clear
        if (request.imageUrl() != null) {
            category.setImageUrl(blankToNull(request.imageUrl()));
        }
        return CategoryResponse.fromEntity(category);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategoryById(int id) {
        if (repo.existsByParentId(id)) {
            throw new BusinessRuleException("Không thể xóa category này vì nó có category con");
        }
        if (productRepo.existsByCategoryId(id)) {
            throw new BusinessRuleException("Không thể xóa category này vì nó có sản phẩm liên quan");
        }
        repo.deleteById(id);
    }

    private void validateParentDoesNotCreateCycle(Category category, Category parentCandidate) {
        if (parentCandidate.getId().equals(category.getId())) {
            throw new BusinessRuleException("Category khong the lam parent cua chinh no");
        }
        Category cursor = parentCandidate;
        while (cursor != null) {
            if (cursor.getId().equals(category.getId())) {
                throw new BusinessRuleException("Parent category khong duoc nam trong cay con cua category hien tai");
            }
            cursor = cursor.getParent();
        }
    }
    public void uploadCategoryImage(MultipartFile file) {

    }
}
