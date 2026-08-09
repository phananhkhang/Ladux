# KẾ HOẠCH NÂNG CẤP LADUX LÊN PRODUCTION

> Mục tiêu: đưa Ladux từ đồ án / môi trường development lên mức có thể chạy production cho một shop nhỏ hoặc MVP thực tế, có người dùng thật, dữ liệu thật và thanh toán thật.

---

## 1. Mục tiêu Production

Kiến trúc mục tiêu:

```text
Internet
   |
   v
Cloudflare / DNS
   |
   v
Nginx / Caddy (HTTPS :443)
   |
   v
Spring Boot Backend (:8080 internal)
   |
   +-------------------+
   |                   |
   v                   v
PostgreSQL          Redis
(internal)          (internal)
   |
   +--> Backup định kỳ

Frontend
   |
   +--> ladux.vn / CDN / Static Web Server
```

Nguyên tắc:

- Không public PostgreSQL và Redis ra Internet.
- Không chạy production bằng profile `dev`.
- Không có secret mặc định trong source / Docker Compose.
- HTTPS bắt buộc.
- Có backup và restore test.
- Có CI chạy test trước khi deploy.
- Có monitoring, logging và health check.
- API quan trọng phải có rate limit.
- Payment phải idempotent và verify chữ ký.
- Chatbot phải có quota / rate limit để tránh bị spam API.
- Không cần microservice hoặc Kubernetes ở giai đoạn hiện tại.

---

# PHASE 1 — FIX SECURITY BLOCKER

> Trạng thái: BẮT BUỘC trước khi public production.

## 1.1 Tách Dev OTP khỏi Production

### Vấn đề

`DevPhoneOtpProvider` đang được dùng cho môi trường development và có fixed OTP.

Production tuyệt đối không được phép khởi tạo provider có fixed OTP như `123456`.

### Cần làm

Dev:

```java
@Service
@Profile("dev")
@Primary
public class DevPhoneOtpProvider implements PhoneOtpProvider {
}
```

Production:

```java
@Service
@Profile("prod")
public class TwilioPhoneOtpProvider implements PhoneOtpProvider {
}
```

Hoặc dùng:

```java
@ConditionalOnProperty(...)
```

### Done khi

- [ ] `DevPhoneOtpProvider` chỉ tồn tại ở profile dev.
- [ ] Production startup không thể inject Dev OTP provider.
- [ ] Production thiếu Twilio credential thì fail startup.
- [ ] Không còn fixed OTP trong production.
- [ ] Có test kiểm tra đúng provider theo profile.

---

## 1.2 Sửa CSRF

### Vấn đề

Không được bỏ qua CSRF cho toàn bộ:

```text
/api/v1/**
```

khi authentication storefront sử dụng cookie.

### Thiết kế mong muốn

```text
Cookie Auth API
      |
      v
CSRF protection

Bearer Token API
      |
      v
Có thể exempt CSRF

VNPay Webhook
      |
      v
Exempt CSRF
+ Verify HMAC Signature
```

### Cần làm

- Bật CSRF cho API sử dụng cookie authentication.
- Chỉ exempt endpoint thực sự cần thiết.
- Frontend đọc `XSRF-TOKEN`.
- Frontend gửi lại:

```text
X-XSRF-TOKEN: <token>
```

### Done khi

- [ ] POST/PUT/PATCH/DELETE bằng cookie thiếu CSRF token bị reject.
- [ ] Request có CSRF token đúng hoạt động bình thường.
- [ ] VNPay webhook vẫn hoạt động.
- [ ] Bearer token flow không bị phá.
- [ ] Có integration test cho CSRF.

---

## 1.3 Tách CORS Dev / Prod

### Development

Có thể cho phép:

```text
http://localhost:*
http://127.0.0.1:*
```

### Production

Chỉ allow domain thật:

```text
https://ladux.vn
https://admin.ladux.vn
```

### Khuyến nghị

Không hardcode trực tiếp trong `SecurityConfig`.

