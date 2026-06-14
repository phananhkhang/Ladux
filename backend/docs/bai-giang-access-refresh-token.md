# Bài giảng: Access Token & Refresh Token trong AuraTech

> Mục tiêu: hiểu **tận gốc** cơ chế xác thực hai token của AuraTech — từ lý thuyết đến từng dòng code.
> Sau bài này bạn sẽ trả lời được: token là gì, tại sao cần *hai* loại, mỗi file đóng vai trò gì,
> và các luồng login / gọi API / refresh / logout / đổi mật khẩu / khóa tài khoản chạy ra sao.

Đối tượng: lập trình viên đã biết Java + Spring cơ bản, muốn nắm chắc tầng security.

---

## Phần 0 — Nền tảng lý thuyết (đọc trước khi vào code)

### 0.1 Authentication vs Authorization
- **Authentication (xác thực)**: "Bạn là ai?" → kiểm tra username/password, Google login.
- **Authorization (phân quyền)**: "Bạn được làm gì?" → ROLE_ADMIN, ROLE_CUSTOMER.

Bài này tập trung vào **authentication** và cách *duy trì trạng thái đã đăng nhập* qua token.

### 0.2 Vì sao cần token? Vấn đề của HTTP
HTTP là **stateless** — server không nhớ request trước. Sau khi đăng nhập, mỗi request tiếp theo
phải tự chứng minh "tôi đã đăng nhập rồi". Có 2 trường phái:

| | Session (cổ điển) | Token/JWT (AuraTech dùng) |
|---|---|---|
| Trạng thái | Server lưu session trong RAM/Redis | Token tự chứa thông tin, server **không cần lưu** |
| Mở rộng | Khó scale (sticky session) | Dễ scale ngang (stateless) |
| Thu hồi | Dễ (xóa session) | **Khó** (token đã phát thì sống tới khi hết hạn) |

AuraTech chọn JWT stateless để dễ scale, nhưng dùng thêm 2 kỹ thuật để **bù lại nhược điểm khó thu hồi**:
**refresh token lưu DB** + **tokenVersion**. Đây là điểm tinh tế nhất của hệ thống.

### 0.3 Hai loại token và lý do tồn tại

```
                ACCESS TOKEN                      REFRESH TOKEN
   ┌──────────────────────────────┐   ┌──────────────────────────────┐
   │ JWT (tự chứa claims)          │   │ Chuỗi ngẫu nhiên (opaque)     │
   │ Sống NGẮN: 15 phút            │   │ Sống DÀI: 7 ngày              │
   │ KHÔNG lưu DB (stateless)      │   │ LƯU DB (revoke/rotate được)   │
   │ Dùng cho MỌI request API      │   │ Chỉ dùng để xin access mới    │
   │ Cookie AUTH_TOKEN, path "/"   │   │ Cookie REFRESH_TOKEN,         │
   │                               │   │   path "/api/v1/auth"         │
   └──────────────────────────────┘   └──────────────────────────────┘
```

**Tại sao tách đôi?** Đánh đổi giữa *bảo mật* và *trải nghiệm*:
- Access token sống ngắn → nếu bị lộ, kẻ xấu chỉ dùng được tối đa ~15 phút.
- Nhưng nếu mọi token đều ngắn, user phải đăng nhập lại liên tục → khó chịu.
- Refresh token sống dài, **chỉ gửi tới endpoint auth** (path hẹp), để âm thầm xin access token mới.
  Vì nó lưu DB nên có thể thu hồi bất cứ lúc nào.

---

## Phần 1 — Bản đồ các file (ai làm gì)

