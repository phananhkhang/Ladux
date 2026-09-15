package org.akira.ladux.architecture;

import com.tngtech.archunit.base.DescribedPredicate;
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

/**
 * Bộ kiểm thử kiến trúc tự động (ArchUnit) cho Ladux Backend.
 * <p>
 * Mục tiêu:
 * - Bảo vệ ranh giới Modular Monolith và mô hình Clean/Hexagonal Architecture có chọn lọc.
 * - Đảm bảo các phụ thuộc biên dịch (import, kiểu trả về, field, lời gọi hàm) tuân thủ
 *   chính xác "Ma trận phụ thuộc" (03-dependency-rules.md).
 * - Ngăn chặn cycle, rò rỉ dữ liệu (entity/SDK leak qua API), vi phạm tầng (controller gọi repo,
 *   application phụ thuộc adapter, domain phụ thuộc infrastructure).
 */
class ArchitectureRuleTest {

    // =========================================================================
    // SECTION 1: HẰNG SỐ CẤU HÌNH & MA TRẬN PHỤ THUỘC (DEPENDENCY MATRIX)
    // =========================================================================

    /**
     * Tiền tố package gốc của mã nguồn Ladux.
     */
    private static final String ROOT = "org.akira.ladux.";

    /**
     * MA TRẬN PHỤ THUỘC CHÉO MODULE (Source module -> Allowed target modules).
     * Nguồn thẩm quyền duy nhất: docs/architecture/03-dependency-rules.md#02-ma-tran-phu-thuoc.
     * <p>
     * Quy tắc toàn cục:
     * - Mọi module đều được phép phụ thuộc {@code shared.api}.
     * - Không module nào được phép phụ thuộc {@code shared.infrastructure}.
     * - Chỉ tầng application/infrastructure mới được gọi API của module khác; domain và api không được gọi chéo.
     */
    private static final Map<String, Set<String>> ALLOWED = Map.ofEntries(
        // Identity: Quản lý xác thực/tài khoản, là module nền tảng, không phụ thuộc module nghiệp vụ nào khác
        Map.entry("identity", Set.of()),

        // Customer: Quản lý hồ sơ/hạng khách hàng/loyalty, chỉ phụ thuộc identity.api để liên kết tài khoản
        Map.entry("customer", Set.of("identity")),

        // Catalog: Quản lý danh mục sản phẩm, biến thể, giá niêm yết, chỉ phụ thuộc identity.api (actor/security)
        Map.entry("catalog", Set.of("identity")),

        // Inventory: Quản lý kho hàng & biến động stock, chỉ phụ thuộc catalog.api để xác thực thông tin variant
        Map.entry("inventory", Set.of("catalog")),

        // Promotion: Quản lý coupon/khuyến mãi, phụ thuộc customer.api để tra cứu điều kiện khách hàng/loyalty
        Map.entry("promotion", Set.of("customer")),

        // Ordering: Quản lý giỏ hàng/đơn hàng, phối hợp thông tin từ catalog, inventory, promotion, identity, customer
        Map.entry("ordering", Set.of("catalog", "inventory", "promotion", "identity", "customer")),

        // Procurement: Nhập hàng từ nhà cung cấp, gọi catalog (sản phẩm), inventory (nhập kho), identity (người tạo đơn)
        Map.entry("procurement", Set.of("catalog", "inventory", "identity")),

        // Payment: Xử lý thanh toán/hoàn tiền, phụ thuộc ordering.api (lấy số tiền/trạng thái đơn) và identity.api
        Map.entry("payment", Set.of("ordering", "identity")),

        // Notification: Gửi email/SMS/inbox thông báo, lắng nghe event từ identity, ordering, payment
        Map.entry("notification", Set.of("identity", "ordering", "payment")),

        // Assistant: AI chatbot/tìm kiếm ngữ nghĩa, phụ thuộc catalog.api để đọc thông tin sản phẩm phục vụ trợ lý
        Map.entry("assistant", Set.of("catalog")),

        // Workflow: Bộ điều phối luồng nghiệp vụ phức tạp liên module (ví dụ checkout nguyên tử tạo order + payment intent),
        // được phép gọi API của 9 module nghiệp vụ khi luồng cụ thể cần. Không module nào được phụ thuộc ngược vào workflow.
        Map.entry("workflow", Set.of("identity", "customer", "catalog", "inventory",
            "promotion", "procurement", "ordering", "payment", "notification")),

        // Shared: Chứa primitive kỹ thuật, không phụ thuộc bất kỳ module nghiệp vụ hay workflow nào
        Map.entry("shared", Set.of())
    );