Dùng environment variable:

```properties
APP_CORS_ALLOWED_ORIGINS=https://ladux.vn,https://admin.ladux.vn
```

### Done khi

- [ ] Production không allow localhost.
- [ ] Production không allow HTTP wildcard.
- [ ] Chỉ frontend thật có thể gửi credential cross-origin.
- [ ] CORS được cấu hình từ environment.

---

## 1.4 Rate Limit các endpoint nhạy cảm

Các endpoint nên được bảo vệ:

| Endpoint / nhóm API | Gợi ý ban đầu |
|---|---:|
| Login | 5 request/phút/IP |
| Register | 3–5 request/phút/IP |
| Send OTP | 3 request/phút/IP + phone/email |
| Verify OTP | giới hạn failed attempts |
| Chatbot | 10–20 request/phút/session hoặc IP |
| Create Order | 5–10 request/phút/user |
| Payment retry | giới hạn thấp |
| Coupon | giới hạn theo user |
| Search | 30–60 request/phút/IP |

Các con số này là baseline, có thể chỉnh sau khi quan sát traffic thực tế.

### Done khi

- [ ] Login có rate limit.
- [ ] OTP có rate limit.
- [ ] Chatbot có rate limit.
- [ ] Order/payment có rate limit.
- [ ] Trả HTTP `429 Too Many Requests`.
- [ ] Có `Retry-After` nếu phù hợp.
- [ ] Rate limit hoạt động khi chạy nhiều instance.

---

# PHASE 2 — TẠO MÔI TRƯỜNG PRODUCTION THỰC SỰ

## 2.1 Tạo Docker Compose Production

Nên có:

```text
docker-compose.yml
docker-compose.prod.yml
```

Production phải bắt buộc:

```yaml
environment:
  SPRING_PROFILES_ACTIVE: prod
  JWT_SECRET: ${JWT_SECRET:?JWT_SECRET required}
  DB_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD required}
  DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY:?DEEPSEEK_API_KEY required}
```

Không dùng:

```yaml
SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-dev}
```

Không dùng:

```yaml
JWT_SECRET=${JWT_SECRET:-default-secret}
```

### Done khi

- [ ] Production luôn chạy profile `prod`.
- [ ] Thiếu secret thì app fail startup.
- [ ] Không có production secret hardcode.
- [ ] `.env` nằm trong `.gitignore`.
- [ ] Production env được quản lý riêng.

---

## 2.2 Secret Management

Các secret cần quản lý:

```text
JWT_SECRET
DB_PASSWORD
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
VNPAY_TMN_CODE
VNPAY_HASH_SECRET
DEEPSEEK_API_KEY
GOOGLE_GENAI_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
```

Giai đoạn VPS nhỏ có thể dùng:

```text
.env.production
```

với permission chặt.

Sau này có thể chuyển sang:

```text
GitHub Actions Secrets
Docker Secrets
Vault
Cloud Secret Manager
```

### Done khi

- [ ] Không secret nào commit lên Git.
- [ ] Rotate secret nếu từng bị public.
- [ ] Production secret khác development secret.

---

# PHASE 3 — KHÓA INFRASTRUCTURE

## 3.1 Không public PostgreSQL

Không production kiểu:

```yaml
ports:
  - "5432:5432"
```

Nếu database chỉ dùng trong Docker network thì bỏ `ports`.

Backend gọi:

```text
postgres:5432
```

---

## 3.2 Không public Redis

Redis chỉ nên được backend truy cập qua internal Docker network.

Backend gọi:

```text
redis:6379
```

Không expose:

```text
6379
```

ra Internet.

---

## 3.3 Chỉ public Reverse Proxy

Port Internet nên là:

```text
80
443
```

Luồng:

```text
Internet
   |
   v
Caddy / Nginx
   |
   v
Backend :8080
```

### Done khi