```
                         ┌─────────────────────────┐
   Đăng nhập / OAuth2 →  │ AuthController           │  (controller/AuthController.java)
                         │ OAuth2SuccessHandler     │  (config/OAuth2SuccessHandler.java)
                         └───────────┬─────────────┘
                                     │ gọi
            ┌────────────────────────┼────────────────────────┐
            ▼                        ▼                         ▼
   ┌─────────────────┐    ┌────────────────────┐    ┌────────────────────┐
   │ JwtService      │    │ RefreshTokenService│    │ AuthCookieService  │
   │ tạo/đọc JWT     │    │ tạo/xoay/thu hồi   │    │ đóng gói cookie    │
   │ (access token)  │    │ (refresh token)    │    │ HttpOnly           │
   └─────────────────┘    └─────────┬──────────┘    └────────────────────┘
                                     │ dùng
                          ┌──────────┴───────────┐
                          ▼                       ▼
              ┌────────────────────┐   ┌────────────────────────┐
              │ RefreshToken (model)│  │ RefreshTokenRepository │
              │ + bảng refresh_tokens│ │ findByToken, revokeAll │
              └────────────────────┘   └────────────────────────┘

   Mỗi request API →  ┌──────────────────────────────────────────┐
                      │ JwtFilter (config/JwtFilter.java)         │
                      │  đọc cookie/header → verify → set context │
                      └──────────────┬───────────────────────────┘
                                     │ dùng
                  ┌──────────────────┼───────────────────┐
                  ▼                  ▼                    ▼
          ┌──────────────┐  ┌─────────────────┐  ┌────────────────────┐
          │ JwtService   │  │ MyUserDetailsSvc│  │ UserPrincipal      │
          │ verify token │  │ load user từ DB │  │ (UserDetails)      │
          └──────────────┘  └─────────────────┘  └────────────────────┘

   Cấu hình tổng:  SecurityConfig (filter chain, CSRF, CORS, phân quyền)
   tokenVersion:   User (model) + UserRepository.incrementTokenVersion + UserServiceImpl
```

| File | Vai trò một câu |
|------|------------------|
| `JwtService` | "Nhà máy" phát hành và kiểm định **access token** (JWT). |
| `RefreshTokenService` | Quản lý vòng đời **refresh token**: tạo, xoay vòng, thu hồi. |
| `AuthCookieService` | Đóng gói token vào cookie HttpOnly (set/clear). |
| `RefreshToken` + repo | Entity + truy vấn bảng `refresh_tokens`. |
| `AuthController` | Endpoint `/login`, `/refresh`, `/logout`, `/register`, `/csrf`. |
| `OAuth2SuccessHandler` | Sau khi Google xác thực OK → phát token + set cookie + redirect. |
| `JwtFilter` | Gác cổng mọi request: verify access token, nạp `Authentication`. |
| `MyUserDetailsService` | Load user từ DB thành `UserDetails`. |
| `UserPrincipal` | Bọc `User` thành `UserDetails` của Spring Security. |
| `User` + `tokenVersion` | Cơ chế vô hiệu hóa access token tức thì. |
| `SecurityConfig` | Khai báo filter chain, CSRF, CORS, luật phân quyền. |

---

## Phần 2 — Access token (JWT): `JwtService`

### 2.1 JWT trông như thế nào?
JWT gồm 3 phần ngăn bởi dấu chấm: `header.payload.signature`. Phần payload chứa **claims** (dữ liệu).
Ai cũng đọc được payload (chỉ base64, KHÔNG mã hóa), nhưng **không sửa được** vì sẽ làm sai chữ ký.

### 2.2 Phát hành access token

```java
public String generateAccessToken(User user) {
    return Jwts.builder()
            .subject(user.getUsername())                      // sub = username
            .claim("userId", user.getId())
            .claim("roles", user.getRoles().stream()
                    .map(r -> r.getName().name()).toList())
            .claim("type", "access")                          // phân biệt access vs loại khác
            .claim("tokenVersion", user.getTokenVersion())    // ★ chìa khóa thu hồi tức thì
            .id(UUID.randomUUID().toString())                 // jti — id duy nhất của token
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpirationMs)) // +15 phút
            .signWith(getKey())                               // ký HMAC
            .compact();
}
```

Điểm cần nhớ:
- `tokenVersion` được **đóng băng vào token** tại lúc phát. Sau này so với DB để biết token còn hiệu lực không (xem Phần 6).
- `type=access` để không nhầm với token loại khác.
- `exp` = 15 phút → token tự chết sau 15 phút dù không ai thu hồi.

