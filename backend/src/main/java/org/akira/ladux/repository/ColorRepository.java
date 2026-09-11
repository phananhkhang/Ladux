package org.akira.ladux.repository;

import org.akira.ladux.model.Color;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ColorRepository extends JpaRepository<Color, Integer> {
    boolean existsByName(String name);

    boolean existsByHexCode(String s);

    boolean existsByNameAndIdNot(String name, int id);

    boolean existsByHexCodeAndIdNot(String s, int id);
}
