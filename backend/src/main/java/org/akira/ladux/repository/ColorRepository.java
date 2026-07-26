package org.akira.ladux.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.akira.ladux.model.Color;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ColorRepository extends JpaRepository<Color, Integer> {
    boolean existsByName(@NotBlank(message = "Ten khong duoc de trong") @Size(max = 50, message = "Ten khong duoc vuot qua 50 ky tu") String name);
}
