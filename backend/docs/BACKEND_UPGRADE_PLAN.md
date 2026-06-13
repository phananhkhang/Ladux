# AuraTech Backend — Kế hoạch nâng cấp lên Production

> Tài liệu sống (living doc). Cập nhật trạng thái khi hoàn thành từng mục.
> Mục tiêu: đưa backend từ "MVP chạy được" lên "sản phẩm cấp production".

Cập nhật lần cuối: 2026-06-13

---

## 0. Bối cảnh & nguyên tắc

**Hiện trạng:** Spring Boot 4 / Java 21, PostgreSQL + Redis, Flyway, JWT cookie + OAuth2 Google, kiến trúc phân lớp (Controller → Service → Repository), đóng gói Docker. Nghiệp vụ e-commerce: catalog, cart, order, payment (VNPay webhook), coupon, review, wishlist.

**Điểm mạnh sẵn có (giữ và phát huy):**
- Trừ kho atomic chống overselling (`deductStockAtomically`).
- Order state machine + `OrderLifecycleService` (propagation MANDATORY) tách side-effect.
- Webhook VNPay: verify HMAC trước, idempotency theo `transaction_no`, đối soát số tiền.
- ShedLock cho scheduled job (an toàn khi chạy nhiều instance).
- Flyway versioned migration; tiền tệ dùng `NUMERIC`/`BigDecimal`.

**Nguyên tắc khi nâng cấp:**
1. Mỗi thay đổi phải compile + test xanh trước khi sang bước kế.
2. Không phá vỡ API contract khi chưa cần; nếu phá, làm trước khi xây frontend.
3. Ưu tiên: an toàn dữ liệu > bảo mật > khả năng vận hành > hiệu năng > tiện nghi.
4. Modular monolith trước; chỉ tách service khi thực sự cần.

---

## 1. Bảng lỗi & việc cần fix (Backlog)

Mức độ: 🔴 chặn production · 🟠 cần trước khi mở tải · 🟡 nên cải thiện
Trạng thái: ✅ done · 🔧 đang làm · ⬜ chưa làm

| # | Mức | Hạng mục | Mô tả ngắn | Trạng thái |
|---|-----|----------|-----------|-----------|
| 1 | 🟡 | Trigram search | Query lọc `LOWER(name)` không dùng được index trên `name`; đã thêm migration V19 tạo functional index `lower(name) gin_trgm_ops` | ✅ |
| 2 | 🟡 | Cache dev tắt | `spring.cache.type=none` ở dev khiến `@Cacheable` thành no-op → đã đổi sang `redis` | ✅ |
| 3 | 🟡 | CORS trùng | Bỏ `addCorsMappings` thừa trong `WebConfig`, để `SecurityConfig` là nguồn duy nhất | ✅ |
| 4 | 🟡 | API deprecated | Thay `HmacUtils.hmacSha512Hex` (deprecated) bằng API instance | ✅ |
| 5 | 🟡 | `@Repository` thừa | Gỡ khỏi interface JPA | ✅ |
| 6 | 🔴 | `@CreatedDate` không chạy | Thiếu `@EntityListeners(AuditingEntityListener.class)` → `created_at` null khi insert (Order/Payment/Coupon/Product/OrderHistory). Đã thêm listener | ✅ |
| 7 | 🟠 | Order lấy item từ cart | `createOrder` giờ đọc cart (có khóa) + dọn cart sau khi đặt; bỏ `items` khỏi `OrderRequest` | ✅ |
| 8 | 🟠 | Tạo payment bị chặn nhầm | `createPayment` idempotent: trả payment PENDING sẵn có thay vì lỗi "lần trước phải FAILED" | ✅ |
| 9 | 🟡 | Coupon apply | Bỏ `subTotal` khỏi request, bỏ `@Cacheable` phản tác dụng, gom validate/tính giảm giá vào domain method trên entity `Coupon` | ✅ |
| 10 | 🔴 | Bug xóa category | Điều kiện `if (!existsByParentId)` bị đảo → không xóa được lá, lại cho xóa node có con. Đã sửa | ✅ |
| 11 | 🔴 | Health/Actuator | Chưa có Actuator/health probe; Docker `app` không có healthcheck. Đã thêm code (cần rebuild image để verify) | 🔧 |
| 12 | 🔴 | 401 vs 302 (REST) | API chưa đăng nhập bị **redirect 302 sang Google OAuth** thay vì trả **401 JSON**. Cần `AuthenticationEntryPoint` chuẩn cho REST | ⬜ |
| 13 | 🔴 | Hard-delete user | `deleteUserById` xóa cứng → FK violation khi user có order, mất lịch sử. Chuyển sang **soft delete** | ⬜ |
| 14 | 🔴 | Thu hồi JWT | Không revoke được token (logout chỉ xóa cookie). Cần refresh token + blacklist (jti trên Redis), access token ngắn hạn | ⬜ |
| 15 | 🔴 | Rate limiting login | Không chống brute-force. Thêm rate limit + account lockout | ⬜ |
| 16 | 🔴 | Secret trong repo | JWT/VNPay/Google fallback nằm trong `docker-compose.yml`/`application-dev.properties`/`.env` cũ. Dùng secret manager + rotate | ⬜ |
| 17 | 🔴 | Flyway nguy hiểm | `clean-on-validation-error=true` ở dev = bom xóa DB. Khóa cứng, tuyệt đối không cho prod | ⬜ |
| 18 | 🔴 | Không có test | `src/test` rỗng. Cần unit + integration (Testcontainers) cho order/payment/coupon/inventory + concurrency | ⬜ |
| 19 | 🟠 | Cache strategy thô | `@CacheEvict(allEntries=true)` ở mọi write → hit-rate ~0. Evict theo key + JSON serializer + TTL per-cache | ⬜ |
| 20 | 🟠 | Index & pool | Partial index cho query expiry; index FK nóng; tune HikariCP | ⬜ |
| 21 | 🟠 | Observability | Micrometer/Prometheus + Grafana, logback JSON + correlation id, OpenTelemetry tracing | ⬜ |
| 22 | 🟠 | Outbox + events | Tách side-effect (email/SMS) ra async qua Transactional Outbox | ⬜ |
| 23 | 🟡 | Upload an toàn | Verify magic bytes thay vì Content-Type header; dọn warning/import thừa; chuẩn hóa timestamp `Instant` | ⬜ |

