# Backend Ladux — Quy tắc ArchUnit (ArchUnit Rules)

## 1. Mục đích

Tài liệu kiến trúc giải thích ý đồ thiết kế.

ArchUnit sẽ thực thi và đảm bảo ý đồ đó được tuân thủ nghiêm ngặt trong mã nguồn.

Áp dụng chiến lược kiểm tra tăng dần: thiết lập các quy tắc chặt chẽ cho các module đã di chuyển, tránh làm fail toàn bộ dự án vì mã nguồn legacy chưa kịp chuyển đổi.

## 2. Dependency khuyến nghị

Kiểm tra phiên bản ArchUnit tương thích trước khi cài đặt.

Ví dụ dependency trong Maven:

```xml
<dependency>
    <groupId>com.tngtech.archunit</groupId>
    <artifactId>archunit</artifactId>
    <version>${archunit.version}</version>
    <scope>test</scope>
</dependency>
```

## 3. Đường dẫn test gợi ý

```text
backend/
└── src/test/java/org/akira/ladux/architecture/
    └── ModularArchitectureTest.java
```

## 4. Ví dụ Baseline ban đầu

```java
package org.akira.ladux.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

class ModularArchitectureTest {

    private static final JavaClasses CLASSES =
            new ClassFileImporter()
                    .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                    .importPackages("org.akira.ladux");

    @Test
    void sharedMustNotDependOnBusinessModules() {
        noClasses()
                .that().resideInAPackage("org.akira.ladux.shared..")
                .should().dependOnClassesThat()
                .resideInAnyPackage(
                        "org.akira.ladux.identity..",
                        "org.akira.ladux.catalog..",
                        "org.akira.ladux.ordering..",
                        "org.akira.ladux.payment..",
                        "org.akira.ladux.inventory..",
                        "org.akira.ladux.procurement..",
                        "org.akira.ladux.promotion..",
                        "org.akira.ladux.notification.."
                )
                .check(CLASSES);
    }

    @Test
    void applicationMustNotDependOnInfrastructure() {
        noClasses()
                .that().resideInAPackage("org.akira.ladux..application..")
                .should().dependOnClassesThat()
                .resideInAPackage("org.akira.ladux..infrastructure..")
                .check(CLASSES);
    }

    @Test
    void domainMustNotDependOnWeb() {
        noClasses()
                .that().resideInAPackage("org.akira.ladux..domain..")
                .should().dependOnClassesThat()
                .resideInAPackage("org.akira.ladux..infrastructure.web..")
                .check(CLASSES);
    }
}
```

## 5. Bảo vệ nội bộ module

Sau khi một module đã hoàn thành di chuyển:

```java
@Test
void catalogImplementationMustBeInternal() {
    assertModuleImplementationIsInternal("catalog");
}

private static void assertModuleImplementationIsInternal(String module) {
    String root = "org.akira.ladux." + module;

    classes()
            .that().resideInAnyPackage(
                    root + ".application..",
                    root + ".domain..",
                    root + ".infrastructure.."
            )
            .should().onlyHaveDependentClassesThat()
            .resideInAPackage(root + "..")
            .check(CLASSES);
}
```

Các module khác được phép phụ thuộc vào:

```text
org.akira.ladux.catalog.api..
```

nhưng tuyệt đối không được chạm vào nội bộ của Catalog.

Kích hoạt từng rule tương ứng cho từng module đã di chuyển:

```text
catalog
promotion
inventory
procurement
ordering
payment
identity
notification
```

## 6. Quy tắc Controller -> repository

Không bật quy tắc này trên phạm vi toàn cục khi vẫn còn vi phạm ở code legacy, trừ khi bạn chủ động sửa chúng trong cùng một task.

Sau khi đã dọn dẹp các vi phạm legacy:

```java
@Test
void controllersMustNotAccessPersistenceDirectly() {
    noClasses()
            .that().resideInAnyPackage(
                    "org.akira.ladux.controller..",
                    "org.akira.ladux..infrastructure.web.."
            )
            .should().dependOnClassesThat()
            .resideInAnyPackage(
                    "org.akira.ladux.repository..",
                    "org.akira.ladux..infrastructure.persistence.."
            )
            .check(CLASSES);
}
```

## 7. Quy tắc Clean nghiêm ngặt — Tùy chọn theo từng module

Chỉ bật ở những nơi mà module đã thực sự sẵn sàng:

