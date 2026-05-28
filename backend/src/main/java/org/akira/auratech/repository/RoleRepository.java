package org.akira.auratech.repository;

import org.akira.auratech.model.Role;
import org.akira.auratech.model.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Role findByName(RoleName name);
}