- [ ] Port 5432 không public.
- [ ] Port 6379 không public.
- [ ] Port 8080 không public trực tiếp nếu không cần.
- [ ] Firewall chỉ mở port cần thiết.
- [ ] Backend, Redis và PostgreSQL cùng private network.

---

# PHASE 4 — DOMAIN + HTTPS + REVERSE PROXY

## 4.1 Domain

Ví dụ:

```text
https://ladux.vn
https://api.ladux.vn
```

Có thể dùng:

```text
Cloudflare DNS
```

---

## 4.2 HTTPS

Dùng một trong:

```text
Caddy
Nginx + Certbot
Cloudflare Origin Certificate
```

Khuyến nghị cho VPS nhỏ: Caddy vì cấu hình HTTPS đơn giản.

---

## 4.3 Secure Cookie

Production:

```properties
AUTH_COOKIE_SECURE=true
```

Cookie nên có:

```text
HttpOnly
Secure
SameSite phù hợp
```

---

## 4.4 OAuth Production URL

Google OAuth redirect:

```text
https://api.ladux.vn/login/oauth2/code/google
```

Cần đăng ký URL chính xác trên Google Console.

---

## 4.5 VNPay Production URLs

Ví dụ:

```text
https://api.ladux.vn/api/v1/payments/vnpay-webhook
```

Return URL cũng phải trỏ domain thật.

### Done khi

- [ ] `ladux.vn` có HTTPS.
- [ ] HTTP tự redirect HTTPS.
- [ ] Cookie có Secure.
- [ ] Google OAuth production hoạt động.
- [ ] VNPay callback/return URL dùng HTTPS.

---

# PHASE 5 — DATABASE PRODUCTION

## 5.1 Giữ Flyway làm source of truth

Production:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Không dùng:

```text
update
create
create-drop
```

cho production.

---

## 5.2 Backup PostgreSQL tự động

Luồng:

```text
PostgreSQL
    |
    v
pg_dump
    |
    v
compressed backup
    |
    v
S3 / Cloudflare R2 / Backup VPS
```

Ví dụ lịch:

```text
Daily backup: 02:00
Retention: 7 daily + 4 weekly + 3 monthly
```

Tùy quy mô có thể đơn giản hơn.

---

## 5.3 Test Restore

Backup không có ý nghĩa nếu chưa thử restore.

Định kỳ:

```text
Create empty DB
     |
     v
Restore backup
     |
     v
Run Flyway / start application
     |
     v
Check users, products, orders, payments
```

### Done khi

- [ ] Backup chạy tự động.
- [ ] Backup nằm ngoài VPS chính.
- [ ] Có retention policy.
- [ ] Restore test thành công.
- [ ] Có tài liệu cách restore.

---

## 5.4 Database Pool

Cấu hình HikariCP theo tài nguyên.

Theo dõi:

```text
active connections
idle connections
pending requests
connection timeout
```

Không tăng pool vô hạn.

---

## 5.5 Slow Query / Index

Theo dõi query thực tế.

Các bảng nên đặc biệt chú ý:

```text
products
orders
order_items
payments
inventory
users
refresh_tokens
coupons
stock_movements
```

Chỉ thêm index khi có query cần nó.

---

# PHASE 6 — CI PIPELINE

## 6.1 GitHub Actions

Pipeline:

```text
git push / pull request
        |
        +--> Backend
        |      |
        |      +--> mvn test
        |      +--> mvn package
        |
        +--> Frontend
               |
               +--> npm run typecheck
               +--> npm test
               +--> npm run build

                |
                v
           ALL PASSED
                |
                v
           Docker Build
                |
                v
              Deploy
```

Nguyên tắc:

```text
Test fail = không deploy
Build fail = không deploy
```

### Done khi

- [ ] Pull request tự chạy CI.
- [ ] Backend test bắt buộc pass.
- [ ] Frontend typecheck/test/build pass.
- [ ] Docker image build được.
- [ ] Production deploy chỉ chạy sau khi CI pass.

---

# PHASE 7 — NÂNG TEST

