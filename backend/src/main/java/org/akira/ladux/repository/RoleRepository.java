package org.akira.ladux.repository;

import org.akira.ladux.model.Role;
import org.akira.ladux.model.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Role findByName(RoleName name);
}

