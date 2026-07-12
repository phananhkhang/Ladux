package org.akira.ladux.model;

import jakarta.persistence.*;
import lombok.*;
import org.akira.ladux.model.enums.RoleName;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 20)
    private RoleName name;

    @ManyToMany(mappedBy = "roles")
    @ToString.Exclude
    @Builder.Default
    private Set<User> users = new LinkedHashSet<>();
}