Tập trung test nghiệp vụ quan trọng.

## 7.1 Checkout Concurrency

Case:

```text
stock = 1

User A ---> checkout
User B ---> checkout

Expected:
A = SUCCESS
B = OUT_OF_STOCK

stock không được âm
```

---

## 7.2 Coupon Concurrency

```text
coupon quantity = 1

User A redeem
User B redeem

=> chỉ một user thành công
```

---

## 7.3 Payment Idempotency

```text
VNPay webhook #1
VNPay webhook #2

=> Order PAID đúng một lần
=> Không double update
=> Không double side-effect
```

---

## 7.4 Auth Tests

Test:

```text
login
refresh token rotation
logout
tokenVersion
account disabled
wrong refresh token
CSRF
OAuth failure
```

---

## 7.5 OTP Tests

Test:

```text
wrong OTP
expired OTP
5 failed attempts
replay OTP
multiple concurrent verify
dev/prod provider selection
```

### Done khi

- [ ] Có test checkout race.
- [ ] Có test coupon race.
- [ ] Có test webhook idempotency.
- [ ] Có test authentication critical paths.
- [ ] Có test OTP critical paths.

---

# PHASE 8 — OBSERVABILITY

## 8.1 Health Check

Giữ:

```text
/actuator/health/liveness
/actuator/health/readiness
```

Readiness nên phản ánh các dependency quan trọng.

---

## 8.2 Structured Logging

Log nên chứa:

```text
timestamp
level
service
requestId
userId (nếu phù hợp)
method
path
status
duration
errorCode
```

Không log:

```text
password
JWT token
refresh token
OTP
VNPay secret
API key
```

---

## 8.3 Correlation ID

Mỗi request:

```text
X-Request-ID
```

hoặc backend tự tạo UUID.

Tất cả log của cùng request sử dụng cùng ID.

---

## 8.4 Metrics

Tối thiểu:

```text
request/sec
P50/P95/P99 latency
4xx rate
5xx rate
JVM memory
CPU
DB pool usage
Redis health
GC
```

Stack:

```text
Spring Boot Actuator
      |
      v
Micrometer
      |
      v
Prometheus
      |
      v
Grafana
```

---

## 8.5 Alert

Alert khi:

```text
service down
5xx tăng bất thường
database unavailable
DB pool exhausted
disk gần đầy
memory quá cao
backup fail
```

### Done khi

- [ ] Có dashboard.
- [ ] Có request/correlation ID.
- [ ] Có log tập trung hoặc ít nhất log file có rotation.
- [ ] Có alert cơ bản.
- [ ] Không log dữ liệu nhạy cảm.

---

# PHASE 9 — CHATBOT / AI PRODUCTION HARDENING

## 9.1 Rate Limit Chatbot

Chatbot public phải được giới hạn.

Ví dụ:

```text
10–20 request/phút/session/IP
```

Tùy traffic thật để tune.

---

## 9.2 Input Validation

Request DTO:

```java
public record ChatRequest(
    @NotBlank
    @Size(max = 1000)
    String query
) {}
```

Không cho request cực lớn.

---

## 9.3 Timeout

AI provider không được giữ request vô hạn.

Cần:

```text
connect timeout
read timeout
overall request timeout
```

---

## 9.4 Concurrent Request Limit

Giới hạn số request AI đồng thời.

Ví dụ:

```text
Semaphore / bulkhead
```

để một đợt spam không chiếm toàn bộ backend threads.

---

## 9.5 Cost Protection

Thiết lập:

```text
API spending limit
daily budget
per-user quota
per-IP quota
max tokens
```

Theo dõi chi phí DeepSeek / embedding provider.

---

## 9.6 AI Failure Fallback

Nếu DeepSeek lỗi:

```text
AI unavailable
      |
      v
Trả message thân thiện
```

Không để exception provider thành HTTP 500 khó hiểu.

---

## 9.7 Conversation Ownership

Không hoàn toàn tin `conversationId` do frontend gửi.

