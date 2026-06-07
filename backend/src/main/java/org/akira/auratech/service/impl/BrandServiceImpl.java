package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.BrandRequest;
import org.akira.auratech.dto.response.BrandResponse;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Brand;
import org.akira.auratech.repository.BrandRepository;
import org.akira.auratech.service.BrandService;
import org.akira.auratech.utils.SlugUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository repo;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "brands", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<BrandResponse> getAllBrands(Pageable pageable) {
        return repo.findAll(pageable)
                .map(BrandResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "brands", key = "'id:' + #id")
    public BrandResponse getBrandById(int id) {
        return BrandResponse.fromEntity(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "brands", key = "'name:' + #name")
    public BrandResponse getBrandByName(String name) {
        return BrandResponse.fromEntity(repo.findByName(name));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "brands", key = "'slug:' + #slug")
    public BrandResponse getBrandBySlug(String slug) {
        return BrandResponse.fromEntity(repo.findBySlug(slug));
    }

    @Override
    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public BrandResponse createBrand(BrandRequest request) {
        String slug = SlugUtils.toSlug(request.name());
        Brand brand = Brand.builder()
                .name(request.name())
                .slug(slug)
                .logoUrl(request.logoUrl())
                .build();

        Brand savedBrand = repo.save(brand);

        return BrandResponse.fromEntity(savedBrand);
    }

    @Override
    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public BrandResponse updateBrand(int id, BrandRequest brand) {
        Brand b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với id = " + id));
        if (b == null) return null;
        b.setName(brand.name());
        b.setSlug(SlugUtils.toSlug(brand.name()));
        b.setLogoUrl(brand.logoUrl());
        return BrandResponse.fromEntity(b);
    }

    @Override
    @Transactional
    @CacheEvict(value = "brands", allEntries = true)
    public void deleteBrandById(int id) {
        repo.deleteById(id);
    }

}
