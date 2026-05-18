package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.BrandRequest;
import org.akira.auratech.dto.response.BrandResponse;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Brand;
import org.akira.auratech.repository.BrandRepository;
import org.akira.auratech.service.BrandService;
import org.akira.auratech.utils.SlugUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository repo;

    @Override
    public List<BrandResponse> getAllBrands() {
        List<Brand> brands = repo.findAll();
        return brands.stream()
                .map(brand -> BrandResponse.fromEntity(brand))
                .toList();
    }

    @Override
    public BrandResponse getBrandById(int id) {
        return BrandResponse.fromEntity(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với id = " + id)));
    }

    @Override
    public BrandResponse getBrandByName(String name) {
        return BrandResponse.fromEntity(repo.findByName(name));
    }

    @Override
    public BrandResponse getBrandBySlug(String slug) {
        return BrandResponse.fromEntity(repo.findBySlug(slug));
    }

    @Override
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
    public BrandResponse updateBrand(int id, BrandRequest brand) {
        Brand b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với id = " + id));
        if (b == null) return null;
        b.setName(brand.name());
        b.setSlug(SlugUtils.toSlug(brand.name()));
        b.setLogoUrl(brand.logoUrl());
        Brand savedBrand = repo.save(b);
        return BrandResponse.fromEntity(savedBrand);
    }

    @Override
    public void deleteBrandById(int id) {
        repo.deleteById(id);
    }

}
