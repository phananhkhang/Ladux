package org.akira.ladux.utils;

import lombok.experimental.UtilityClass;

@UtilityClass
public class SlugUtils {
    public static String toSlug(String text) {
        return text.toLowerCase().trim().replaceAll("\\s+", "-");
    }
}