Thiết kế:

```text
User A
  |
  v
conversation abc
  |
  v
Backend verify owner = User A
```

Hoặc server tự tạo conversation ID.

### Done khi

- [ ] Chatbot có rate limit.
- [ ] Query có max length.
- [ ] Có timeout.
- [ ] Có quota/cost protection.
- [ ] Có fallback.
- [ ] Conversation gắn với user/session an toàn.

---

# PHASE 10 — RAG INDEXING

## 10.1 Tránh phụ thuộc `Index All`

Admin `index-all-products` có thể giữ làm công cụ maintenance.

Nhưng production nên tiến tới:

```text
Product Create/Update/Delete
        |
        v
Domain/Event
        |
        v
Embedding Update
        |
        v
Vector Store
```

---

## 10.2 Stable Document ID

Mỗi product nên có ID ổn định:

```text
product:123
```

Khi product 123 update:

```text
replace/update embedding product:123
```

thay vì tạo document mới không kiểm soát.

---

## 10.3 Batch Indexing

Nếu catalog lớn:

```text
100 products/batch
```

thay vì load tất cả cùng lúc.

---

## 10.4 Retry

Embedding fail:

```text
retry
dead-letter/manual retry
```

Không nên làm transaction cập nhật product thất bại chỉ vì AI provider đang down.

### Done khi

- [ ] Product update đồng bộ embedding đúng cách.
- [ ] Có stable vector/document ID.
- [ ] IndexAll có batch.
- [ ] Có retry khi embedding provider lỗi.
- [ ] Không tạo stale/duplicate document ngoài ý muốn.

---

# PHASE 11 — FILE / IMAGE STORAGE

Hiện tại có thể tiếp tục dùng local upload volume cho VPS nhỏ:

```text
/app/uploads
```

Nhưng phải backup.

Backup:

```text
Database
+
uploads/
```

Sau này mới cân nhắc:

```text
AWS S3
Cloudflare R2
MinIO
```

### Done khi

- [ ] Upload folder là persistent volume.
- [ ] Upload được backup.
- [ ] Restore upload đã được test.
- [ ] Không phụ thuộc filesystem tạm của container.

---

# PHASE 12 — PAYMENT PRODUCTION HARDENING

Trước khi nhận tiền thật cần verify:

```text
signature
tmnCode
merchant/order reference
transaction reference
amount
payment status
idempotency
```

---

## 12.1 Test các trường hợp

- [ ] Signature hợp lệ.
- [ ] Signature sai.
- [ ] Amount mismatch.
- [ ] Merchant mismatch.
- [ ] Duplicate webhook.
- [ ] Payment success.
- [ ] Payment failed.
- [ ] Order đã cancel.
- [ ] Webhook đến chậm.
- [ ] User refresh trang callback nhiều lần.

---

## 12.2 Payment Reconciliation

Sau này thêm scheduled job:

```text
Ladux = PENDING
VNPay = SUCCESS
       |
       v
Reconciliation
       |
       +--> sync status
       hoặc
       +--> manual review
```

### Done khi

- [ ] Sandbox test pass.
- [ ] Production credentials được cấu hình an toàn.
- [ ] Webhook idempotent.
- [ ] Có log payment đầy đủ nhưng không lộ secret.
- [ ] Có kế hoạch reconciliation.

---

# PHASE 13 — STAGING

Tạo 3 môi trường:

```text
Development
localhost

Staging
staging.ladux.vn

Production
ladux.vn
```

Staging sử dụng:

```text
test database
VNPay sandbox
AI API có giới hạn credit
production-like Docker config
HTTPS
```

---

## Staging Acceptance Test

Trước go-live phải test:

