package org.akira.ladux.repository;

import org.akira.ladux.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface BrandRepository extends JpaRepository<Brand, Integer> {

    Brand findByName(String name);

    Brand findBySlug(String slug);
}
