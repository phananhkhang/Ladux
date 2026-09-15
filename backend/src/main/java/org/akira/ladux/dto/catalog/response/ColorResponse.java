package org.akira.ladux.dto.catalog.response;

import java.io.Serializable;

import org.akira.ladux.catalog.domain.model.Color;

public record ColorResponse(
        Integer id,
        String name,
        String hexCode
) implements Serializable {
    public static ColorResponse fromEntity(Color color) {
        if (color == null) {
            return null;
        }
        return new ColorResponse(
                color.getId(),
                color.getName(),
                color.getHexCode()
        );
    }
}