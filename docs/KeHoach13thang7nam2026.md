# Kế hoạch 13 tháng 7 năm 2026

**Dự án:** Ladux  
**Chủ đề:** Implement `FileStorageService`, upload multipart (category), refactor storage, học & gỡ lỗi FE ↔ BE  
**Mục tiêu ngày:** Code chạy được end-to-end + hiểu kiến trúc + checklist tự debug  

---

## 0. Bức tranh hiện tại (đã đọc codebase)

### Đã có

| Thành phần | Vai trò | Trạng thái |
|------------|---------|------------|
| `uploads/` (root project) | Disk: `products/`, `avatars/`, `categories/` | Có file seed |
| `app.upload.root` | Dev: `../uploads` (từ `backend/`) | OK |
| `WebConfig` | Map `GET /uploads/**` → disk | OK |
| `SecurityConfig` | `GET /uploads/**` permitAll | OK |
| Vite proxy | `/api` + `/uploads` → `:8080` | OK |
| `ProductImageServiceImpl.storeProductImage` | Multipart → `/uploads/products/{uuid}.ext` | **Logic copy-paste** |
| `UserServiceImpl.storeAvatar` | Multipart → `/uploads/avatars/...` + xóa file cũ | **Logic copy-paste** |
| Product admin UI | Create JSON → upload multipart | Đã wire |
| Avatar UI | `FormData` → `/users/me/avatar` | Đã wire |

### Đang dở / lỗi thiết kế

| File | Vấn đề |
|------|--------|
| `FileStorageService.java` | **Rỗng** — class thường, chưa interface/impl, chưa `@Service` |
| `CategoryService.uploadCategoryImage` | Method trống |
| `AdminCategoryController` `POST .../uploads-image` | Gọi service trống; return type `CategoryResponse` nhưng body rỗng; path typo `uploads-image`; thiếu `consumes = MULTIPART` |
| `CategoryServiceImpl` | Method upload body empty |
| Admin Categories UI | Chỉ gửi `{ name }`, **không** upload / không gửi `imageUrl` |
| Config | Có `product-dir`, `avatar-dir` — **chưa** `category-dir` |
| DRY | 2 chỗ `store*` gần như giống hệt → đúng lý do tách `FileStorageService` |

### Mô hình đúng (đã thống nhất trong project)

```text
[Browser MultipartFile]
        │
        ▼
FileStorageService.store(subdir, file)
  → validate type/size
  → ghi disk: {uploadRoot}/{subdir}/{uuid}.ext
  → return public path: "/uploads/{subdir}/{uuid}.ext"
        │
        ▼
Domain service (Category / Product / User)
  → lưu STRING path vào DB (imageUrl / thumbnail / avatar)
        │
        ▼
GET /uploads/**  (static)  →  <img src={resolveMediaUrl(path)} />
```

**Không** nhét binary vào `CategoryRequest`. JSON chỉ mang path.

### `imageUrl` trong CategoryRequest là gì?

- Đây **không phải file ảnh**, mà là **chuỗi đường dẫn / URL** trỏ tới file đã có sẵn.
- Ví dụ: `/uploads/categories/categories_laptop_gaming.webp`
- API admin category nhận **JSON** `application/json`, field `imageUrl` optional.
- Frontend hiển thị qua `resolveMediaUrl(imageUrl)` → `GET /uploads/...` (Spring static + Vite proxy).

### Vì sao không MultipartFile trong CategoryRequest?

| | Lưu file (binary) | Gắn category (metadata) |
|--|-------------------|-------------------------|
| Input | `MultipartFile` / `FormData` | JSON: `name`, `parentId`, `imageUrl` |
| Content-Type | `multipart/form-data` | `application/json` |
| Kết quả | File trên disk + path string | Cột `categories.image_url` = path đó |

