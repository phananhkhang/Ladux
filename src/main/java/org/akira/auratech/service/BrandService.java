package org.akira.auratech.service;

import org.akira.auratech.dto.BrandRequest;
import org.akira.auratech.dto.BrandResponse;
import org.akira.auratech.model.Brand;
import java.util.List;

public interface BrandService {
    List<BrandResponse> getAllBrands();

    BrandResponse getBrandById(int id);

    BrandResponse getBrandByName(String name);

    BrandResponse getBrandBySlug(String slug);

    BrandResponse createBrand(BrandRequest request);

    BrandResponse updateBrand(int id, BrandRequest brand);

    void deleteBrandById(int id);
}