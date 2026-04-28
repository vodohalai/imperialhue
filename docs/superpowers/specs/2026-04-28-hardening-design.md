# Hardening P0+P1 (Security + Performance) – Imperial Hue

Ngày: 2026-04-28

## Mục tiêu

- Giảm rủi ro bảo mật vận hành (XSS, lộ endpoint debug, thiếu phân quyền admin, abuse Edge Functions).
- Giảm chi phí và tải (tracking spam DB, gọi AI dày, bundle lớn, caching chưa tối ưu).
- Giữ nguyên hành vi sản phẩm hiện có; thay đổi UI tối thiểu.

## Phạm vi

- Frontend (React/Vite):
  - Sanitize HTML trước khi render nội dung bài viết.
  - Khóa admin theo role claim.
  - Ẩn/khóa debug route.
  - Tối ưu tracking (dedupe/throttle/batch).
  - Code splitting thêm cho route.
  - Chuẩn hóa env Supabase ở client.
- Supabase Edge Functions (Deno):
  - Sửa lỗi runtime (import thiếu, header OpenAI sai).
  - Thêm cơ chế bảo vệ endpoint:
    - Admin-only với các endpoint automation/generate/init/scheduler.
    - Rate-limit + giới hạn payload với endpoint public gọi OpenAI (analyze-intent).
  - CORS giữ `*` (tạm thời), nhưng chuẩn hóa để sau này chuyển allowlist bằng env dễ dàng.
- Deploy (Vercel):
  - Thêm cache headers cho `/assets/*` (immutable) và giữ SPA rewrite.

## Non-goals

- Chuyển kiến trúc SEO sang SSR/SSG.
- Viết test e2e đầy đủ; chỉ bổ sung smoke verification qua build/lint và chạy dev.

## Thiết kế chi tiết

### 1) XSS: sanitize HTML khi render

**Hiện trạng**

- Nội dung bài viết HTML được render bằng `dangerouslySetInnerHTML`:
  - `ExploreDetail` render `article.content`.
  - `AutomationWorkflow` render `reviewItem.article.content`.

**Thay đổi**

- Thêm hàm sanitize (client-side) để loại bỏ script, event handlers, URL độc hại, và các tag không mong muốn.
- Sanitize trước khi truyền vào `dangerouslySetInnerHTML`.
- Memoize theo `content` để giảm CPU.

**Chấp nhận**

- Không còn khả năng chạy `script`/inline handler từ `article.content`.
- Bài viết vẫn hiển thị đúng cấu trúc cơ bản (p, h2/h3, ul/li, strong/em, a, img nếu cho phép).

### 2) Admin authorization theo role claim

**Hiện trạng**

- ProtectedRoute chỉ kiểm tra có session.

**Thay đổi**

- ProtectedRoute check thêm `session.user.app_metadata.role === "admin"` (hoặc field tương đương).
- Nếu không đạt, redirect `/admin/login`.

**Chấp nhận**

- User authenticated nhưng không có role admin không truy cập được `/admin/*`.

### 3) Debug route

**Hiện trạng**

- `/debug-articles` public và có nút tạo test article.

**Thay đổi**

- Bọc route `/debug-articles` bằng ProtectedRoute (admin-only).
- Giảm log console trong trang debug (không log toàn data).

### 4) Edge Functions hardening

**Sửa lỗi**

- `create-test-article`: bỏ import module không tồn tại; tạo Supabase client từ env.
- `analyze-intent`: sửa Authorization header để dùng đúng `${apiKey}`.

**Admin-only endpoints**

- `generate-article`, `automation-run`, `init-automation-tables`, `init-workflow-table`, `workflow-scheduler`:
  - Xác thực JWT từ header `Authorization: Bearer <token>`.
  - Check role admin (dựa trên claim/user metadata).

**Public endpoint rate-limit**

- `analyze-intent`:
  - Rate-limit best-effort theo IP (in-memory) và giới hạn số request/interval.
  - Giới hạn payload (số behaviors tối đa, size JSON).

### 5) Tracking tối ưu

**Hiện trạng**

- Mỗi event insert trực tiếp vào DB.
- Scroll depth có thể log lặp lại.
- Mỗi 3 event gọi AI.

**Thay đổi**

- Dedupe scroll depth theo page view.
- Throttle scroll handler.
- Batch events và flush theo timer/unload.
- Debounce/giảm tần suất gọi AI (theo thời gian + số event).

### 6) Code splitting & dev-only plugin

- Convert thêm pages sang `lazy()` ở `App.tsx`.
- Bật `dyadComponentTagger()` chỉ trong dev.

### 7) Env Supabase client

- `SUPABASE_URL` và `SUPABASE_ANON_KEY` chuyển sang `import.meta.env`.
- Fallback sang hardcoded chỉ khi env thiếu (để tránh break local ngay lập tức) hoặc bắt buộc env (tùy quyết định triển khai).

### 8) Vercel cache headers

- Thêm headers:
  - `/assets/(.*)` -> `cache-control: public, max-age=31536000, immutable`.

## Verification

- `pnpm -s lint`
- `pnpm -s build`
- Smoke run `pnpm -s dev` và kiểm tra:
  - Explore/ExploreDetail render OK.
  - Admin route bị chặn nếu không admin role.
  - Debug route bị khóa.
  - Tracking không spam insert khi scroll.

