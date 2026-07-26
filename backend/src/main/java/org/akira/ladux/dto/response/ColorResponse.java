package org.akira.ladux.dto.response;

import org.akira.ladux.model.Color;

import java.io.Serializable;

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