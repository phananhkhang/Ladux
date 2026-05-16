package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Brand;
import org.akira.auratech.repository.BrandRepository;
import org.akira.auratech.service.BrandService;
import org.akira.auratech.utils.SlugUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpt implements BrandService {
    private final BrandRepository repo;

    @Override
    public List<Brand> getAllBrands() {
        return repo.findAll();
    }

    @Override
    public Brand getBrandById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Brand getBrandByName(String name) {
        return repo.findByName(name);
    }

    @Override
    public Brand getBrandBySlug(String slug) {
        return repo.findBySlug(slug);
    }

    @Override
    public Brand createBrand(Brand brand) {
        if (brand.getName() != null) {
            brand.setSlug(SlugUtils.toSlug(brand.getName()));
        }
        return repo.save(brand);
    }

    @Override
    public Brand updateBrand(Brand brand) {
        if (brand.getName() != null) {
            brand.setSlug(SlugUtils.toSlug(brand.getName()));
        }
        return repo.save(brand);
    }

    @Override
    public void deleteBrandById(int id) {
        repo.deleteById(id);
    }
}