### 2.3 Khóa ký (`getKey` / `resolveKeyBytes`)
```java
private byte[] resolveKeyBytes() {
    try {
        byte[] decoded = Decoders.BASE64.decode(secret);
        if (decoded.length >= 32) return decoded;   // secret chuẩn: base64, ≥ 32 byte (256-bit)
    } catch (RuntimeException ignored) { }
    // fallback: nếu secret là plain-text → hash SHA-256 cho đủ 32 byte
    return MessageDigest.getInstance("SHA-256").digest(secret.getBytes(UTF_8));
}
```
Lý do: HMAC-SHA256 yêu cầu khóa ≥ 256-bit. Code chấp nhận secret base64 chuẩn, đồng thời "cứu" trường hợp
dev đặt secret plain-text bằng cách băm SHA-256. **Phải ký và verify bằng cùng một khóa** — nếu lệch, mọi token sẽ fail.

### 2.4 Kiểm định token
```java
public boolean isTokenValid(String jwt, UserDetails userDetails) {
    final Claims claims = parseClaims(jwt);                 // parseClaims tự verify chữ ký
    boolean isAccessToken = "access".equals(claims.get("type", String.class));
    return isAccessToken
            && claims.getSubject().equals(userDetails.getUsername())  // đúng người
            && claims.getExpiration().after(new Date());              // chưa hết hạn
}
```
`parseClaims` dùng `verifyWith(getKey())`: nếu chữ ký sai hoặc token hỏng → ném `JwtException` ngay
(được bắt ở `JwtFilter`). `extractTokenVersion` đọc claim `tokenVersion` (có thể null với token cũ).

> **Tóm tắt JwtService:** stateless hoàn toàn — không chạm DB. Chỉ làm 2 việc: *ký* token khi đăng nhập,
> và *verify* token khi có request.

---

## Phần 3 — Refresh token (opaque): `RefreshToken` + `RefreshTokenService`

### 3.1 Vì sao refresh token KHÔNG phải JWT?
Vì ta cần **thu hồi được**. JWT stateless không thu hồi được; nên refresh token là một **chuỗi ngẫu nhiên**
lưu trong DB. Muốn vô hiệu hóa → set `revoked = true` hoặc xóa. Đơn giản và chắc chắn.

### 3.2 Entity & bảng
```java
// model/RefreshToken.java
String token;          // chuỗi random, UNIQUE
User user;             // thuộc về ai (ManyToOne)
Instant expiryDate;    // hết hạn (7 ngày)
boolean revoked;       // đã thu hồi chưa

public boolean isUsable() {                       // domain logic ngay trên entity
    return !revoked && expiryDate.isAfter(Instant.now());
}
```
Bảng `refresh_tokens` (migration V20): `token UNIQUE`, FK `user_id ON DELETE CASCADE`, index theo `user_id`
(để thu hồi toàn bộ phiên của 1 user nhanh).

### 3.3 Tạo token — chuỗi ngẫu nhiên mạnh
```java
private String generateOpaqueToken() {
    byte[] bytes = new byte[48];
    RANDOM.nextBytes(bytes);                         // SecureRandom — không đoán được
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
}
```
48 byte ngẫu nhiên = 384-bit entropy → không thể brute-force.

### 3.4 Xoay vòng — chống replay (quan trọng nhất)
```java
@Transactional
public RefreshToken verifyAndRotate(String rawToken) {
    if (rawToken == null || rawToken.isBlank())
        throw new BusinessRuleException("Thieu refresh token");
    RefreshToken current = repo.findByToken(rawToken)
            .orElseThrow(() -> new BusinessRuleException("Refresh token khong hop le"));
    if (!current.isUsable())                          // hết hạn hoặc đã bị thu hồi
        throw new BusinessRuleException("Refresh token da het han hoac da bi thu hoi");
    current.setRevoked(true);                         // ★ revoke token cũ
    return create(current.getUser());                 // ★ phát token MỚI
}
```
**Rotation = "dùng một lần"**. Mỗi lần refresh: token cũ chết, token mới sinh ra. Nếu kẻ xấu trộm được
refresh token và dùng lại sau khi user đã refresh → token đó đã `revoked` → bị từ chối. Đây là cách phát hiện/giảm thiểu trộm token.

> Lưu ý kỹ thuật: `findByToken` dùng `@EntityGraph({"user","user.roles"})` để **nạp sẵn user + roles**.
> Nhờ vậy sau khi transaction kết thúc, lúc sinh access token (đọc `user.getRoles()`) không bị lỗi lazy-loading.