- [ ] Register.
- [ ] Login.
- [ ] Google OAuth.
- [ ] Email OTP.
- [ ] Phone OTP.
- [ ] Product browsing.
- [ ] Search.
- [ ] Cart.
- [ ] Wishlist.
- [ ] Coupon.
- [ ] Checkout.
- [ ] VNPay.
- [ ] Cancel order.
- [ ] Inventory update.
- [ ] Admin login.
- [ ] Admin product management.
- [ ] Chatbot.
- [ ] RAG indexing.
- [ ] Logout.
- [ ] Refresh token.
- [ ] Token revocation.
- [ ] Backup.
- [ ] Restore.
- [ ] Restart containers.

---

# PHASE 14 — LOAD TEST

Không cần giả lập hàng triệu user.

Baseline:

```text
10 concurrent users
50 concurrent users
100 concurrent users
```

Test API:

```text
GET /products
GET /products/{id}
POST /cart
POST /orders
POST /payments
POST /chatbot
```

Tools:

```text
k6
Gatling
JMeter
```

Theo dõi:

```text
P95 latency
error rate
CPU
RAM
DB connections
Redis latency
JVM heap
```

### Mục tiêu ban đầu

Không cần ép một SLA enterprise.

Mục tiêu là:

- Không crash.
- Không oversell.
- Không deadlock bất thường.
- Không cạn DB pool.
- Không memory leak rõ ràng.
- Error rate thấp.
- P95 hợp lý với VPS hiện tại.

---

# PHASE 15 — SAU NÀY MỚI SCALE

Không cần làm ngay:

```text
Kubernetes
Kafka cluster
Microservices
Service Mesh
Elasticsearch cluster
Read replica
API Gateway phức tạp
```

Chỉ cân nhắc khi traffic thật chứng minh cần.

Thứ tự scale hợp lý:

```text
1. Optimize query/index
2. Cache
3. Vertical scaling
4. Multiple backend instances
5. Queue cho background task
6. Object storage
7. Search engine
8. Read replica
9. Tách service nếu domain/team thực sự cần
```

---

# THỨ TỰ TRIỂN KHAI KHUYẾN NGHỊ

## P0 — Blocker bắt buộc

- [ ] Fix `DevPhoneOtpProvider`.
- [ ] Fix CSRF.
- [ ] Tách CORS dev/prod.
- [ ] Rate limit chatbot/OTP/order/payment.
- [ ] Production profile bắt buộc.
- [ ] Xóa secret fallback.
- [ ] Không expose PostgreSQL.
- [ ] Không expose Redis.

## P1 — Go-live Foundation

- [ ] Domain.
- [ ] HTTPS.
- [ ] Reverse proxy.
- [ ] Secure cookie.
- [ ] OAuth production config.
- [ ] VNPay production config.
- [ ] Backup PostgreSQL.
- [ ] Backup uploads.
- [ ] Restore test.
- [ ] CI pipeline.

## P2 — Reliability

- [ ] Checkout concurrency test.
- [ ] Coupon concurrency test.
- [ ] Payment idempotency test.
- [ ] OTP/security test.
- [ ] Structured logging.
- [ ] Correlation ID.
- [ ] Metrics dashboard.
- [ ] Alerting.

## P3 — AI Production

- [ ] Chatbot rate limit.
- [ ] Input max length.
- [ ] AI timeout.
- [ ] Concurrent AI limit.
- [ ] Cost quota.
- [ ] Conversation ownership.
- [ ] Stable RAG document ID.
- [ ] Incremental indexing.
- [ ] Embedding retry.

## P4 — Validation trước Public

- [ ] Staging.
- [ ] Full business flow test.
- [ ] Load test.
- [ ] Security check.
- [ ] Backup/restore drill.
- [ ] Production deployment checklist.

---

# GO-LIVE CHECKLIST

Không public Ladux cho user thật cho tới khi các mục sau đều đạt.

## Security

- [ ] Không fixed OTP.
- [ ] Production profile.
- [ ] HTTPS.
- [ ] Secure cookies.
- [ ] CSRF hoạt động.
- [ ] CORS chỉ domain thật.
- [ ] Không secret hardcode.
- [ ] Rate limit.
- [ ] DB/Redis private.
- [ ] Swagger production được disable hoặc bảo vệ nếu cần.