---

## 2. Lộ trình triển khai (theo giai đoạn)

### Giai đoạn P0 — Bắt buộc trước khi go-live

Mục tiêu: an toàn dữ liệu, bảo mật cơ bản, vận hành quan sát được, có lưới an toàn (test).

- [ ] **#11 Actuator + health probes + Docker healthcheck**
  - Thêm `spring-boot-starter-actuator` (đã thêm), expose `health,info,metrics,prometheus`.
  - Bật `management.endpoint.health.probes.enabled=true` → `/actuator/health/liveness` & `/readiness`.
  - `permitAll` cho `/actuator/health/**`, còn lại `hasRole('ADMIN')`.
  - Docker compose: healthcheck `wget --spider .../health/liveness`.
  - **Verify:** rebuild image (`docker compose up -d --build app`) rồi `curl /actuator/health` ⇒ 200.

- [ ] **#12 Trả 401 JSON cho REST khi chưa auth**
  - Thêm `AuthenticationEntryPoint` trả `ErrorResponse` JSON 401 cho request API.
  - Giữ redirect OAuth2 chỉ cho luồng login trình duyệt (`/oauth2/**`), không cho `/api/**`.

- [ ] **#13 Soft-delete user/product**
  - Không xóa cứng; set `is_active=false`. Lọc bản ghi inactive ở truy vấn công khai.
  - Migration nếu cần cột `deleted_at`. Cập nhật login/checkout để chặn user inactive.

- [ ] **#14 Refresh token + thu hồi (LÀM TRƯỚC KHI XÂY UI AUTH)**
  - Access token ngắn (5–15 phút) + refresh token (HttpOnly cookie, xoay vòng).
  - Lưu `jti` hợp lệ / blacklist trên Redis; logout & đổi mật khẩu ⇒ thu hồi.
  - Endpoint `POST /auth/refresh`, `POST /auth/logout` (revoke).

- [ ] **#15 Rate limiting + lockout**
  - Bucket4j (in-memory hoặc Redis) cho `/auth/login`, `/auth/register`.
  - Khóa tạm tài khoản sau N lần sai; trả 429 khi vượt ngưỡng.

- [ ] **#16 Secret management**
  - Bỏ mọi giá trị thật khỏi repo; dùng biến môi trường + secret manager (Vault/AWS SM/Doppler).
  - Rotate Google client secret + VNPay key đã từng commit.

- [ ] **#17 Khóa cứng Flyway nguy hiểm**
  - Xóa `clean-on-validation-error`, `repair-on-migrate` khỏi cấu hình dùng chung.
  - Đảm bảo prod: `clean-disabled=true`, `validate-on-migrate=true`.

- [ ] **#18 Test suite (lưới an toàn)**
  - Unit: state machine order, pricing, coupon (nhánh hủy/hoàn kho/hoàn coupon).
  - Integration (Testcontainers Postgres+Redis): checkout end-to-end, webhook VNPay (ký HMAC), idempotency.
  - Concurrency: nhiều luồng mua cùng sản phẩm (không oversell), redeem coupon (không double-spend).

