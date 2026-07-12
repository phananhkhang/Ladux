package org.akira.ladux.service;

import org.akira.ladux.dto.response.ProductImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> getProductImagesByProductId(int productId);

    List<ProductImageResponse> addImages(int productId, List<String> imageUrls);

    ProductImageResponse uploadImage(int productId, MultipartFile file);

    void deleteProductImageById(int productId, int imageId);
}
