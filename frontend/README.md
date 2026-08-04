# Ladux Frontend

Ứng dụng React + Tailwind CSS gồm storefront tại `/` và Ladux Admin Portal độc lập tại `/admin`.

## Cấu hình

Sao chép `.env.example` thành `.env` và cấu hình:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_UNSAFE_ORDER_RETURN_TRANSITIONS=false
```

`VITE_API_BASE_URL` có thể là origin backend hoặc URL đã có `/api/v1`. Admin Portal dùng HttpOnly Cookie và không lưu access/refresh token trong browser storage.

## Chạy dự án

```bash
npm install
npm run dev
```

Kiểm tra production build:

```bash
npm run typecheck
npm run test
npm run build
```

Các API backend còn thiếu được ghi tại `../docs/backend-integration-gaps.md`.