### Giai đoạn P1 — Trước khi mở tải thật

- [ ] **#21 Observability đầy đủ**
  - `micrometer-registry-prometheus` → `/actuator/prometheus`; dashboard Grafana.
  - Logback JSON + MDC `requestId` (filter sinh/đọc `X-Request-Id`).
  - OpenTelemetry (trace) nếu có collector.

- [ ] **#19 Cache strategy**
  - Bỏ `allEntries=true` blanket → evict theo key cụ thể.
  - `GenericJackson2JsonRedisSerializer`; cấu hình TTL per-cache; cân nhắc cache-aside có chủ đích.

- [ ] **#20 DB performance**
  - Partial index: `CREATE INDEX ... ON orders (payment_expires_at) WHERE status='PENDING'`.
  - Index các FK nóng còn thiếu; phân tích `EXPLAIN ANALYZE` cho query chậm.
  - Tune HikariCP: `maximum-pool-size`, `connection-timeout`, `leak-detection-threshold`.

- [ ] **CI/CD + image hardening**
  - Pipeline: build → test → scan (Trivy, OWASP Dependency-Check) → đẩy image.
  - Dockerfile: layered jar, cache dependency, bỏ devtools khỏi image prod.

- [ ] **Security headers**
  - HSTS, CSP, X-Content-Type-Options, Referrer-Policy qua `http.headers(...)`.

### Giai đoạn P2 — Tăng trưởng & độ tin cậy

- [ ] **#22 Transactional Outbox + Domain events**
  - `ApplicationEventPublisher` nội bộ → bảng outbox → worker đẩy notification (email/SMS) async.
  - Sau này nối Kafka khi cần.
- [ ] **Search nâng cao**: chuyển sang OpenSearch/Elasticsearch khi catalog lớn.
- [ ] **Idempotency key** cho `createOrder` (chống double-submit từ client).
- [ ] **OpenAPI làm contract**: sinh client cho frontend; version hóa API.
- [ ] **Read replica / CQRS** cho báo cáo khi tải đọc lớn.
- [ ] **Tách module rõ ràng**: catalog / ordering / payment / identity (vẫn 1 deployable).

---

## 3. Kiến thức cần học (theo chủ đề, ánh xạ vào backlog)

### 3.1 Bảo mật ứng dụng
- **JWT đúng cách**: access vs refresh token, rotation, revocation, `jti`, vì sao không nên để token sống dài.
- **OAuth2 / OIDC**: authorization code flow, sự khác nhau giữa login trình duyệt (redirect) và API (bearer/401).
- **Spring Security 6+**: `SecurityFilterChain`, `AuthenticationEntryPoint`, `AccessDeniedHandler`, method security (`@PreAuthorize`).
- **OWASP Top 10**: đặc biệt Broken Access Control (IDOR), Auth failures, Injection, SSRF.
- **CSRF vs CORS**: khi nào cần CSRF (cookie-based), khi nào không (bearer); cấu hình CORS an toàn.
- **Quản lý secret**: 12-factor config, secret manager, rotation.

### 3.2 Cơ sở dữ liệu & dữ liệu
- **Indexing PostgreSQL**: B-tree, GIN, partial index, functional index; đọc `EXPLAIN ANALYZE`.
- **Transaction & isolation**: READ COMMITTED vs REPEATABLE READ, lost update, pessimistic vs optimistic locking (`@Lock`, `@Version`).
- **JPA/Hibernate sâu**: N+1, fetch type, `@EntityGraph`, dirty checking, propagation (`MANDATORY/REQUIRES_NEW`), flush timing, auditing.
- **Migration kỷ luật**: Flyway versioning, migration bất biến, forward-only, không bao giờ `clean` ở prod.
- **Soft delete & audit**: chiến lược lưu vết, không mất dữ liệu giao dịch.
- **Connection pool**: HikariCP, mối quan hệ pool size ↔ giới hạn kết nối DB.

### 3.3 Kiến trúc & độ tin cậy
- **Idempotency**: vì sao webhook/thanh toán phải idempotent; idempotency key.
- **Outbox pattern & domain events**: nhất quán dữ liệu khi phát side-effect ra ngoài.
- **State machine**: mô hình hóa vòng đời (order/payment) bằng máy trạng thái + transition hợp lệ.
- **Concurrency**: race condition, atomic update, distributed lock (ShedLock/Redis).
- **Caching**: cache-aside, invalidation, TTL, "two hard things in CS".
- **Modular monolith vs microservices**: khi nào tách, chi phí phân tán.