## Database

- [ ] Flyway migration.
- [ ] `ddl-auto=validate`.
- [ ] Automated backup.
- [ ] Restore test.
- [ ] Persistent volume.
- [ ] DB pool phù hợp.
- [ ] Index critical queries.

## Payment

- [ ] Verify VNPay signature.
- [ ] Verify amount.
- [ ] Idempotent webhook.
- [ ] Production callback URL.
- [ ] Test duplicate callback.
- [ ] Payment logs.

## Backend

- [ ] Health check.
- [ ] Graceful shutdown.
- [ ] Request validation.
- [ ] Global exception handling.
- [ ] Important concurrency tests.
- [ ] CI test pass.

## AI

- [ ] Rate limit.
- [ ] Timeout.
- [ ] Max prompt size.
- [ ] Quota.
- [ ] Provider failure fallback.
- [ ] RAG indexing ổn định.

## Operations

- [ ] Logging.
- [ ] Metrics.
- [ ] Alert.
- [ ] Disk monitoring.
- [ ] Backup monitoring.
- [ ] Deployment procedure.
- [ ] Rollback procedure.

---

# ĐỊNH NGHĨA “PRODUCTION-READY” CHO LADUX

Ladux không cần đạt enterprise-grade để được gọi là production-ready.

Đối với shop nhỏ / MVP, production-ready nghĩa là:

```text
                  LADUX
                    |
       +------------+------------+
       |            |            |
       v            v            v
    Security    Reliability   Operations
       |            |            |
   OTP safe      Backup         CI/CD
   CSRF          Restore        Logging
   CORS          Transaction    Metrics
   Rate limit    Idempotency    Alert
   Secrets       Health         HTTPS
       |            |            |
       +------------+------------+
                    |
                    v
                STAGING PASS
                    |
                    v
               PRODUCTION
```

---

# MỤC TIÊU ĐÁNH GIÁ

## Hiện tại

```text
Production Readiness: khoảng 6–7/10
```

Kiến trúc backend đã có nền tảng tốt:

- Modular monolith.
- Spring Boot.
- Spring Security.
- JWT + Refresh Token.
- OAuth2.
- PostgreSQL.
- Flyway.
- Redis.
- Rate limit login.
- Atomic inventory.
- Pessimistic locking.
- Order lifecycle.
- VNPay.
- Idempotent payment handling.
- ShedLock.
- Actuator.
- Testcontainers.
- Chatbot + RAG.

Điểm còn thiếu chủ yếu nằm ở hardening và operations, không phải thiếu business feature.

## Sau khi hoàn thành P0 + P1 + P2

Mục tiêu:

```text
Production Readiness: khoảng 8–8.5/10
```

Đủ hợp lý cho:

```text
Shop nhỏ
Graduation project public demo
Portfolio project
MVP thực tế
Beta users
Real users với traffic vừa phải
```

---

# NGUYÊN TẮC CUỐI CÙNG

Từ thời điểm này, ưu tiên không còn là:

> “Thêm feature gì nữa?”

Mà phải chuyển thành:

> “Nếu hệ thống gặp sự cố thì chuyện gì xảy ra?”

Luôn đặt các câu hỏi:

```text
Nếu server restart thì sao?

Nếu database chết thì sao?

Nếu Redis chết thì sao?

Nếu user spam API thì sao?

Nếu AI provider timeout thì sao?

Nếu webhook gửi 2 lần thì sao?

Nếu 2 user cùng mua sản phẩm cuối cùng thì sao?

Nếu secret bị thiếu thì app có vô tình chạy dev không?

Nếu VPS mất hoàn toàn thì có restore được dữ liệu không?

Nếu deploy version lỗi thì rollback thế nào?
```

Khi Ladux có câu trả lời rõ ràng cho các câu hỏi trên, hệ thống đã chuyển từ một đồ án Spring Boot chạy được sang một backend có tư duy production.
