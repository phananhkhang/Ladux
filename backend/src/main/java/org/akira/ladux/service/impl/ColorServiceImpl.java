package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.admin.ColorRequest;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Color;
import org.akira.ladux.repository.ColorRepository;
import org.akira.ladux.repository.ProductVariantRepository;
import org.akira.ladux.service.ColorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ColorServiceImpl implements ColorService {
    private final ColorRepository colorRepository;
    private final ProductVariantRepository productVariantRepository;
    @Override
    @Transactional
    public Color addColor(ColorRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Color name không được null hoặc bỏ trống");
        }
        if (request.hexCode() == null || request.hexCode().isBlank()) {
            throw new IllegalArgumentException("Color hexCode không được null hoặc bỏ trống");
        }
        // Kiem tra trung lap
        if (colorRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Color name đã tồn tại");
        }
        Color color = Color.builder()
                .name(request.name())
                .hexCode(request.hexCode())
                .build();
        return colorRepository.save(color);
    }
    @Override
    @Transactional
    public Color updateColor(int id, ColorRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Color name không được null hoặc bỏ trống");
        }
        if (request.hexCode() == null || request.hexCode().isBlank()) {
            throw new IllegalArgumentException("Color hexCode không được null hoặc bỏ trống");
        }
        Color color = colorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy color với id = " + id));
        color.setName(request.name());
        color.setHexCode(request.hexCode());
        return color;
    }
    @Override
    @Transactional
    public void deleteColor(int id) {
        Color color = colorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy color với id = " + id));
        // Kiểm tra color đã được sử dụng ở trong sản phẩm hay chưa. Nếu đã được sử dụng, không cho phép xóa.
        if (productVariantRepository.existsByColorId(id)) {
            throw new IllegalArgumentException("Không thể xóa color đã được sử dụng trong sản phẩm");
        }
        colorRepository.delete(color);
    }
}
