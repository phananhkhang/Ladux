package org.akira.auratech.service;

import org.akira.auratech.model.Brand;
import org.akira.auratech.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService {
    @Autowired
    BrandRepository repo;
    public List<Brand> getAllBrands() {
        return repo.findAll();
    }
}
