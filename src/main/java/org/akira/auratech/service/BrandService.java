package org.akira.auratech.service;

import org.akira.auratech.model.Brand;
import java.util.List;

public interface BrandService {
    List<Brand> getAllBrands();

    Brand getBrandById(int id);

    Brand getBrandByName(String name);

    Brand getBrandBySlug(String slug);

    Brand createBrand(Brand brand);

    Brand updateBrand(Brand brand);

    void deleteBrandById(int id);
}