```java
@Test
void paymentDomainMustNotDependOnSpringOrJpa() {
    noClasses()
            .that().resideInAPackage("org.akira.ladux.payment.domain..")
            .should().dependOnClassesThat()
            .resideInAnyPackage(
                    "org.springframework..",
                    "jakarta.persistence.."
            )
            .check(CLASSES);
}
```

Các ứng viên khuyến nghị:
- Payment;
- Một số chính sách domain chọn lọc của Ordering;
- Các chính sách bảo mật của Identity.

Không bật quy tắc này cho toàn bộ các entity CRUD chỉ vì mục tiêu hình thức.

## 8. Quy tắc chống phụ thuộc vòng (Cycle rule)

Sau khi hầu hết các package kỹ thuật toàn cục cũ đã được loại bỏ:

```java
@Test
void businessModulesMustBeFreeOfCycles() {
    slices()
            .matching("org.akira.ladux.(*)..")
            .should().beFreeOfCycles()
            .check(CLASSES);
}
```

## 9. Ví dụ quy tắc chéo module

Payment có thể phụ thuộc vào `ordering.api`, nhưng không được phụ thuộc vào nội bộ của Ordering:

```java
@Test
void paymentMustNotDependOnOrderingImplementation() {
    noClasses()
            .that().resideInAPackage("org.akira.ladux.payment..")
            .should().dependOnClassesThat()
            .resideInAnyPackage(
                    "org.akira.ladux.ordering.application..",
                    "org.akira.ladux.ordering.domain..",
                    "org.akira.ladux.ordering.infrastructure.."
            )
            .check(CLASSES);
}
```

## 10. Chính sách ngoại lệ nợ kiến trúc (Architecture debt exception policy)

Mọi ngoại lệ tạm thời đều bắt buộc phải ghi rõ:
- Lý do (reason);
- Người/module chịu trách nhiệm (owner);
- Điều kiện tháo gỡ (removal condition);
- Cột mốc di chuyển mục tiêu (target migration phase).

Ví dụ:

```java
/*
 * NỢ KIẾN TRÚC TẠM THỜI
 * Lý do:
 * Inventory vẫn ghi tồn kho thông qua bảng ProductVariant hiện có.
 *
 * Điều kiện tháo gỡ:
 * Khi persistence adapter của Inventory làm chủ hoàn toàn luồng biến động tồn kho.
 *
 * Cột mốc:
 * Giai đoạn di chuyển Inventory.
 */
```

Không sử dụng các danh sách cho phép (allowlist) chung chung vô thời hạn.

## 11. Tích hợp CI

Khuyến nghị:

```yaml
name: backend-ci

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  backend-verify:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: temurin
          cache: maven
          cache-dependency-path: backend/pom.xml

      - run: chmod +x mvnw

      - name: Architecture gate
        run: ./mvnw --batch-mode --no-transfer-progress -Dtest=ModularArchitectureTest test

      - name: Full verification
        run: ./mvnw --batch-mode --no-transfer-progress verify
```

Nếu các bài kiểm thử Testcontainers nằm trong bước `verify`, hãy đảm bảo môi trường container runtime tương thích đã sẵn sàng.

## 12. Lộ trình triển khai rule

```text
Catalog hoàn thành di chuyển
    -> bật rule bảo vệ nội bộ Catalog

Promotion hoàn thành di chuyển
    -> bật rule bảo vệ nội bộ Promotion

Inventory hoàn thành di chuyển
    -> bật rule bảo vệ nội bộ Inventory

...

Các package legacy được dọn dẹp xong
    -> bật rule toàn cục chống phụ thuộc vòng (no-cycle)
    -> bật rule toàn cục cấm controller -> repository
```

## 13. Định nghĩa hoàn thành

Hệ thống kiểm soát kiến trúc được coi là hoàn thiện khi:

- [ ] Nội bộ các module đã di chuyển được bảo vệ hoàn toàn;
- [ ] `shared` không thể phụ thuộc vào các module nghiệp vụ;
- [ ] Tầng application không phụ thuộc vào triển khai cụ thể của infrastructure;
- [ ] Mọi truy cập trái phép vào nội bộ module khác đều khiến test fail;
- [ ] Các bài kiểm thử kiến trúc được thực thi tự động trên CI;
- [ ] Bắt buộc CI phải pass trước khi merge;
- [ ] Không hạ thấp tiêu chuẩn kiểm tra để che giấu nợ kỹ thuật.
