package org.akira.ladux.service;

import org.akira.ladux.dto.response.ProductImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> getProductImagesByProductId(int productId);

    List<ProductImageResponse> addImages(int productId, List<String> imageUrls);

    List<ProductImageResponse> uploadImage(int productId, List<MultipartFile> files);

    void deleteProductImageById(int productId, int imageId);
}
