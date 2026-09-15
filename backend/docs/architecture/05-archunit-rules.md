# Backend Ladux — Quy tắc ArchUnit

## 1. Mục tiêu và phạm vi

ArchUnit là gate chống hồi quy dependency Java; kiểm thử hành vi bổ sung cho transaction, SQL, lock, bảo mật và runtime wiring. Rule dưới đây là mẫu triển khai, chưa được biên dịch/chạy với Ladux. Khi áp dụng, đối chiếu phiên bản Java, JUnit và ArchUnit trong repository.

Không chỉ kiểm tra “application không import infrastructure”. Phải bảo vệ exported API, chiều import, controller, shared và cycle. Kiểm tra bytecode cần import toàn bộ main code của root package, gồm cả legacy caller; loại test khỏi input chính. [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html).

## 2. Dependency test

Mẫu dùng JUnit Jupiter thông thường và ArchUnit core, không cần engine ArchUnit riêng. Nếu repository đã dùng `archunit-junit5`, tái sử dụng cấu hình đó, không thêm dependency trùng.

```xml
<dependency>
    <groupId>com.tngtech.archunit</groupId>
    <artifactId>archunit</artifactId>
    <version>${archunit.version}</version>
    <scope>test</scope>
</dependency>
```

Khai báo `archunit.version` bằng phiên bản tương thích đã xác nhận từ build; placeholder trên chưa phải một `pom.xml` hoàn chỉnh. Giữ JUnit/test runner hiện có. Mẫu Java dùng `Map.ofEntries` và `Set.of`, phù hợp Java hiện đại; không nâng JDK chỉ để sao chép mẫu.

## 3. Mẫu gate ranh giới