1. DB chỉ cần string — không nhét blob vào Postgres qua JSON body.  
2. CRUD category đơn giản — 1 request JSON.  
3. Tách I/O file — validate, security, ghi disk là luồng riêng.  
4. Linh hoạt nguồn ảnh — local path, CDN, URL ngoài.  
5. Giống product thumbnail (`String`) — upload file nằm endpoint riêng.

---

## 1. Mục tiêu ngày (Definition of Done)

Cuối ngày có thể:

1. Implement **`FileStorageService`** dùng chung (store + delete local).
2. Refactor **product + avatar** dùng service này (bỏ duplicate).
3. Hoàn thiện **category upload** end-to-end (API + Admin UI).
4. Hiểu và **tự gỡ** 5–7 lỗi FE↔BE phổ biến khi upload.
5. Ghi checklist test tay (Postman + UI).

**Không** nhắm trong ngày: S3/CDN, resize ảnh, virus scan.

---

## 2. Kiến trúc mục tiêu (học + code)

```text
                    Controllers (thin)
         ┌──────────────┼──────────────────┐
         │              │                  │
 AdminCategory   AdminProductImage    UserController
 upload-image     /images/upload       /me/avatar
         │              │                  │
         ▼              ▼                  ▼
  CategoryService  ProductImageService  UserService
  (business: gắn   (business: Product   (business: Customer
   imageUrl DB)     Image + thumbnail)   avatarUrl)
         │              │                  │
         └──────────────┼──────────────────┘
                        ▼
              FileStorageService  ◄── CHỈ I/O file
              store(subdir, file) → "/uploads/..."
              deleteIfLocal(url)
                        │
                        ▼
              disk: uploads/{products|avatars|categories}/
```

### Nguyên tắc layer

| Layer | Được làm | Không làm |
|-------|----------|-----------|
| `FileStorageService` | Validate MIME, path traversal, write/delete, trả URL | Touch entity, transaction DB, cache |
| Domain service | Gọi storage, gán field entity, rule nghiệp vụ | Copy `Files.copy` lặp lại |
| Controller | Auth, bind multipart/JSON, HTTP status | Logic file |
| Frontend | `FormData` upload → lấy path → JSON create/update | Giả định file đã nằm DB |

---

## 3. Lịch trình theo block

### Buổi sáng — 2.5–3h: FileStorageService (core)

#### Block A — Đọc lại (30–40 phút, không code vội)

Đọc theo thứ tự và ghi note 1 trang:

1. `application.properties` + `application-dev.properties` (`UPLOAD_ROOT`)
2. `WebConfig.addResourceHandlers`
3. `ProductImageServiceImpl.storeProductImage` (full)
4. `UserServiceImpl.storeAvatar` + `deleteStoredAvatarIfLocal`
5. `AdminCategoryController` + stub category upload
6. Frontend: `Auth.uploadAvatar`, `AdminProducts.uploadImages`, `resolveMediaUrl` (`frontend/src/lib/format.ts`)

**Câu hỏi tự kiểm tra:**

- Vì sao dev dùng `../uploads`?
- Path trả về tại sao bắt đầu bằng `/uploads/` chứ không phải absolute disk path?
- `target.startsWith(directory)` chống gì?

#### Block B — Implement FileStorageService (90–120 phút)

API tối thiểu:

```java
// interface + @Service impl
public interface FileStorageService {
    /** @return public URL path e.g. /uploads/categories/uuid.webp */
    String store(String subDir, MultipartFile file);

    /** no-op if null/external URL/not under /uploads/ */
    void deleteIfLocal(String publicUrl);
}
```

Checklist implement:

- [ ] `@Service` + inject `@Value("${app.upload.root}")`
- [ ] Allowlist MIME: jpeg/png/webp/gif → extension
- [ ] Reject empty file
- [ ] `UUID` + extension filename
- [ ] `Files.createDirectories` + `Files.copy`
- [ ] Path traversal guard (`normalize` + `startsWith`)
- [ ] `deleteIfLocal`: chỉ xóa path bắt đầu `/uploads/`
- [ ] Exception → `BusinessRuleException` (message rõ)
- [ ] Config: `app.upload.category-dir=categories` (thêm properties)