### 3.5 Các kiểu thu hồi
```java
revoke(token)                 // thu hồi đúng 1 token
revokeSessionAndBump(token)   // LOGOUT: revoke token phiên này + tăng tokenVersion của user
revokeAllRefreshTokens(userId)// thu hồi TẤT CẢ refresh token của user (đổi mật khẩu / khóa account)
```
`revokeSessionAndBump` đáng chú ý:
```java
repo.findByToken(rawToken).ifPresent(token -> {
    token.setRevoked(true);                                   // refresh token chết
    userRepository.incrementTokenVersion(token.getUser().getId()); // access token cũ cũng chết (Phần 6)
});
```

---

## Phần 4 — Đóng gói cookie: `AuthCookieService`

Token được trả về client qua **cookie HttpOnly** (JavaScript không đọc được → chống XSS trộm token).

```java
private ResponseCookie.ResponseCookieBuilder baseCookie(String name, String value, String path) {
    return ResponseCookie.from(name, value)
            .httpOnly(true)        // JS không đọc được
            .secure(secure)        // dev=false, prod=true (chỉ gửi qua HTTPS)
            .path(path)            // giới hạn phạm vi gửi cookie
            .sameSite(sameSite);   // Strict — chống CSRF cross-site
}
```

| Cookie | Tên | Path | Max-age | Ý nghĩa path |
|--------|-----|------|---------|--------------|
| Access | `AUTH_TOKEN` | `/` | 15 phút | gửi kèm MỌI request API |
| Refresh| `REFRESH_TOKEN` | `/api/v1/auth` | 7 ngày | **chỉ** gửi tới endpoint auth → giảm bề mặt lộ |

`clearAccessCookie()` / `clearRefreshCookie()` set cùng tên/path nhưng `maxAge = 0` → trình duyệt xóa cookie.
(Phải trùng path thì trình duyệt mới xóa đúng cookie.)

---

## Phần 5 — Các luồng hoàn chỉnh (sequence)

### 5.1 Đăng nhập (`AuthController.login`)

```
Client                AuthController            authManager      JwtService   RefreshTokenSvc   AuthCookieSvc
  │  POST /login {user,pass} │                       │              │              │               │
  │─────────────────────────>│                       │              │              │               │
  │                          │ chặn user "seed"       │              │              │               │
  │                          │  (không phải BCrypt)   │              │              │               │
  │                          │ authenticate(user,pass)│              │              │               │
  │                          │──────────────────────> │ (BCrypt so khớp)            │               │
  │                          │ load user (kèm roles)  │              │              │               │
  │                          │ generateAccessToken ───────────────── >│             │               │
  │                          │ create refresh token ──────────────────────────────> │              │
  │                          │ tạo 2 cookie ──────────────────────────────────────────────────────>│
  │ 200 + Set-Cookie x2      │                       │              │              │               │
  │ body { accessToken }     │                       │              │              │               │
  │<─────────────────────────│                       │              │              │               │
```
Code rút gọn:
```java
authManager.authenticate(new UsernamePasswordAuthenticationToken(username, request.password()));
User user = userRepository.findByUsername(username).orElseThrow(...);
String accessToken = jwtService.generateAccessToken(user);
RefreshToken refreshToken = refreshTokenService.create(user);
return ResponseEntity.ok()
        .header(SET_COOKIE, authCookieService.createAccessCookie(accessToken).toString())
        .header(SET_COOKIE, authCookieService.createRefreshCookie(refreshToken.getToken()).toString())
        .body(Map.of("message","Login successful","accessToken", accessToken));
```
> Vì sao chặn "seed user"? Một số user mẫu trong DB không có hash BCrypt hợp lệ
> (regex `^\$2[aby]\$\d{2}\$.{53}$`). Cho họ đăng nhập sẽ gây lỗi khó hiểu, nên báo rõ ràng để đăng ký mới.

### 5.2 Gọi API đã đăng nhập (`JwtFilter`)

```
Client                          JwtFilter                MyUserDetailsService     SecurityContext
  │ GET /api/v1/orders          │                              │                      │
  │ Cookie: AUTH_TOKEN=...       │                              │                      │
  │────────────────────────────>│                              │                      │
  │                              │ 1. lấy jwt từ cookie/header   │                      │
  │                              │ 2. extractUsername (verify)   │                      │
  │                              │ 3. loadUserByUsername ───────>│ (query DB)          │
  │                              │ 4. isEnabled? (isActive)      │                      │
  │                              │ 5. isTokenValid?              │                      │
  │                              │ 6. tokenVersion khớp?         │                      │
  │                              │ 7. set Authentication ───────────────────────────> │
  │ request đi tiếp → Controller │                              │                      │
```

