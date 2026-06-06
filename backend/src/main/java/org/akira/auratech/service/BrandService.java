package org.akira.auratech.service;

import org.akira.auratech.dto.request.BrandRequest;
import org.akira.auratech.dto.response.BrandResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BrandService {
    Page<BrandResponse> getAllBrands(Pageable pageable);

    BrandResponse getBrandById(int id);

    BrandResponse getBrandByName(String name);

    BrandResponse getBrandBySlug(String slug);

    BrandResponse createBrand(BrandRequest request);

    BrandResponse updateBrand(int id, BrandRequest brand);

    void deleteBrandById(int id);
}