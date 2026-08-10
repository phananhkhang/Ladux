# Triển khai Production: Caddy + Docker Compose

Tài liệu này triển khai Phase 3 (khóa hạ tầng) và phần reverse proxy của Phase 4.

## Kiến trúc sau triển khai

```text
Internet
   |
   | TCP 80, 443
   v
Caddy container
   |
   | proxy-network (Docker private network)
   v
Spring Boot app:8080
   |
   | data-network (Docker internal network)
   +--> PostgreSQL:5432
   +--> Redis:6379
```

Chỉ Caddy có port host. PostgreSQL, Redis và Spring Boot không có ``ports:`` nên không thể truy cập trực tiếp từ Internet hoặc từ host qua port publish.

## Kế hoạch triển khai

1. Chuẩn bị VPS, DNS, firewall và sao lưu.
2. Tạo file secrets từ mẫu, cấu hình domain/CORS/OAuth/VNPay.
3. Validate Compose, khởi động stack Caddy + application.
4. Kiểm tra HTTPS, các port public và business flow.
5. Theo dõi log; chỉ public cho người dùng sau khi mọi kiểm tra đạt.

## Điều kiện trước khi deploy

1. VPS Linux có Docker Engine và Docker Compose plugin.
2. Không có dịch vụ khác đang dùng port ``80`` hoặc ``443``.
3. Bản ghi DNS ``A`` (và ``AAAA`` nếu dùng IPv6) của API, ví dụ ``api.ladux.vn``, trỏ đến IP public VPS. DNS phải hoàn tất trước khi Caddy xin TLS.
4. Google OAuth và VNPay đã đăng ký các URL HTTPS production tương ứng.
5. Sao lưu database/uploads nếu VPS đã có dữ liệu.

## Chuẩn bị secrets

Tại root repository trên VPS, tạo file secret từ mẫu:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Điền toàn bộ giá trị ``REPLACE_*``; không commit file ``.env.production``.

Các giá trị domain phải nhất quán:

```dotenv
LADUX_API_DOMAIN=api.ladux.vn
CADDY_EMAIL=ops@ladux.vn
APP_CORS_ALLOWED_ORIGINS=https://ladux.vn,https://www.ladux.vn
VNPAY_IPN_URL=https://api.ladux.vn/api/v1/payments/vnpay-webhook
```

## Mở firewall tối thiểu

Ví dụ UFW (giữ SSH trước khi bật firewall):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status numbered
```

Không mở ``5432``, ``6379`` hoặc ``8080``. Đồng thời kiểm tra firewall/security group của nhà cung cấp VPS chỉ cho phép ``22``, ``80``, ``443`` (port ``22`` có thể giới hạn theo IP quản trị).

## Deploy

Chạy từ repository root:

```bash
docker compose --env-file .env.production -f backend/docker-compose.prod.yml config -q
docker compose --env-file .env.production -f backend/docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f backend/docker-compose.prod.yml ps
docker compose --env-file .env.production -f backend/docker-compose.prod.yml logs --tail=100 caddy app
```

Caddy tự chuyển HTTP sang HTTPS, xin/gia hạn chứng chỉ Let's Encrypt, và lưu state chứng chỉ trong Docker volume ``caddy_data``.

## Kiểm chứng bắt buộc

```bash
# HTTPS và health endpoint qua Caddy
curl -I https://api.ladux.vn/actuator/health/liveness

# Chỉ Caddy được publish host port
docker compose --env-file .env.production -f backend/docker-compose.prod.yml ps
docker ps --format 'table {{.Names}}\t{{.Ports}}'

# Các lệnh này phải không kết nối được từ Internet/host:
# nc -vz <VPS_IP> 5432
# nc -vz <VPS_IP> 6379
# nc -vz <VPS_IP> 8080
```

Kết quả mong đợi: ``80/443`` thuộc container Caddy; ``app``, ``postgres``, ``redis`` không có port host. Sau đó kiểm tra OAuth, VNPay webhook/return URL và các luồng frontend thật.

## Vận hành và rollback

Theo dõi log bằng ``docker compose ... logs -f caddy app``. Trước mỗi cập nhật, backup PostgreSQL và ``uploads/``. Nếu image/app mới lỗi sau deploy, quay lại commit/image trước đó rồi chạy lại ``docker compose ... up -d --build``; không xóa named volumes ``postgres-data``, ``redis-data``, ``caddy_data`` khi rollback.
