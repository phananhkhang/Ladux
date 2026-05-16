package org.akira.auratech.controller;

import org.akira.auratech.model.Product;
import org.akira.auratech.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    ProductService service;

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable int id) {
        return service.getProductById(id);
    }

    @GetMapping("/slug/{slug}")
    public Product getProductBySlug(@PathVariable String slug) {
        return service.getProductBySlug(slug);
    }

    @GetMapping("/sku/{sku}")
    public Product getProductBySku(@PathVariable String sku) {
        return service.getProductBySku(sku);
    }

    @GetMapping("/brand/{brandId}")
    public List<Product> getProductsByBrandId(@PathVariable int brandId) {
        return service.getProductsByBrandId(brandId);
    }

    @GetMapping("/category/{categoryId}")
    public List<Product> getProductsByCategoryId(@PathVariable int categoryId) {
        return service.getProductsByCategoryId(categoryId);
    }

    @GetMapping("/active")
    public List<Product> getActiveProducts() {
        return service.getActiveProducts();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return service.createProduct(product);
    }

    @PutMapping
    public Product updateProduct(@RequestBody Product product) {
        return service.updateProduct(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProductById(@PathVariable int id) {
        service.deleteProductById(id);
    }
}