### 3.4 Vận hành (Ops/SRE)
- **Observability 3 trụ**: metrics (Micrometer/Prometheus), logs (structured + correlation id), traces (OpenTelemetry).
- **Health checks**: liveness vs readiness, ý nghĩa với orchestrator.
- **12-Factor App**: config qua env, stateless, logs as streams.
- **Container/Deploy**: Docker multi-stage, image nhỏ & non-root, healthcheck, cơ bản về K8s probes.
- **CI/CD**: pipeline build/test/scan/deploy; quét dependency & image.

### 3.5 Kiểm thử
- **Test pyramid**: unit → integration → e2e.
- **Testcontainers**: chạy Postgres/Redis thật trong test.
- **Property-based / concurrency testing**: chứng minh bất biến (không oversell, không double-spend).
- **MockMvc / WebTestClient**: test tầng controller + security.

---

## 4. Công cụ cần học / bổ sung vào dự án

| Nhóm | Công cụ | Dùng để làm gì |
|------|---------|----------------|
| Bảo mật | Bucket4j | Rate limiting / lockout |
| Bảo mật | HashiCorp Vault / AWS Secrets Manager / Doppler | Quản lý & rotate secret |
| Observability | Micrometer + Prometheus + Grafana | Metrics & dashboard |
| Observability | Loki / ELK (Elastic) | Tập trung log |
| Observability | OpenTelemetry + Tempo/Jaeger | Distributed tracing |
| Test | JUnit 5, Mockito, AssertJ | Unit test |
| Test | Testcontainers | Integration test với DB/Redis thật |
| Test | REST Assured / MockMvc | Test API |
| DB | pgAdmin / DBeaver, `EXPLAIN ANALYZE` | Phân tích query/index |
| DB | Flyway (đã có) | Migration kỷ luật |
| Chất lượng mã | Spotless / Checkstyle | Format & lint, fail build khi vi phạm |
| Bảo mật chuỗi cung ứng | OWASP Dependency-Check, Trivy | Quét lỗ hổng dependency & image |
| API | springdoc-openapi (đã có) | OpenAPI/Swagger làm contract |
| CI/CD | GitHub Actions / GitLab CI | Pipeline tự động |
| Tải | k6 / Gatling | Load test, đo p95/p99 |

---

## 5. Thứ tự thực thi đề xuất (đường đi ngắn nhất)

1. **#11** Actuator/health (verify bằng rebuild) — nền tảng quan sát.
2. **#12** 401 JSON cho REST — sửa hành vi auth sai trước khi xây UI.
3. **#14** Refresh token + revoke — định hình tầng auth của frontend.
4. **#15** Rate limiting + lockout.
5. **#13** Soft-delete user/product.
6. **#17 + #16** Khóa Flyway nguy hiểm + secret management.
7. **#18** Test suite (viết cuốn chiếu cho từng mục đã sửa ở trên).
8. Sang **P1**: observability → cache → index/pool → CI/CD.
9. Sang **P2**: outbox/events → search → idempotency key → tách module.

> Quy tắc: làm xong mỗi mục P0 thì viết test cho nó ngay (đừng dồn cuối).

---

## 6. Định nghĩa "Done" cho production (Definition of Ready to Ship)

- [ ] Mọi mục 🔴 trong backlog = ✅.
- [ ] Test coverage cho luồng tiền (order/payment/coupon/inventory) + CI chạy test tự động.
- [ ] Health probe + metrics + log tập trung + alert cơ bản (5xx rate, latency p99, DB pool).
- [ ] Không secret nào nằm trong repo; secret được rotate.
- [ ] Auth: access ngắn hạn + refresh + revoke; rate limit bật.
- [ ] Runbook sự cố cơ bản (DB down, Redis down, payment gateway lỗi) + backup/restore DB đã thử.
- [ ] Load test đạt mục tiêu p95/p99 ở tải dự kiến.

---

## 7. Ghi chú phát hiện trong quá trình review

- **302 thay vì 401**: do cấu hình `oauth2Login`, request API chưa auth bị redirect sang Google. Với REST cần `AuthenticationEntryPoint` trả 401 JSON (mục #12). Lần test cuối `/actuator/health` trả 302 nhiều khả năng vì container đang chạy **image cũ** (bản rebuild bị ngắt) — cần rebuild sạch để xác nhận.
- **Cascade khi xóa category cha**: entity `Category` cascade children nên xóa cha sẽ xóa cả cây con — cân nhắc có đúng nghiệp vụ mong muốn không, hay nên chặn xóa khi còn con (đã sửa điều kiện ở #10).
- **PUT vs PATCH**: nhiều `update*` yêu cầu đủ field `@NotNull` (semantics PUT) nhưng service xử lý "if != null" (semantics PATCH) → quyết định dứt khoát một kiểu để tránh code chết.
