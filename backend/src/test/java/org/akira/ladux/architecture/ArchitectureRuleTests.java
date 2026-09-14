package org.akira.ladux.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.core.domain.JavaClass.Predicates.resideInAnyPackage;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static org.junit.jupiter.api.Assertions.assertFalse;

class ArchitectureRuleTests {

    private static final JavaClasses MAIN =
            new ClassFileImporter()
                    .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                    .importPackages("org.akira.ladux");

    // Chỉ áp dụng cycle check cho các business modules
    private static final JavaClasses MODULE_CLASSES = MAIN.that(
            resideInAnyPackage(
                    "org.akira.ladux.identity..",
                    "org.akira.ladux.customer..",
                    "org.akira.ladux.catalog..",
                    "org.akira.ladux.inventory..",
                    "org.akira.ladux.promotion..",
                    "org.akira.ladux.procurement..",
                    "org.akira.ladux.ordering..",
                    "org.akira.ladux.payment..",
                    "org.akira.ladux.notification..",
                    "org.akira.ladux.assistant..",
                    "org.akira.ladux.workflow..",
                    "org.akira.ladux.shared.."
            )
    );

    // 1. Đảm bảo ArchUnit thực sự đọc được code production
    @Test
    void shouldImportProductionCode() {
        assertFalse(MAIN.isEmpty());
    }

    // 2. Các module không được tạo vòng phụ thuộc
    @Test
    void modulesShouldNotHaveCycles() {
        ArchRule rule = slices()
                .matching("org.akira.ladux.(*)..")
                .should()
                .beFreeOfCycles();

        rule.check(MODULE_CLASSES);
    }

    // 3. Controller không được gọi Repository trực tiếp
    @Test
    void controllersShouldNotDependOnRepositories() {
        ArchRule rule = noClasses()
                .that()
                .resideInAPackage("..infrastructure.web..")
                .or()
                .resideInAPackage("..controller..")
                .and()
                .doNotHaveSimpleName("AdminPaymentController")
                .and()
                .doNotHaveSimpleName("AdminRoleController")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                        "..repository..",
                        "..persistence.repository.."
                )
                .allowEmptyShould(true);

        rule.check(MAIN);
    }

    // 4. Domain không được phụ thuộc Infrastructure
    @Test
    void domainShouldNotDependOnInfrastructure() {
        ArchRule rule = noClasses()
                .that()
                .resideInAPackage("..domain..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("..infrastructure..")
                .allowEmptyShould(true);

        rule.check(MAIN);
    }

    // 5. Application không được phụ thuộc Infrastructure
    @Test
    void applicationShouldNotDependOnInfrastructure() {
        ArchRule rule = noClasses()
                .that()
                .resideInAPackage("..application..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("..infrastructure..")
                .allowEmptyShould(true);

        rule.check(MAIN);
    }

    // 6. Shared không được phụ thuộc các module business
    @Test
    void sharedShouldNotDependOnBusinessModules() {
        ArchRule rule = noClasses()
                .that()
                .resideInAPackage("org.akira.ladux.shared..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                        "org.akira.ladux.identity..",
                        "org.akira.ladux.customer..",
                        "org.akira.ladux.catalog..",
                        "org.akira.ladux.inventory..",
                        "org.akira.ladux.promotion..",
                        "org.akira.ladux.procurement..",
                        "org.akira.ladux.ordering..",
                        "org.akira.ladux.payment..",
                        "org.akira.ladux.notification..",
                        "org.akira.ladux.assistant..",
                        "org.akira.ladux.workflow.."
                )
                .allowEmptyShould(true);

        rule.check(MAIN);
    }
}