Đặt test ở `src/test/java/org/akira/ladux/architecture/ArchitectureRuleTest.java`. Ma trận trong code phải khớp [quy tắc phụ thuộc](03-dependency-rules.md#2-ma-tran-phu-thuoc); mọi thay đổi phải cập nhật cả hai cùng PR.

Mẫu dùng `shared.api` cho primitive xuất ra ngoài; cấu hình/adapter chung ở `shared.infrastructure` không được import trực tiếp từ module khác. Phần `api` chỉ tham chiếu JDK, validation annotation, chính API và primitive shared.

```java
package org.akira.ladux.architecture;

import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ArchitectureRuleTest {
    private static final String ROOT = "org.akira.ladux.";
    private static final Map<String, Set<String>> ALLOWED = Map.ofEntries(
        Map.entry("identity", Set.of()),
        Map.entry("customer", Set.of("identity")),
        Map.entry("catalog", Set.of("identity")),
        Map.entry("inventory", Set.of("catalog")),
        Map.entry("promotion", Set.of("customer")),
        Map.entry("ordering", Set.of("catalog", "inventory", "promotion", "identity", "customer")),
        Map.entry("procurement", Set.of("catalog", "inventory", "identity")),
        Map.entry("payment", Set.of("ordering", "identity")),
        Map.entry("notification", Set.of("identity", "ordering", "payment")),
        Map.entry("assistant", Set.of("catalog")),
        Map.entry("workflow", Set.of("identity", "customer", "catalog", "inventory",
            "promotion", "procurement", "ordering", "payment", "notification")),
        Map.entry("shared", Set.of())
    );
    private static final JavaClasses MAIN = new ClassFileImporter()
        .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
        .importPackages("org.akira.ladux");

    // Ví dụ cho mốc bắt đầu bảo vệ Catalog. Thay bằng module thật đã kích hoạt.
    // Không tự điền tên module chưa có source; không để rỗng sau khi bắt đầu pilot.
    private static final Set<String> EXPECTED_MODULES = Set.of("catalog");

    private static boolean in(JavaClass type, String packageName) {
        String actual = type.getPackageName();
        return actual.equals(packageName) || actual.startsWith(packageName + ".");
    }

    private static String module(JavaClass type) {
        String pkg = type.getPackageName();
        if (!pkg.startsWith(ROOT)) return "";
        String first = pkg.substring(ROOT.length()).split("\\.", 2)[0];
        return ALLOWED.containsKey(first) ? first : "";
    }

    private static boolean api(JavaClass type, String owner) {
        return !owner.isEmpty() && in(type, ROOT + owner + ".api");
    }

    private static boolean layer(JavaClass type, String owner, String name) {
        return !owner.isEmpty() && in(type, ROOT + owner + "." + name);
    }

    private static boolean apiTypeAllowed(JavaClass target, String owner) {
        return target.isPrimitive() || in(target, "java")
            || in(target, "jakarta.validation")
            || api(target, owner) || in(target, ROOT + "shared.api");
    }

    private static boolean dataAccess(JavaClass target) {
        return in(target, "org.springframework.data")
            || in(target, "org.springframework.jdbc")
            || in(target, "java.sql") || in(target, "javax.sql")
            || target.getName().equals("jakarta.persistence.EntityManager")
            || target.isAssignableTo("org.springframework.data.repository.Repository");
    }

    private static void reject(ConditionEvents events, Dependency dependency,
                               String reason) {
        events.add(SimpleConditionEvent.violated(dependency,
            reason + ": " + dependency.getDescription()));
    }

    static final ArchRule BOUNDARIES = classes()
        .that().resideInAPackage("org.akira.ladux..")
        .should(new ArchCondition<JavaClass>("respect Ladux module boundaries") {
            @Override
            public void check(JavaClass origin, ConditionEvents events) {
                String source = module(origin);
                boolean controller = origin.isAnnotatedWith("org.springframework.web.bind.annotation.RestController")
                    || origin.isAnnotatedWith("org.springframework.stereotype.Controller");
                if (!source.isEmpty() && !origin.getSimpleName().equals("package-info")) {
                    boolean legalLayout = api(origin, source)
                        || layer(origin, source, "application")
                        || layer(origin, source, "domain")
                        || layer(origin, source, "infrastructure");
                    if (!legalLayout) {
                        events.add(SimpleConditionEvent.violated(origin,
                            "Illegal module layout: " + origin.getName()));
                    }
                    if (controller && !layer(origin, source, "infrastructure.web")) {
                        events.add(SimpleConditionEvent.violated(origin,
                            "Controller outside web adapter: " + origin.getName()));
                    }
                    if (source.equals("workflow")
                            && (layer(origin, source, "domain")
                                || layer(origin, source, "infrastructure.persistence")
                                || origin.isAnnotatedWith("jakarta.persistence.Entity"))) {
                        events.add(SimpleConditionEvent.violated(origin,
                            "Workflow owns business persistence/domain: " + origin.getName()));
                    }
                }
                for (Dependency dependency : origin.getDirectDependenciesFromSelf()) {
                    JavaClass target = dependency.getTargetClass();
                    String destination = module(target);
                    boolean cross = !source.equals(destination);

                    // Kể cả caller legacy cũng không được vào internals module mới.
                    if (cross && !destination.isEmpty() && !api(target, destination)) {
                        reject(events, dependency, "Foreign module internal access");
                    }
                    if (!source.isEmpty() && cross && !destination.isEmpty()
                            && !destination.equals("shared")
                            && !ALLOWED.get(source).contains(destination)) {
                        reject(events, dependency, "Forbidden module direction");
                    }
                    if (source.equals("workflow") && dataAccess(target)) {
                        reject(events, dependency, "Workflow directly accesses persistence");
                    }
                    // Module mới không được kéo ngược vào package legacy.
                    if (!source.isEmpty() && destination.isEmpty()
                            && in(target, "org.akira.ladux")) {
                        reject(events, dependency, "Dependency on legacy package");
                    }
                    if (api(origin, source) && !apiTypeAllowed(target, source)) {
                        reject(events, dependency, "Exported API type leak");
                    }
                    if (layer(origin, source, "application")
                            && (layer(target, source, "infrastructure") || dataAccess(target))) {
                        reject(events, dependency, "Application depends on data adapter");
                    }
                    if (layer(origin, source, "domain")
                            && (layer(target, source, "application")
                                || layer(target, source, "infrastructure")
                                || (cross && !destination.isEmpty() && !destination.equals("shared"))
                                || in(target, "org.springframework") || dataAccess(target))) {
                        reject(events, dependency, "Domain dependency violation");
                    }
                    if (layer(origin, source, "infrastructure.web")
                            && (layer(target, source, "domain") || dataAccess(target)
                                || (layer(target, source, "infrastructure")
                                    && !layer(target, source, "infrastructure.web")))) {
                        reject(events, dependency, "Web bypasses application");
                    }
                    if (layer(origin, source, "infrastructure.web") && cross
                            && !destination.isEmpty() && !destination.equals("shared")) {
                        reject(events, dependency, "Web calls a foreign module directly");
                    }
                }
            }
        });

    static final ArchRule CYCLES = slices()
        .matching("org.akira.ladux.(*)..")
        .should().beFreeOfCycles();

    @Test
    void importedScopeIsReal() {
        assertFalse(MAIN.isEmpty(), "No production classes imported");
        assertFalse(EXPECTED_MODULES.isEmpty(), "Pilot module coverage is required");
        for (String expected : EXPECTED_MODULES) {
            boolean present = false;
            for (JavaClass type : MAIN) {
                if (module(type).equals(expected)) present = true;
            }
            assertTrue(present, "Missing expected module: " + expected);
        }
    }

    @Test
    void boundaries() { BOUNDARIES.check(MAIN); }

    @Test
    void noCycles() { CYCLES.check(MAIN); }
}
```

Đây là bản strict. Trước pilot, nếu chưa có package module nào, giữ gate import và baseline legacy; kích hoạt `EXPECTED_MODULES` cùng commit tạo module đầu tiên. Sau khi kích hoạt không bỏ module khỏi coverage để làm test xanh. Không hiểu `Set.of("catalog")` là xác nhận Catalog hiện đã tồn tại.

Ví dụ không tự nhận diện mọi SDK/persistence framework. Khi dùng JPA API cũ `javax.persistence`, JDBC wrapper khác hoặc SDK mới, bổ sung predicate tương ứng và fixture. API primitive shared cũng phải qua kiểm tra whitelist vì `shared.api` là exported API.

## 4. Coverage cần hoàn tất khi áp dụng

| Gate | Cách kiểm tra |
| --- | --- |
| Layout module | Mẫu kiểm tra bốn tầng; ngoại lệ bootstrap/package-info cần review, không bỏ qua toàn module |
| Workflow không sở hữu persistence | Mẫu chặn domain/persistence package, JPA entity và data access phổ biến; bổ sung wrapper persistence thực tế nếu có |
| Controller ở đúng tầng | Mẫu nhận diện annotation trực tiếp; bổ sung composed annotation nếu repository sử dụng |
| API không có entity/SDK | Thử cả annotation `@Entity`, `List<Entity>`, DTO lồng entity, superclass/array và kiểu SDK |
| Domain thuần có chọn lọc | Nếu Payment domain được chọn strict, cấm thêm JPA ngoài cấm Spring; không áp dụng tùy tiện toàn codebase |
| Toàn bộ module đã kích hoạt | Kiểm tra module/layout cần có không rỗng và input là main bytecode thật |

Mẫu đã kiểm tra các đường dependency và layout chính; coverage còn lại phải hoàn tất bằng fixture và predicate khớp repository trong Foundation/pilot. Không mô tả một mẫu chưa chạy như gate đã chứng minh đầy đủ. Rule dựa tên package không thay thế review SQL, reflection hoặc transaction wiring.

## 5. Baseline legacy và cycle từ ngày đầu

Nếu strict gate thất bại vì vi phạm cũ, có thể dùng `FreezingArchRule.freeze(BOUNDARIES)` và `FreezingArchRule.freeze(CYCLES)` trong giai đoạn chuyển tiếp. Chỉ tạo baseline sau khi review các vi phạm thực tế; commit store cùng danh mục owner/điều kiện gỡ. CI không tự tạo store mới hoặc refreeze. [ArchUnit freezing rules](https://www.archunit.org/userguide/html/000_Index.html#_freezing_arch_rules).

```properties
# src/test/resources/archunit.properties — sau khi baseline được tạo có kiểm soát
freeze.store.default.path=src/test/resources/architecture-baseline
freeze.store.default.allowStoreCreation=false
freeze.store.default.allowStoreUpdate=false
freeze.refreeze=false
```

Xác nhận tên property với ArchUnit đã chọn. Bản mẫu tắt ghi store trong CI; cập nhật baseline cục bộ có kiểm soát khi gỡ vi phạm. Không đổi tên rule hay điều chỉnh matcher nhằm làm mất dấu vi phạm cũ. Không freeze rule rỗng vì import sai package.

Baseline chỉ bảo vệ “không thêm vi phạm”; nó chưa chứng minh một module đã đóng. Khi đánh dấu module hoàn tất, chạy strict rule riêng cho toàn bộ cạnh đi vào/ra module đó và xóa mọi ngoại lệ tạm tương ứng. Giữ cycle gate trên toàn graph ngay cả khi phần lớn source còn legacy. Cuối migration, bỏ freeze và chạy strict toàn bộ.

## 6. Kiểm thử chính các rule

Đây là các test có ý nghĩa vì gate sai có thể cho phép phá ranh giới lâu dài. Dùng fixture ngoài package production được import, kiểm tra `rule.evaluate(fixture).hasViolation()` theo kỳ vọng.

- Hợp lệ: Customer → Identity API; Promotion → Customer API; Ordering application → Catalog/Inventory/Promotion/Identity/Customer API; Assistant → Catalog API; Payment → Ordering/Identity API; workflow → Ordering/Payment API; Catalog domain dùng JPA theo chính sách.
- Vi phạm: Promotion → Identity API trực tiếp (phải qua Customer API theo ma trận); Ordering → Payment API; Catalog → Inventory API; Identity listener import Ordering event (ngược chiều event/dependency); shared → nghiệp vụ; nghiệp vụ → workflow; Assistant → repository/internal Catalog.
- Vi phạm: API trả `List<Entity>`/array/nested DTO chứa entity; API tham chiếu SDK hoặc Spring Data Page; domain gọi application.
- Vi phạm: controller gọi repository đổi tên, hoặc repository đặt sai package; legacy caller vào Catalog internal.
- Vi phạm: thêm dependency cycle; import rỗng hoặc module mong đợi không có class.

Fixture API leak phải được kiểm tra với phiên bản ArchUnit thực tế vì độ phân giải generic/type ngoài classpath ảnh hưởng coverage. Import đầy đủ các class liên quan; nếu mẫu bỏ lọt fixture, bổ sung rule trước khi dùng làm gate.

## 7. CI và giới hạn bằng chứng

Chạy test kiến trúc mục tiêu khi phát triển; gate merge dùng Maven `verify` với unit và integration test đã cấu hình. Kiểm tra số test thực sự chạy, báo cáo Surefire/Failsafe và các cờ skip. Không khẳng định `verify` đã chạy integration test chỉ từ exit code 0. [Failsafe](https://maven.apache.org/surefire/maven-failsafe-plugin/usage.html).

ArchUnit không chứng minh unique constraint, stock writer trong SQL, rollback vật lý, hiệu lực proxy, API compatibility, chữ ký gateway hoặc độ bền event. Những điều đó cần các kịch bản trong [kế hoạch di chuyển](04-migration-plan.md#5-ma-tran-kiem-chung-trong-yeu). Chỉ báo cáo test đã thực sự chạy; bản chỉnh tài liệu này chưa thực thi gate trên source Ladux.
