package org.akira.auratech.controller;

import org.akira.auratech.model.Brand;
import org.akira.auratech.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {
    @Autowired
    BrandService service;
    @GetMapping("/all")
    public List<Brand> getAllBrands() {
        return service.getAllBrands();
    }
}
