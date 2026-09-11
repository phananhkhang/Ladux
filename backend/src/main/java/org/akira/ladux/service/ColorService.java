package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.request.ColorRequest;
import org.akira.ladux.dto.catalog.response.ColorResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.akira.ladux.model.Color;
import org.springframework.data.domain.Pageable;

public interface ColorService {
    PageResponse<ColorResponse> getAllColors(Pageable pageable);

    Color addColor(ColorRequest request);

    Color updateColor(int id, ColorRequest request);

    void deleteColor(int id);
}