    /**
     * Nạp toàn bộ bytecode của production code trong package "org.akira.ladux".
     * Bộ lọc DO_NOT_INCLUDE_TESTS đảm bảo các class test (mock, fixture) không bị quét nhầm.
     */
    private static final JavaClasses MAIN = new ClassFileImporter()
        .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
        .importPackages("org.akira.ladux");

    /**
     * Danh sách module tối thiểu bắt buộc phải tồn tại trong build để tránh trường hợp test xanh giả
     * (ví dụ khi cấu trúc package bị xóa sạch hoặc gõ sai tên package).
     * Sẽ mở rộng dần khi từng module được hoàn thiện (pilot ban đầu là catalog).
     */
    private static final Set<String> EXPECTED_MODULES = Set.of("catalog");

    // =========================================================================
    // SECTION 2: CÁC HÀM BỔ TRỢ PHÂN TÍCH PACKAGE, MODULE & LAYER (HELPERS)
    // =========================================================================

    /**
     * Kiểm tra một class có thuộc package chỉ định hoặc sub-package của nó hay không.
     */
    private static boolean in(JavaClass type, String packageName) {
        String actual = type.getPackageName();
        return actual.equals(packageName) || actual.startsWith(packageName + ".");
    }

    /**
     * Trích xuất tên module nghiệp vụ cấp 1 từ package của class.
     * Ví dụ: "org.akira.ladux.catalog.domain.Product" -> "catalog".
     * Nếu class thuộc package legacy chưa chia module (hoặc ngoài ALLOWED) -> trả về chuỗi rỗng "".
     */
    private static String module(JavaClass type) {
        String pkg = type.getPackageName();
        if (!pkg.startsWith(ROOT)) return "";
        String first = pkg.substring(ROOT.length()).split("\\.", 2)[0];
        return ALLOWED.containsKey(first) ? first : "";
    }

    /**
     * Tập hợp các class thuộc về các module nghiệp vụ đã được định nghĩa trong ALLOWED (loại trừ package legacy).
     */
    private static final JavaClasses MODULE_CLASSES = MAIN.that(
        DescribedPredicate.describe("belong to recognized module", type -> !module(type).isEmpty())
    );

    /**
     * Kiểm tra xem class có nằm trong package API công khai của module (ví dụ {@code <module>.api..}) hay không.
     */
    private static boolean api(JavaClass type, String owner) {
        return !owner.isEmpty() && in(type, ROOT + owner + ".api");
    }

    /**
     * Kiểm tra xem class có nằm trong một layer kỹ thuật cụ thể của module hay không.
     * Ví dụ: layer(type, "ordering", "application") kiểm tra xem class có thuộc {@code ordering.application..} không.
     */
    private static boolean layer(JavaClass type, String owner, String name) {
        return !owner.isEmpty() && in(type, ROOT + owner + "." + name);
    }

    /**
     * Whitelist các kiểu dữ liệu được phép xuất hiện trong contract API công khai của module.
     * Theo 03-dependency-rules.md:
     * - Chỉ cho phép: Kiểu nguyên thủy (primitive), kiểu chuẩn JDK (java.*), annotation validation (jakarta.validation),
     *   các kiểu contract nội bộ của chính api module đó, và primitive dùng chung từ {@code shared.api}.
     * - Tuyệt đối CẤM: JPA Entity, Spring Data Page, SDK bên thứ ba, kiểu nội bộ application/infrastructure/domain.
     */
    private static boolean apiTypeAllowed(JavaClass target, String owner) {
        return target.isPrimitive() || in(target, "java")
            || in(target, "jakarta.validation")
            || api(target, owner) || in(target, ROOT + "shared.api");
    }

    /**
     * Nhận diện các kiểu dữ liệu, interface hoặc framework liên quan đến truy cập cơ sở dữ liệu (Data Access / Persistence).
     * Dùng để ngăn chặn tầng Web, Application, Domain hoặc Workflow truy cập trực tiếp DB mà không thông qua Port/Adapter.
     */
    private static boolean dataAccess(JavaClass target) {
        return in(target, "org.springframework.data")
            || in(target, "org.springframework.jdbc")
            || in(target, "java.sql") || in(target, "javax.sql")
            || target.getName().equals("jakarta.persistence.EntityManager")
            || target.isAssignableTo("org.springframework.data.repository.Repository");
    }

