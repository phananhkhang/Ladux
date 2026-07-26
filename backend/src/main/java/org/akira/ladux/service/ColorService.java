package org.akira.ladux.service;

import org.akira.ladux.dto.request.ColorRequest;
import org.akira.ladux.model.Color;

public interface ColorService {
    Color addColor(ColorRequest request);

    Color updateColor(int id, ColorRequest request);

    void deleteColor(int id);
}