### 5.3 Refresh — xin access token mới (`AuthController.refresh`)

```
Client                       AuthController          RefreshTokenSvc        JwtService
  │ POST /api/v1/auth/refresh  │                          │                    │
  │ Cookie: REFRESH_TOKEN=...   │                          │                    │
  │────────────────────────────>│                         │                    │
  │                             │ verifyAndRotate(raw) ───>│ revoke cũ + tạo mới│
  │                             │ generateAccessToken ──────────────────────── >│
  │ 200 + Set-Cookie (access MỚI + refresh MỚI)            │                    │
  │<────────────────────────────│                         │                    │
```
Khi access token hết hạn (15 phút), frontend gọi `/refresh`. Vì refresh token sống 7 ngày, user không phải
đăng nhập lại. Mỗi lần refresh đều **xoay** cả refresh token (rotation).

### 5.4 Đăng xuất (`AuthController.logout`)
```java
String rawRefresh = readCookie(request, authCookieService.refreshCookieName());
refreshTokenService.revokeSessionAndBump(rawRefresh);   // refresh chết + tokenVersion++
return ResponseEntity.noContent()
        .header(SET_COOKIE, authCookieService.clearAccessCookie().toString())   // xóa cookie
        .header(SET_COOKIE, authCookieService.clearRefreshCookie().toString())
        .build();
```
Logout làm 3 việc: (1) thu hồi refresh token, (2) **tăng tokenVersion** để access token cũ chết ngay
(không chờ 15 phút), (3) xóa cookie ở trình duyệt.

### 5.5 OAuth2 Google (`OAuth2SuccessHandler`)
```java
String email = oAuth2User.getAttribute("email");
User user = userRepository.findByEmail(email);     // chỉ chấp nhận user ĐÃ đăng ký
if (user == null) → 401;                           // không auto-tạo account
if (!user.isActive()) → 403;
// phát access + refresh token, set cookie, rồi redirect về frontend
getRedirectStrategy().sendRedirect(request, response, successRedirectUrl);
```
Sau khi Google xác thực, handler này **cấp token y hệt luồng login thường** rồi redirect về
`app.oauth2.success-redirect`. Khác biệt: dùng `email` thay vì username, và không tạo user mới tự động.

---

## Phần 6 — `tokenVersion`: trái tim của thu hồi tức thì

### 6.1 Vấn đề
Access token là JWT stateless, sống 15 phút. Giả sử user logout / đổi mật khẩu / bị admin khóa lúc 10:00,
mà access token còn hạn tới 10:14 → kẻ xấu vẫn dùng được token đó 14 phút nữa. **Không chấp nhận được** với
hành động nhạy cảm.

### 6.2 Giải pháp: một con số phiên bản
- `User.tokenVersion` (cột DB, migration V21, mặc định 0).
- Mỗi access token mang theo `tokenVersion` **tại lúc phát**.
- Mỗi request, `JwtFilter` so: `tokenVersion trong token` **==** `tokenVersion trong DB`?
  - Bằng nhau → token còn hiệu lực.
  - Lệch → từ chối ngay (401).
- Muốn "giết" mọi access token cũ của user → chỉ cần **tăng tokenVersion trong DB lên 1**.

```java
// JwtFilter — sau khi isTokenValid()
Integer tokenVersion = jwtService.extractTokenVersion(jwt);
int currentVersion = (userDetails instanceof UserPrincipal up) ? up.getTokenVersion() : -1;
if (tokenVersion == null || tokenVersion != currentVersion) {
    rejectUnauthorized(response, fromCookie);   // 401 + xóa cookie
    return;
}
```

### 6.3 Ai tăng tokenVersion?

| Hành động | Code | Vì sao |
|-----------|------|--------|
| Logout | `RefreshTokenService.revokeSessionAndBump` → `userRepository.incrementTokenVersion(id)` | Giết access token cũ ngay |
| Đổi mật khẩu | `UserServiceImpl.updateProfile/updateUser`: `user.setTokenVersion(+1)` + `revokeAllRefreshTokens` | Đổi pass phải đá mọi phiên |
| Admin khóa account | `UserServiceImpl.updateUser` khi `isActive=false`: `+1` + `revokeAllRefreshTokens` | Khóa là phải out ngay |

