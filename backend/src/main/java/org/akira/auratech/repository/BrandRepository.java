package org.akira.auratech.repository;

import org.akira.auratech.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {

    Brand findByName(String name);

    Brand findBySlug(String slug);
}
