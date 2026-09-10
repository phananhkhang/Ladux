package org.akira.ladux.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.akira.ladux.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Integer> {

    Optional<Brand> findByName(String name);

    Optional<Brand> findBySlug(String slug);

    Boolean existsByName(String name);
}