    /**
     * Helper ghi nhận vi phạm kiểm thử kiến trúc kèm thông điệp rõ ràng phục vụ CI log.
     */
    private static void reject(ConditionEvents events, Dependency dependency,
                               String reason) {
        events.add(SimpleConditionEvent.violated(dependency,
            reason + ": " + dependency.getDescription()));
    }

    // =========================================================================
    // SECTION 3: ARCHUNIT RULE - KIỂM SOÁT TOÀN DIỆN RANH GIỚI (BOUNDARIES)
    // =========================================================================

    /**
     * Rule cốt lõi kiểm tra toàn bộ ranh giới kiến trúc của hệ thống Ladux:
     * 1. Cấu trúc 4 tầng chuẩn bên trong mỗi module: api, application, domain, infrastructure.
     * 2. Đặt vị trí Controller đúng trong infrastructure.web.
     * 3. Workflow không được phép sở hữu persistence hay domain riêng.
     * 4. Các ràng buộc liên module:
     *    - Module khác (kể cả legacy) chỉ được gọi vào qua exported contract (api), cấm chọc vào internals.
     *    - Hướng phụ thuộc chéo module phải nằm trong ma trận ALLOWED.
     *    - Module mới không phụ thuộc ngược vào package legacy.
     *    - Exported API không bị rò rỉ kiểu (leak).
     *    - Application không phụ thuộc trực tiếp vào data adapter / persistence.
     *    - Domain hoàn toàn thuần khiết (không gọi app, infra, spring, db, foreign module).
     *    - Controller / Web không bypass application và không gọi trực tiếp module khác.
     */
    static final ArchRule BOUNDARIES = classes()
        .that().resideInAPackage("org.akira.ladux..")
        .should(new ArchCondition<JavaClass>("respect Ladux module boundaries") {
            @Override
            public void check(JavaClass origin, ConditionEvents events) {
                String source = module(origin);
                boolean controller = origin.isAnnotatedWith("org.springframework.web.bind.annotation.RestController")
                    || origin.isAnnotatedWith("org.springframework.stereotype.Controller");

                // --- PHẦN A: KIỂM TRA BẢN THÂN CLASS (LAYOUT VÀ VAI TRÒ NỘI TẠI) ---
                if (!source.isEmpty() && !origin.getSimpleName().equals("package-info")) {
                    // Module nghiệp vụ chỉ được tổ chức theo 4 package con chuẩn
                    boolean legalLayout = api(origin, source)
                        || layer(origin, source, "application")
                        || layer(origin, source, "domain")
                        || layer(origin, source, "infrastructure");
                    if (!legalLayout) {
                        events.add(SimpleConditionEvent.violated(origin,
                            "Illegal module layout (must reside in api, application, domain, or infrastructure): " + origin.getName()));
                    }

                    // REST Controller bắt buộc phải nằm trong infrastructure.web
                    if (controller && !layer(origin, source, "infrastructure.web")) {
                        events.add(SimpleConditionEvent.violated(origin,
                            "Controller outside web adapter: " + origin.getName()));
                    }

                    // Workflow chỉ đóng vai trò điều phối, không được tạo persistence, domain hay JPA entity riêng
                    if (source.equals("workflow")
                            && (layer(origin, source, "domain")
                                || layer(origin, source, "infrastructure.persistence")
                                || origin.isAnnotatedWith("jakarta.persistence.Entity"))) {
                        events.add(SimpleConditionEvent.violated(origin,
                            "Workflow owns business persistence/domain: " + origin.getName()));
                    }
                }

                // --- PHẦN B: KIỂM TRA TỪNG DEPENDENCY ĐI RA TỪ CLASS (DIRECT DEPENDENCY CHECK) ---
                for (Dependency dependency : origin.getDirectDependenciesFromSelf()) {
                    JavaClass target = dependency.getTargetClass();
                    String destination = module(target);
                    boolean cross = !source.equals(destination);

                    // 1. Cấm truy cập internals của module khác: Bất kỳ lời gọi chéo module nào
                    // (kể cả từ legacy caller) đều phải đi qua target package .api..
                    if (cross && !destination.isEmpty() && !api(target, destination)) {
                        reject(events, dependency, "Foreign module internal access");
                    }

                    // 2. Kiểm tra hướng phụ thuộc theo Ma trận ALLOWED (ngoại trừ shared.api là toàn cục)
                    if (!source.isEmpty() && cross && !destination.isEmpty()
                            && !destination.equals("shared")
                            && !ALLOWED.get(source).contains(destination)) {
                        reject(events, dependency, "Forbidden module direction");
                    }

                    // 3. Workflow không được gọi trực tiếp JDBC/Repository/EntityManager (phải qua API module nghiệp vụ)
                    if (source.equals("workflow") && dataAccess(target)) {
                        reject(events, dependency, "Workflow directly accesses persistence");
                    }

                    // 4. Mã nguồn trong module mới đã chuẩn hóa không được phụ thuộc ngược vào package legacy
                    if (!source.isEmpty() && destination.isEmpty()
                            && in(target, "org.akira.ladux")) {
                        reject(events, dependency, "Dependency on legacy package");
                    }

                    // 5. Ngăn ngừa rò rỉ kiểu dữ liệu ở tầng Exported API (không chứa entity, SDK, spring class...)
                    if (api(origin, source) && !apiTypeAllowed(target, source)) {
                        reject(events, dependency, "Exported API type leak");
                    }

                    // 6. Tầng Application không được phụ thuộc trực tiếp vào Infrastructure hoặc Data Access
                    // (Clean Architecture: Application giao tiếp qua Outbound Port/Interface)
                    if (layer(origin, source, "application")
                            && (layer(target, source, "infrastructure") || dataAccess(target))) {
                        reject(events, dependency, "Application depends on data adapter");
                    }

                    // 7. Tầng Domain độc lập: Cấm phụ thuộc Application, Infrastructure, Data Access,
                    // framework Spring hoặc module nghiệp vụ khác (trừ primitive dùng chung từ shared.api)
                    if (layer(origin, source, "domain")
                            && (layer(target, source, "application")
                                || layer(target, source, "infrastructure")
                                || (cross && !destination.isEmpty() && !destination.equals("shared"))
                                || in(target, "org.springframework") || dataAccess(target))) {
                        reject(events, dependency, "Domain dependency violation");
                    }

                    // 8. Tầng Web không được đi tắt (bypass) qua Application để gọi thẳng Domain, Persistence hoặc Adapter khác
                    if (layer(origin, source, "infrastructure.web")
                            && (layer(target, source, "domain") || dataAccess(target)
                                || (layer(target, source, "infrastructure")
                                    && !layer(target, source, "infrastructure.web")))) {
                        reject(events, dependency, "Web bypasses application");
                    }

                    // 9. Controller / Web Adapter của module này không được gọi trực tiếp module khác
                    // (phải ủy thác cho tầng Application cùng module hoặc điều phối qua Workflow)
                    if (layer(origin, source, "infrastructure.web") && cross
                            && !destination.isEmpty() && !destination.equals("shared")) {
                        reject(events, dependency, "Web calls a foreign module directly");
                    }
                }
            }
        });