> **Chi tiết tinh tế — 2 cách tăng tokenVersion:**
> - **Trên entity managed** (`user.setTokenVersion(+1)`): dùng khi service đang giữ `User` entity (updateUser/updateProfile).
>   Hibernate dirty-checking sẽ tự UPDATE khi flush. Nếu gọi query `incrementTokenVersion` ở đây sẽ bị flush
>   của entity ghi đè → sai. Nên caller tự `setTokenVersion` trực tiếp.
> - **Bằng UPDATE query** (`incrementTokenVersion`): dùng khi KHÔNG có User entity nào đang "dirty"
>   (logout — chỉ thao tác trên RefreshToken). An toàn vì không bị flush ghi đè.
>
> Đây là lý do `RefreshTokenService` tách rõ `revokeSessionAndBump` (dùng query) và `revokeAllRefreshTokens`
> (không tự bump — để caller quản lý tokenVersion trên entity).

### 6.4 `incrementTokenVersion` — UPDATE nguyên tử
```java
@Modifying
@Query("update User u set u.tokenVersion = u.tokenVersion + 1 where u.id = :id")
void incrementTokenVersion(@Param("id") Integer id);
```
Tăng ngay tại DB (`+1`), tránh race condition kiểu read-modify-write.

---

## Phần 7 — `JwtFilter` đọc kỹ từng bước

`JwtFilter extends OncePerRequestFilter` (chạy đúng 1 lần mỗi request), được cắm trước
`UsernamePasswordAuthenticationFilter` trong `SecurityConfig`.

```java
String jwt = resolveJwt(request);                 // ưu tiên cookie, sau đó header Bearer
boolean fromCookie = readJwtFromCookie(request) != null;

if (jwt == null) { filterChain.doFilter(request, response); return; }  // không token → đi tiếp (sẽ bị chặn ở authorize nếu endpoint cần auth)

try {
    username = jwtService.extractUsername(jwt);   // verify chữ ký + parse
} catch (JwtException | IllegalArgumentException ex) {
    SecurityContextHolder.clearContext();
    response.setStatus(401);
    if (fromCookie) response.addHeader(SET_COOKIE, authCookieService.clearAccessCookie().toString());
    return;                                       // token hỏng → 401, xóa cookie hỏng
}

if (username != null && context.getAuthentication() == null) {
    userDetails = userDetailsService.loadUserByUsername(username);   // load từ DB → UserPrincipal
    if (!userDetails.isEnabled()) { rejectUnauthorized(...); return; }  // (A) account bị khóa

    if (jwtService.isTokenValid(jwt, userDetails)) {
        // (B) so khớp tokenVersion
        if (tokenVersion == null || tokenVersion != currentVersion) { rejectUnauthorized(...); return; }

        // hợp lệ → tạo Authentication và nạp vào context
        var authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
filterChain.doFilter(request, response);          // đi tiếp vào controller
```

Ba lớp phòng thủ trong filter:
1. **Chữ ký + hết hạn** (`isTokenValid` / `extractUsername` ném exception).
2. **Account bị khóa** (`isEnabled()` = `user.isActive()`).
3. **tokenVersion** (logout/đổi pass/khóa account).

Khi `resolveJwt` ưu tiên cookie rồi mới tới header `Bearer`: hỗ trợ cả frontend dùng cookie (web) và
client dùng header (Postman / mobile). Nếu token đến từ cookie và hỏng → filter chủ động **xóa cookie** để
trình duyệt không gửi lại token rác.

> `MyUserDetailsService.loadUserByUsername` query user theo username (kèm roles qua `@EntityGraph`) và bọc
> thành `UserPrincipal`. `UserPrincipal.isEnabled()`/`isAccountNonLocked()` đều trả `user.isActive()`,
> và `getTokenVersion()` lộ tokenVersion cho filter so khớp.

---

## Phần 8 — `SecurityConfig`: nơi ráp mọi thứ lại

