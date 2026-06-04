# Frontend Và API Client

Tài liệu này mô tả cách frontend React hoạt động và cách nó giao tiếp với backend.

## 1. Stack Frontend

| Công nghệ | Vai trò |
| --- | --- |
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Dev server/build tool |
| React Router DOM | Routing |
| Axios | HTTP client |
| Zustand | State management |
| Tailwind CSS | Styling |
| Radix UI | Headless UI primitives |
| Lucide React | Icon |
| Framer Motion | Animation |
| Three.js/R3F/Drei | 3D hero |

## 2. Cấu Trúc Frontend

```text
frontend/src/
├── App.tsx
├── main.tsx
├── api/
│   └── client.ts
├── types/
│   └── api.ts
├── lib/
│   ├── store.ts
│   └── utils.ts
├── pages/
├── components/
├── admin/
└── features/
```

## 3. Routing

Routes nằm trong `frontend/src/App.tsx`.

### Storefront routes

| Route | Page |
| --- | --- |
| `/` | `Home` |
| `/shop` | `Shop` |
| `/product/:slug` | `ProductDetail` |
| `/login` | `Login` |
| `/register` | `Register` |
| `/wishlist` | `Wishlist` |
| `/checkout` | `Checkout` |
| `/orders` | `Orders` |
| `/orders/:id` | `OrderDetail` |
| `/about` | `About` |
| `/contact` | `Contact` |

### Admin routes

| Route | Page |
| --- | --- |
| `/admin/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/products` | Products |
| `/admin/categories` | Categories |
| `/admin/brands` | Brands |
| `/admin/orders` | Orders |
| `/admin/orders/history` | Order history |
| `/admin/analytics/carts` | Cart analytics |
| `/admin/payments` | Payments |
| `/admin/users` | Users |
| `/admin/roles` | Roles |
| `/admin/coupons` | Coupons |
| `/admin/reviews` | Reviews |

## 4. API Client

File chính:

```text
frontend/src/api/client.ts
```

Nhiệm vụ:

- Tạo Axios instance.
- Cấu hình `baseURL`.
- Bật `withCredentials` để gửi cookie.
- Tự lấy CSRF token cho request ghi.
- Chuẩn hóa lỗi API.
- Đóng gói API theo module: Products, Auth, Cart, Orders...

## 5. Base URL

Frontend lấy backend URL từ:

```text
VITE_API_BASE_URL
```

Nếu không có, mặc định:

```text
http://localhost:8080
```

Sau đó frontend tự thêm:

```text
/api/v1
```

Ví dụ:

```text
VITE_API_BASE_URL=http://localhost:8080
apiBaseURL=http://localhost:8080/api/v1
```

## 6. Cookie Auth

Backend set JWT vào cookie:

```text
AUTH_TOKEN
```

Frontend không đọc cookie này vì cookie là HttpOnly. Frontend chỉ cần:

```ts
withCredentials: true
```

Khi gọi API cùng origin/cors hợp lệ, browser tự gửi cookie.

## 7. CSRF Flow

Axios interceptor kiểm tra method:

```text
POST
PUT
PATCH
DELETE
```

Nếu là unsafe method:

```text
1. Kiểm tra document.cookie có XSRF-TOKEN chưa.
2. Nếu chưa có, gọi GET /api/v1/auth/csrf.
3. Đọc XSRF-TOKEN.
4. Gắn header X-XSRF-TOKEN.
5. Gửi request thật.
```

Điều này khớp backend dùng:

```text
CookieCsrfTokenRepository.withHttpOnlyFalse()
```

## 8. Public Store State

File:

```text
frontend/src/lib/store.ts
```

Các store:

| Store | Vai trò |
| --- | --- |
| `useAuthStore` | login/register/logout/hydrate user |
| `useCartStore` | cart items, total, refresh/add/update/remove/clear |
| `useWishlistStore` | wishlist, toggle, refresh |
| `useUIStore` | cart drawer/mobile nav state |

## 9. Auth Store Flow

```text
App mount
  -> useAuthStore.hydrate()
  -> Auth.me()
  -> nếu thành công:
       set user
       token = "cookie"
       refresh cart
       refresh wishlist
  -> nếu fail:
       clear user state
```

