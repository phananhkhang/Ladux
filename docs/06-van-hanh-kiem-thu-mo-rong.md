# Vận Hành, Kiểm Thử Và Mở Rộng

Tài liệu này ghi lại cách build/test hiện tại và các việc cần làm nếu muốn đưa Ladux gần production hơn.

## 1. Build Backend

Compile:

```powershell
cd backend
mvn -q -DskipTests compile
```

Package jar:

```powershell
cd backend
mvn -q -DskipTests package
```

Artifact backend:

```text
backend/target/ladux.jar
```

Dockerfile hiện copy đúng file này:

```text
COPY target/ladux.jar /app/ladux.jar
```

## 2. Test Backend

Chạy test:

```powershell
cd backend
mvn -q test
```

Hiện test chính là `@SpringBootTest`, nghĩa là test boot cả Spring application context.

Vì backend profile dev kết nối PostgreSQL thật, test cần:

- PostgreSQL đang chạy.
- Database `ladux`.
- Credential đúng.
- `JWT_SECRET`.
- `GOOGLE_CLIENT_ID`.
- `GOOGLE_CLIENT_SECRET`.

Nếu thiếu DB/credential, test sẽ fail ở bước khởi tạo datasource/Flyway.

## 3. Gợi Ý Nâng Cấp Test

Để CI chạy ổn định, nên thêm một trong hai hướng:

### Hướng tốt nhất: Testcontainers PostgreSQL

Ưu điểm:

- Test dùng PostgreSQL thật.
- Không phụ thuộc DB local.
- Flyway chạy trên container test.
- CI dễ tái lập.

Cần thêm:

- Dependency `testcontainers`
- Dependency `postgresql` module của Testcontainers
- `@Testcontainers`
- `@DynamicPropertySource`

### Hướng nhẹ hơn: Profile test riêng

Tạo:

```text
application-test.properties
```

Rồi cấu hình datasource riêng. Nếu dùng H2 thì phải cẩn trọng vì H2 không giống PostgreSQL hoàn toàn, đặc biệt JSONB, SQL dialect, lock behavior.

## 4. Build Frontend

Cài dependency:

```powershell
cd frontend
npm install
```

Dev:

```powershell
npm run dev
```

Typecheck:

```powershell
npm run typecheck
```

Build:

```powershell
npm run build
```

Preview build:

```powershell
npm run preview
```

## 5. Chạy Docker Compose

Backend compose nằm trong:

```text
backend/docker-compose.yml
```

Vì compose build app từ Dockerfile và Dockerfile copy jar, chạy:

```powershell
cd backend
mvn -q -DskipTests package
$env:DB_PASSWORD="your_db_password"
$env:JWT_SECRET="base64_secret"
$env:GOOGLE_CLIENT_ID="your_google_client_id"
$env:GOOGLE_CLIENT_SECRET="your_google_client_secret"
docker compose up --build
```

Tắt:

```powershell
docker compose down
```

Tắt và xóa volume database:

```powershell
docker compose down -v
```

Cẩn thận: `down -v` xóa dữ liệu PostgreSQL trong volume.

## 6. Production Checklist

Trước khi chạy production thật, cần kiểm tra:

### Security

- `JWT_SECRET` đủ mạnh, dạng Base64 và không commit vào repo.
- `AUTH_COOKIE_SECURE=true` khi dùng HTTPS.
- `SameSite` phù hợp domain frontend/backend.
- CORS chỉ allow domain thật.
- CSRF hoạt động với frontend production.
- OAuth2 redirect URI đúng trên Google Console.
- Endpoint webhook payment được public đúng cách nhưng vẫn verify chữ ký.
- Không còn demo admin fallback ở production.

### Database

- Backup tự động.
- Migration được review trước khi deploy.
- Không dùng `ddl-auto=update`.
- Connection pool được cấu hình theo tài nguyên DB.
- Index đủ cho query thực tế.
- Slow query log/monitoring.

### Application

- Health check/readiness/liveness.
- Log có request id/correlation id.
- Metrics latency/error rate/throughput.
- Alert khi DB connection pool cạn.
- Alert khi error rate tăng.
- Graceful shutdown.

### Frontend

- `VITE_API_BASE_URL` trỏ đúng backend production.
- Build static được deploy qua CDN hoặc web server.
- Cache policy cho asset.
- Không hardcode credential.

## 7. Điểm Cần Bổ Sung Để Chịu Tải Lớn

Hiện hệ thống là monolith đồng bộ với PostgreSQL. Để phục vụ traffic lớn hơn, nên bổ sung:

### Cache

Ứng viên cache:

- Product list/detail.
- Brand list.
- Category list.
- User roles hoặc user auth snapshot ngắn hạn.
- Homepage data.

Công nghệ phù hợp:

