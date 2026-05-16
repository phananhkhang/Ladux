package org.akira.auratech.controller;

import org.akira.auratech.model.ProductImage;
import org.akira.auratech.service.ProductImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-images")
public class ProductImageController {
    @Autowired
    ProductImageService service;

    @GetMapping("/all")
    public List<ProductImage> getAllProductImages() {
        return service.getAllProductImages();
    }

    @GetMapping("/{id}")
    public ProductImage getProductImageById(@PathVariable int id) {
        return service.getProductImageById(id);
    }

    @GetMapping("/product/{productId}")
    public List<ProductImage> getProductImagesByProductId(@PathVariable int productId) {
        return service.getProductImagesByProductId(productId);
    }

    @GetMapping("/product/{productId}/primary")
    public List<ProductImage> getPrimaryImagesByProductId(@PathVariable int productId) {
        return service.getPrimaryImagesByProductId(productId);
    }

    @PostMapping
    public ProductImage createProductImage(@RequestBody ProductImage image) {
        return service.createProductImage(image);
    }

    @PutMapping
    public ProductImage updateProductImage(@RequestBody ProductImage image) {
        return service.updateProductImage(image);
    }

    @DeleteMapping("/{id}")
    public void deleteProductImageById(@PathVariable int id) {
        service.deleteProductImageById(id);
    }
}