Login:

```text
login(emailOrUsername, password)
  -> Auth.login({ username, password })
  -> backend set cookie
  -> Auth.me()
  -> save user snapshot
  -> refresh cart/wishlist
```

Logout:

```text
Auth.logout()
  -> backend clear cookie
  -> local state reset
  -> cart/wishlist reset
```

## 10. Cart Store Flow

```text
useCartStore.add(productId, quantity)
  -> Cart.add(productId, quantity)
  -> POST /cart/items
  -> refresh()
  -> GET /cart
  -> update local cart state
```

Tương tự với:

- `update`
- `remove`
- `clear`

## 11. Wishlist Store Flow

```text
toggle(productId)
  -> nếu product đang nằm trong wishlist:
       Wishlist.remove(productId)
  -> nếu chưa:
       Wishlist.add(productId)
  -> refresh()
```

## 12. Admin Auth Store

File:

```text
frontend/src/admin/store.ts
```

Admin login dùng cùng backend auth:

```text
Auth.login
  -> Auth.me
  -> kiểm tra roles chứa ADMIN hoặc ROLE_ADMIN
  -> nếu không phải admin thì logout
```

Store cũng có demo fallback:

```text
email: admin@auratech.io
password: admin123
```

Fallback này chỉ phục vụ test UI khi seed DB password không phải BCrypt thật.

## 13. API Wrapper Theo Module

Trong `client.ts`:

| Wrapper | Backend endpoint |
| --- | --- |
| `Products` | `/products` |
| `Brands` | `/brands` |
| `Categories` | `/categories` |
| `Reviews` | `/reviews` |
| `Auth` | `/auth`, `/users/me` |
| `Cart` | `/cart` |
| `Wishlist` | `/wishlists` |
| `Orders` | `/orders` |
| `UserAddresses` | `/user-addresses` |
| `Payments` | `/payments` |
| `AdminUsers` | `/users` |

## 14. Luồng Page Storefront

### Home

```text
Home
  -> load sản phẩm nổi bật/active
  -> render hero + product cards
```

### Shop

```text
Shop
  -> Products.list/listActive
  -> Brands.list
  -> Categories.list
  -> query filter/sort/page
  -> render product grid
```

### ProductDetail

```text
ProductDetail
  -> lấy slug từ route
  -> Products.bySlug(slug)
  -> Reviews.byProduct(productId)
  -> add cart/wishlist actions
```

### Checkout

```text
Checkout
  -> đọc cart store
  -> user nhập shippingAddress/paymentProvider
  -> Orders.create(OrderRequest)
  -> backend tạo order/payment
```

### Orders / OrderDetail

```text
Orders
  -> Orders.mine(page query)

OrderDetail
  -> Orders.byId(id)
  -> Payments.byOrder(id)
```

## 15. Luồng Admin Pages

Admin pages gọi API tương ứng:

```text
Admin Products -> Products list/create/update/delete
Admin Orders -> Orders listAll/updateStatus
Admin Payments -> Payments
Admin Users -> AdminUsers
Admin Coupons -> coupon endpoints
Admin Reviews -> review endpoints
```

Admin UI phụ thuộc backend role. User không có role admin sẽ bị từ chối.

## 16. Mapping Frontend-Backend Cần Nhớ

```text
frontend/src/types/api.ts
  phải khớp với
backend/src/main/java/.../dto/response và dto/request
```

Khi backend đổi DTO, cần cập nhật:

- `types/api.ts`
- `api/client.ts`
- page/component dùng field đó

Ví dụ backend `OrderResponse` có thể trả `orderItems`, frontend normalize thành `items` trong `client.ts`.

## 17. Khi Debug Frontend Gọi API

Checklist:

1. Backend có chạy ở `http://localhost:8080` không?
2. Frontend `VITE_API_BASE_URL` có đúng không?
3. Browser request có gửi cookie `AUTH_TOKEN` không?
4. Request POST/PUT/PATCH/DELETE có header `X-XSRF-TOKEN` không?
5. Backend CORS có allow origin frontend không?
6. Endpoint có bị security chặn không?
7. Response lỗi có `message` không? Frontend ưu tiên `error.response.data.message`.