- Redis nếu chạy nhiều instance.
- Caffeine nếu chỉ một instance hoặc cache local tạm.

### Rate Limit

Cần rate limit cho:

- Login/register.
- Coupon apply/redeem.
- Add cart/update cart.
- Create order.
- Payment retry.
- Public search.

Mục tiêu:

- Chống brute force.
- Chống spam order/cart.
- Bảo vệ DB.

### Queue/Event

Các tác vụ nên đưa ra async:

- Gửi email xác nhận đơn.
- Gửi notification.
- Đồng bộ vận chuyển.
- Payment reconciliation.
- Xuất báo cáo.
- Audit log nặng.

Công nghệ có thể dùng:

- RabbitMQ.
- Kafka.
- Redis Streams.
- Cloud queue tùy hạ tầng.

### Search

Search hiện dùng `LIKE '%keyword%'`. Khi catalog lớn nên chuyển sang:

- PostgreSQL full-text search.
- PostgreSQL trigram index.
- OpenSearch/Elasticsearch nếu cần search nâng cao.

### Distributed Lock

Scheduled job hủy order pending hiện chạy trong app. Nếu scale nhiều instance, cần:

- ShedLock với PostgreSQL/Redis.
- Hoặc tách worker scheduler riêng.
- Hoặc dùng queue delayed job.

### Observability

Nên thêm:

- Spring Boot Actuator.
- Micrometer.
- Prometheus/Grafana.
- Structured JSON logs.
- Trace id/correlation id.
- Error tracking.

## 8. Payment Production Checklist

Payment là vùng rủi ro cao nhất.

Cần đảm bảo:

- Webhook public nhưng chỉ tin nếu chữ ký hợp lệ.
- Verify amount từ gateway khớp `order.finalAmount`.
- Verify transaction reference khớp order/payment.
- Lưu `transactionNo`.
- Có unique constraint cho `transaction_no` theo provider nếu gateway đảm bảo unique.
- Webhook idempotent: gọi lại nhiều lần không làm sai stock/coupon/order.
- Khi payment failed/cancelled phải đi qua `OrderLifecycleService.cancelOrder`.
- Khi payment success phải đi qua `OrderLifecycleService.confirmAfterSuccessfulPayment`.
- Không set order status trực tiếp rải rác nhiều nơi.
- Có reconciliation job đối soát payment pending lâu.

## 9. Inventory Production Checklist

Hiện stock nằm trực tiếp trong `products.stock_quantity` và được lock khi checkout.

Ổn cho MVP, nhưng khi có flash sale nên cân nhắc:

- Inventory ledger.
- Reservation table.
- TTL reservation.
- Idempotency key cho order creation.
- Queue-based stock reservation.
- Optimistic lock hoặc atomic update:

```sql
UPDATE products
SET stock_quantity = stock_quantity - :qty
WHERE id = :id
  AND stock_quantity >= :qty
```

Cách atomic update có thể giảm thời gian giữ lock so với load entity rồi set field.

## 10. API Pagination Checklist

Các endpoint dữ liệu tăng theo thời gian không nên trả toàn bộ `List`.

Cần chuyển sang `Page`:

- `GET /api/v1/order-items`
- `GET /api/v1/order-histories`
- `GET /api/v1/user-addresses` cho admin.
- `GET /api/v1/coupons` nếu coupon nhiều.
- Các endpoint list khác nếu dữ liệu có khả năng tăng lớn.

## 11. Module Có Thể Tách Khi Lớn

Không cần tách microservice sớm. Nhưng nếu traffic và team lớn, có thể tách theo thứ tự:

1. Catalog/Search.
2. Order/Payment.
3. Inventory.
4. Notification.
5. Reporting/Analytics.

Trước khi tách service, nên làm tốt:

- Modular monolith.
- Event boundaries.
- Transaction boundaries.
- Observability.
- Contract tests.

## 12. Gợi Ý Roadmap Kỹ Thuật

### Giai đoạn 1: Làm chắc MVP

- Sửa payment webhook.
- Thêm test service quan trọng.
- Chuyển API list lớn sang pagination.
- Thêm README/docs đầy đủ.
- Thêm profile test.

### Giai đoạn 2: Sẵn sàng staging

- Docker Compose hoàn chỉnh frontend/backend/db.
- Actuator health.
- Logging tốt hơn.
- Seed data sạch.
- CI build/test.

### Giai đoạn 3: Sẵn sàng production nhỏ

- HTTPS.
- Secure cookie.
- Backup DB.
- Metrics/alerting.
- Rate limit auth/order.
- Cache catalog.

### Giai đoạn 4: Scale cao hơn

- Redis.
- Queue/event.
- Distributed lock scheduler.
- Search optimization.
- Read replica nếu read traffic cao.
- Payment reconciliation.