**Không** làm interface rỗng rồi nhét logic lung tung vào `CategoryService`.

#### Block C — Unit test nhẹ (30 phút, optional nhưng nên)

- [ ] File rỗng → exception
- [ ] Content-Type lạ → exception
- [ ] store mock `MultipartFile` → path đúng pattern `/uploads/{subdir}/...`

---

### Buổi trưa / đầu chiều — 2h: Refactor domain dùng FileStorage

**Thứ tự refactor (an toàn):**

1. **ProductImageServiceImpl**
   - Inject `FileStorageService`
   - `storeProductImage` → `fileStorage.store(productUploadDir, file)`
   - (Optional) khi delete image: `deleteIfLocal` — hiện **chưa** xóa file disk (TODO)

2. **UserServiceImpl**
   - `storeAvatar` → `fileStorage.store(avatarDir, file)`
   - `deleteStoredAvatarIfLocal` → `fileStorage.deleteIfLocal`

3. **Smoke test tay**
   - Login admin
   - Upload avatar profile
   - Upload ảnh product
   - Ảnh còn load qua `http://localhost:3000/uploads/...`

**Checkpoint học:** sau refactor, behavior không đổi — chỉ bớt duplicate. Nếu product/avatar gãy → rollback logic storage trước khi đụng category.

---

### Chiều — 2.5–3h: Category upload end-to-end

#### Backend — contract API

| Quyết định | Khuyến nghị |
|------------|-------------|
| Path | `POST /api/v1/admin/categories/upload-image` (sửa typo `uploads-image`) |
| Part name | `file` (thống nhất avatar/product) |
| Response | **Không** trả `CategoryResponse` rỗng — trả DTO path, vd. `{ "url": "/uploads/categories/..." }` |
| Gắn category | 2 bước: (1) upload → url (2) create/update JSON `{ name, imageUrl: url }` |
| Hoặc | `POST /{id}/image` multipart → update luôn `imageUrl` category đó |

**Khuyến nghị học/clear nhất (giống product):**

```text
1) POST /admin/categories/upload-image  →  { url }
2) POST/PUT /admin/categories          →  { name, imageUrl: url }
```

Sửa:

- [ ] DTO `UploadUrlResponse(String url)` (hoặc reuse generic)
- [ ] `CategoryService.uploadCategoryImage` → gọi `FileStorageService.store("categories", file)` return `String`
- [ ] Controller: `consumes = MULTIPART_FORM_DATA`, `@RequestPart("file")`, return body url
- [ ] `@PreAuthorize("hasRole('ADMIN')")` giữ nguyên
- [ ] Cache: upload-only không cần `@CacheEvict`; update `imageUrl` thì đã có cache evict trên update

#### Lỗi API stub hiện tại (phải fix khi code)

```java
// Hiện tại — SAI / dở
@PostMapping("/uploads-image")
public ResponseEntity<CategoryResponse> uploadCategoryImage(...) {
    service.uploadCategoryImage(file);  // void + empty
    return new ResponseEntity<>(HttpStatus.OK); // body null, type CategoryResponse
}
```

#### Frontend Admin Categories

