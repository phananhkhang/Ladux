package org.akira.auratech.controller;

import org.akira.auratech.model.Brand;
import org.akira.auratech.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {
    @Autowired
    BrandService service;

    @GetMapping("/")
    public List<Brand> getAllBrands() {
        return service.getAllBrands();
    }

    @GetMapping("/{id}")
    public Brand getBrandById(@PathVariable int id) {
        return service.getBrandById(id);
    }

    @GetMapping("/brand/{name}")
    public Brand getBrandByName(@PathVariable String name) {
        return service.getBrandByName(name);
    }

    @GetMapping("/slug/{slug}")
    public Brand getBrandBySlug(@PathVariable String slug) {
        return service.getBrandBySlug(slug);
    }

    @PostMapping
    public Brand createBrand(@RequestBody Brand brand) {
        return service.createBrand(brand);
    }

    @DeleteMapping("/{id}")
    public void deleteBrandById(@PathVariable int id) {
        service.deleteBrandById(id);
    }

    @PutMapping
    public Brand updateBrand(@RequestBody Brand brand) {
        return service.updateBrand(brand);
    }
}
