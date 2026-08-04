package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.request.ColorRequest;
import org.akira.ladux.model.Color;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ColorService {
    Page<Color> getAllColors(Pageable pageable);

    Color addColor(ColorRequest request);

    Color updateColor(int id, ColorRequest request);

    void deleteColor(int id);
}