Những điểm liên quan token:
```java
.sessionManagement(s -> s.sessionCreationPolicy(STATELESS))   // KHÔNG dùng session — chỉ token
.csrf(csrf -> csrf
    .ignoringRequestMatchers("/api/v1/auth/login", "/.../refresh", "/.../logout", "/.../register",
                             "/api/v1/payments/vnpay-webhook", "/oauth2/**", "/login/oauth2/**")
    .ignoringRequestMatchers(BEARER_AUTH_REQUEST))            // request mang Bearer → miễn CSRF
.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)   // cắm JwtFilter
.oauth2Login(o -> o.successHandler(oAuth2SuccessHandler));
```

Vì sao endpoint auth được miễn CSRF? Vì lúc login chưa có session/CSRF token; và refresh/logout thao tác
trên cookie + được bảo vệ bởi `SameSite=Strict`. Còn request dùng `Bearer` (không dùng cookie) thì không có
nguy cơ CSRF nên cũng miễn.

---

## Phần 9 — Tổng kết & câu hỏi ôn tập

### 9.1 Bảng so sánh chốt hạ
| Tiêu chí | Access token | Refresh token |
|----------|--------------|---------------|
| Định dạng | JWT (tự chứa) | Chuỗi ngẫu nhiên opaque |
| Lưu DB? | Không | Có (`refresh_tokens`) |
| Vòng đời | 15 phút | 7 ngày |
| Thu hồi | Gián tiếp qua `tokenVersion` | Trực tiếp (`revoked=true`) |
| Phạm vi cookie | path `/` | path `/api/v1/auth` |
| Dùng để | gọi mọi API | xin access token mới |

### 9.2 Ba kỹ thuật bảo mật cốt lõi
1. **Hai token**: ngắn (an toàn) + dài (tiện) → cân bằng bảo mật/trải nghiệm.
2. **Rotation**: refresh token dùng một lần → phát hiện/giảm thiểu trộm token.
3. **tokenVersion**: bù nhược điểm "không thu hồi được" của JWT stateless → logout/đổi pass/khóa account có hiệu lực *tức thì*.

### 9.3 Tự kiểm tra (thử trả lời)
1. Vì sao access token không lưu DB mà refresh token thì có?
2. Nếu kẻ xấu trộm được access token thì thiệt hại tối đa bao lâu? Còn refresh token?
3. Khi đổi mật khẩu, tại sao phải vừa `revokeAllRefreshTokens` vừa tăng `tokenVersion`? Bỏ một cái thì sao?
4. Vì sao logout dùng `incrementTokenVersion` (query) còn đổi mật khẩu dùng `user.setTokenVersion(+1)` (entity)?
5. Refresh token để path `/api/v1/auth` thay vì `/` mang lại lợi ích bảo mật gì?
6. Điều gì xảy ra nếu `JwtService` ký bằng khóa A nhưng verify bằng khóa B?

### 9.4 Gợi ý trả lời nhanh
1. Access cần nhanh & scale (stateless); refresh cần thu hồi được nên phải lưu DB.
2. Access ~tối đa 15 phút; refresh tới 7 ngày (nhưng rotation + revoke giảm rủi ro).
3. Refresh chết để không xin được access mới; tokenVersion++ để access *đang cầm* chết ngay. Thiếu tokenVersion → access cũ sống thêm tới 15 phút.
4. Tránh việc flush của entity managed ghi đè kết quả UPDATE query (và ngược lại) — giữ nhất quán.
5. Cookie refresh chỉ gửi kèm cho endpoint auth → ít nơi có cơ hội lộ, giảm bề mặt tấn công.
6. Mọi token sẽ fail verify (chữ ký không khớp) → không ai đăng nhập được.

---

> File liên quan trong repo: `config/JwtFilter.java`, `config/SecurityConfig.java`, `config/OAuth2SuccessHandler.java`,
> `controller/AuthController.java`, `service/JwtService.java`, `service/RefreshTokenService.java`,
> `service/AuthCookieService.java`, `service/MyUserDetailsService.java`, `model/RefreshToken.java`,
> `model/User.java`, `model/UserPrincipal.java`, `repository/RefreshTokenRepository.java`,
> `repository/UserRepository.java`, `service/impl/UserServiceImpl.java`,
> migration `V20__create_refresh_tokens.sql`, `V21__add_token_version_to_users.sql`.