    // =========================================================================
    // SECTION 4: ARCHUNIT RULE - CHỐNG VÒNG LẶP PHỤ THUỘC (NO CYCLES)
    // =========================================================================

    /**
     * Quy tắc kiểm tra không có chu trình phụ thuộc (cyclic dependency) giữa các module cấp 1.
     * Slices matching "org.akira.ladux.(*).." tách mã nguồn thành từng slice theo tên module
     * và đảm bảo không có vòng lặp dạng A -> B -> A hoặc A -> B -> C -> A.
     */
    static final ArchRule CYCLES = slices()
        .matching("org.akira.ladux.(*)..")
        .should().beFreeOfCycles();

    // =========================================================================
    // SECTION 5: CÁC PHƯƠNG THỨC KIỂM THỬ (@Test)
    // =========================================================================

    /**
     * Kiểm tra tính hợp lệ của phạm vi quét bytecode:
     * 1. Đảm bảo ArchUnit thực sự nạp được mã nguồn production (không bị rỗng).
     * 2. Đảm bảo các module mục tiêu (như Catalog) thực sự có mặt trong classpath.
     */
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

    /**
     * Thực thi kiểm tra toàn bộ các ràng buộc ranh giới module và tầng kiến trúc (BOUNDARIES).
     */
    @Test
    void boundaries() {
        BOUNDARIES.check(MAIN);
    }

    /**
     * Thực thi kiểm tra không có chu trình phụ thuộc giữa các module (CYCLES).
     */
    @Test
    void noCycles() {
        CYCLES.check(MODULE_CLASSES);
    }
}