- [ ] Input `type="file"` accept image/*
- [ ] Preview local `URL.createObjectURL` hoặc sau upload `resolveMediaUrl(url)`
- [ ] `AdminCategories.uploadImage(file)` → FormData, **không** set cứng Content-Type sai boundary
- [ ] Save: `create/update({ name, imageUrl })`
- [ ] List vẫn show thumbnail như hiện tại

#### Pseudo-code tham khảo

```java
// FileStorageServiceImpl.store
validate non-empty
ext = ALLOWED.get(contentType) or throw
filename = UUID + ext
dir = absolute(uploadRoot / subDir).normalize()
target = dir.resolve(filename).normalize()
if (!target.startsWith(dir)) throw
createDirectories(dir)
copy(inputStream, target)
return "/uploads/" + subDir + "/" + filename
```

```ts
// FE Admin category
const { url } = await AdminCategories.uploadImage(file)
await AdminCategories.create({ name, imageUrl: url })
```

---

### Cuối ngày — 1–1.5h: Gỡ lỗi FE↔BE + checklist

#### Ma trận lỗi thường gặp

| Triệu chứng | Nguyên nhân hay gặp | Chỗ xem |
|-------------|---------------------|---------|
| 401/403 upload | Chưa login admin / thiếu Bearer / CSRF | Network tab, cookie `XSRF-TOKEN` |
| 415 Unsupported Media Type | Quên `multipart`, gửi JSON | Controller `consumes` |
| 400 / "Chi ho tro anh..." | MIME không trong allowlist, hoặc browser gửi `application/octet-stream` | `file.getContentType()` log tạm |
| 413 | Vượt `max-file-size=5MB` | `application.properties` |
| File có trên disk, UI 404 | Sai `UPLOAD_ROOT` (chạy từ `backend/` vs root); WebConfig path | So `uploads` vs `../uploads` |
| FE preview vỡ, API OK | Quên proxy `/uploads` hoặc `resolveMediaUrl` | `vite.config.ts` + `format.ts` |
| Path DB đúng, ảnh đen | Double-encode path; absolute URL sai origin | Network GET image status |
| Multipart rỗng backend | Tên part không phải `file`; axios + default `Content-Type: application/json` | FormData append name |
| Create category không có ảnh | Upload OK nhưng quên gửi `imageUrl` trong JSON | body create |
| CORS cookie | Gọi thẳng `:8080` thay vì `:3000` proxy | baseURL FE |

#### Checklist test tay (DoD)

```text
[ ] POST upload category image (admin token) → 200 + { url }
[ ] File xuất hiện trong uploads/categories/
[ ] GET {url} qua :8080 và :3000 đều 200
[ ] Create category với imageUrl → list admin hiện thumb
[ ] Home "Shop by category" hiện ảnh mới
[ ] Update category đổi ảnh → ảnh cũ optional xóa (nếu implement deleteIfLocal)
[ ] Upload non-image → 4xx message rõ
[ ] Product + avatar vẫn upload sau refactor
```

---

## 4. Thứ tự file nên đụng (để không loãng)

```text
1. application.properties (+ category-dir)
2. FileStorageService interface
3. FileStorageServiceImpl
4. ProductImageServiceImpl (refactor)
5. UserServiceImpl (refactor)
6. UploadUrlResponse (DTO)
7. CategoryService + Impl
8. AdminCategoryController
9. frontend client.ts + types
10. admin/misc.tsx (AdminCategories UI)
```

Mỗi bước: compile/run → test 1 flow → checkpoint trước khi bước tiếp.

---

## 5. Học gì trong ngày (gắn với bug thật)

1. **Multipart vs JSON** — vì sao 2 request; `CategoryRequest.imageUrl` là path.
2. **Public URL vs disk path** — DB/`img src` dùng `/uploads/...`; disk = `UPLOAD_ROOT + subdir + file`.
3. **Path traversal** — `../../../etc/passwd` qua tên file.
4. **Static resource + security** — GET public, POST admin.
5. **Working directory** — dev `../uploads` khi app chạy từ `backend/`.
6. **Axios FormData** — đừng ép `Content-Type: application/json`.
7. **Separation of concerns** — storage không biết Category; Category không `Files.copy`.

---

## 6. Tối ưu kiến trúc (ưu tiên nếu còn giờ)

| Ưu tiên | Việc | Lý do |
|--------|------|--------|
| P0 | FileStorageService + category upload E2E | Unblock admin |
| P1 | Refactor product/avatar | DRY, 1 chỗ fix security |
| P2 | Xóa file disk khi xóa product image / đổi category image | Tránh rác disk |
| P3 | Magic-bytes check (không chỉ Content-Type) | Content-Type giả được |
| P4 | `max-file-size` message thân thiện trong exception handler | DX |
| P5 (sau) | S3/MinIO adapter sau interface | Interface sẵn thì đổi impl |

**Không** làm ngày 13/7: đổi schema bỏ `imageUrl`, embed base64 trong JSON, upload qua data URL.

---

## 7. Agenda in 1 trang (sticky)

| Giờ | Việc | Output |
|-----|------|--------|
| 08:30–09:15 | Đọc 6 file + vẽ sơ đồ | Note 1 trang |
| 09:15–11:00 | FileStorageService + config | Store/delete chạy được |
| 11:00–12:00 | Refactor product + avatar | Smoke OK |
| 13:30–15:30 | Category API + DTO + service | Postman upload OK |
| 15:30–17:00 | Admin Categories UI | Create có ảnh |
| 17:00–18:00 | Ma trận lỗi + checklist | List bug đã tự gỡ ≥3 |

---

## 8. Rủi ro cần tránh

1. Nhét `Files.copy` vào controller.
2. Trả `CategoryResponse` khi chưa có category id (upload “mồ côi”).
3. Lưu absolute path Windows `C:\Users\...` vào DB → vỡ production/proxy.
4. Sửa `UPLOAD_ROOT` lung tung giữa root repo và `backend/`.
5. FE set `Content-Type: multipart/form-data` **thiếu boundary** (hoặc giữ default JSON).
6. Scope creep: brand logo upload, resize, CDN trong cùng ngày.

---

## 9. File / path tham chiếu nhanh

### Backend

| Path | Ghi chú |
|------|---------|
| `backend/src/main/java/org/akira/ladux/service/FileStorageService.java` | Stub rỗng — implement tại đây (hoặc tách interface + `impl/`) |
| `backend/src/main/java/org/akira/ladux/service/impl/ProductImageServiceImpl.java` | `storeProductImage` — nguồn copy logic |
| `backend/src/main/java/org/akira/ladux/service/impl/UserServiceImpl.java` | `storeAvatar` / `deleteStoredAvatarIfLocal` |
| `backend/src/main/java/org/akira/ladux/service/impl/CategoryServiceImpl.java` | `uploadCategoryImage` trống |
| `backend/src/main/java/org/akira/ladux/controller/admin/AdminCategoryController.java` | Endpoint upload dở |
| `backend/src/main/java/org/akira/ladux/controller/admin/AdminProductImageController.java` | Mẫu multipart tốt |
| `backend/src/main/java/org/akira/ladux/config/WebConfig.java` | Static `/uploads/**` |
| `backend/src/main/resources/application.properties` | `app.upload.*`, multipart size |
| `backend/src/main/resources/application-dev.properties` | `app.upload.root=../uploads` |

### Frontend

| Path | Ghi chú |
|------|---------|
| `frontend/src/api/client.ts` | `uploadAvatar`, `AdminProducts.uploadImages`, `AdminCategories` |
| `frontend/src/api/types.ts` | `CategoryRequest.imageUrl` |
| `frontend/src/lib/format.ts` | `resolveMediaUrl` |
| `frontend/src/app/pages/admin/misc.tsx` | `AdminCategories` UI |
| `frontend/src/app/pages/admin/products.tsx` | Mẫu multi-image upload admin |
| `frontend/vite.config.ts` | Proxy `/api`, `/uploads` |

### Disk

| Path | Ghi chú |
|------|---------|
| `uploads/products/` | Ảnh product |
| `uploads/avatars/` | Avatar user |
| `uploads/categories/` | Ảnh category (seed + upload mới) |

---

## 10. Tóm tắt một câu

**Ngày 13/7/2026 = (1) viết `FileStorageService` đúng chỗ I/O → (2) gỡ duplicate product/avatar → (3) category = multipart lấy path + JSON gán `imageUrl` + Admin UI → (4) luyện gỡ lỗi FE/BE bằng checklist.**

---

*Tài liệu lập từ phân tích codebase Ladux — dùng làm agenda code & học trong ngày.*
