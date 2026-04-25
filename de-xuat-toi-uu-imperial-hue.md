# Đề xuất tối ưu tính năng & hiệu quả kinh doanh – Imperial Hue

URL đánh giá: https://imperialhue.vercel.app/  
Ngày đánh giá: 25/04/2026  
Phạm vi: UX/UI & luồng đặt phòng, Hiệu năng (Core Web Vitals), SEO & Analytics, Tính năng & chuyển đổi (conversion)

---

## 1) Tóm tắt điều hành (Executive summary)

Website hiện có giao diện đẹp, tone màu đồng nhất, bố cục “landing page + danh sách phòng + ưu đãi + trợ lý” phù hợp mô hình boutique hotel. Tuy nhiên nhiều điểm “đi qua được nhưng chưa chạy đến đích” trong hành trình chuyển đổi:

- **Các CTA quan trọng (Đặt phòng ngay / Kiểm tra phòng trống / Tìm bằng AI / Xem chi tiết / Khám phá ưu đãi)** phần lớn **chưa có hành động rõ ràng** (click không tạo chuyển trang/kết quả).
- **Thanh menu trên** (Trang chủ/Phòng nghỉ/Tiện nghi/Ưu đãi/…) có hiện “focus” nhưng **không điều hướng đúng section** (nhiều mục đưa về hero thay vì section tương ứng).
- **Trợ lý “Imperial”** có UI chat nhưng **không thấy gọi API** để trả lời → rủi ro “hứa mà không làm” (mất niềm tin).
- **Thiếu nội dung tin cậy & liên hệ**: chưa thấy section Contact rõ ràng (địa chỉ, số điện thoại, bản đồ, form), thiếu policy cơ bản (privacy/terms) → giảm tỷ lệ chuyển đổi.
- **Hiệu năng**: JS bundle ~**379KB** (chưa tính nén), CSS ~**65KB**; asset có tên hash nhưng header cache hiện **max-age=0, must-revalidate** → chưa tận dụng cache dài hạn cho tài nguyên tĩnh.
- **SEO**: tiêu đề trang hiển thị là `dyad-generated-app` (theo title trên tab) → cần tối ưu meta/OG, structured data, sitemap…

Mục tiêu đề xuất: chuyển website từ “demo/landing” thành **kênh tạo booking thực sự**, đo lường được phễu chuyển đổi, có nội dung SEO bền vững và đạt chuẩn hiệu năng.

---

## 2) Hiện trạng & quan sát khi testing (highlights)

### 2.1. Điều hướng & thông tin
- Có 2 hệ điều hướng:
  - **Top navigation**: Trang chủ/Phòng nghỉ/Tiện nghi/Ưu đãi/Khám phá Huế/Liên hệ.
  - **Bottom navigation** (Home/Rooms/Offers/Gallery/Contact) – hoạt động tốt hơn, click “Offers” đưa tới khu vực ưu đãi.
- **Contact**: không thấy section liên hệ hoàn chỉnh; click “Contact” không đưa tới nội dung khác biệt rõ ràng.

### 2.2. Các nút/công cụ chuyển đổi
- Nút **“Đặt phòng ngay”** (header): không mở flow đặt phòng / không chuyển trang.
- Widget đặt phòng có trường **Nhận phòng/Trả phòng** và **Khách** nhưng chưa thấy kết quả “tìm phòng trống”.
- Nút **“Kiểm tra phòng trống”**: click không hiển thị danh sách phòng trống theo ngày/khách.
- Danh sách phòng có **“Xem chi tiết”**: click không mở trang/ modal chi tiết.
- Khu **Ưu đãi** có nút **“Khám phá ưu đãi”**: click không mở trang/ danh sách ưu đãi chi tiết.

### 2.3. “AI Agent – Imperial”
- UI có tab Tìm phòng/Ưu đãi/Hỗ trợ/Thư viện và ô chat.
- Thử gửi câu hỏi: không thấy phản hồi và không thấy network request API mới → khả năng chưa có backend hoặc logic xử lý.

### 2.4. Hiệu năng & tài nguyên (quan sát nhanh)
- Tài nguyên chính:
  - JS: `index-80_uUEnh.js` ~ **378,838 bytes** (theo `content-length`).
  - CSS: `index-BPfWxJHX.css` ~ **65,506 bytes**.
- Header cache: `cache-control: public, max-age=0, must-revalidate` dù file đã hash → **chưa tối ưu cache**.
- Ảnh tải từ nguồn bên thứ ba (ví dụ Unsplash / nguồn hotlink khác) → cần chiến lược tối ưu ảnh & ổn định CDN.

---

## 3) Mục tiêu/KPI đề xuất

### 3.1. KPI chuyển đổi (Conversion)
- CTR nút “Đặt phòng ngay”: +30–80% (tùy baseline).
- Tỷ lệ “booking-start” (bắt đầu đặt phòng) / sessions: mục tiêu 2–5% (giai đoạn 1).
- Tỷ lệ hoàn tất đặt phòng (nếu có payment/engine): 0.5–2% (tùy thị trường/giá).

### 3.2. KPI hiệu năng (Core Web Vitals)
- LCP < 2.5s (mobile), INP < 200ms, CLS < 0.1.
- JS tổng tải ban đầu giảm 20–40% (giai đoạn 1).

### 3.3. KPI SEO
- Hoàn thiện meta/OG + sitemap + robots + schema → đạt “Good” trong Search Console.
- Tăng impressions cho nhóm từ khóa “khách sạn/boutique hotel Huế” & “phòng … Huế” theo roadmap nội dung.

---

## 4) Đề xuất tối ưu theo ưu tiên (Prioritized backlog)

### P0 – “Must fix để có booking” (0–7 ngày)

#### P0.1. Chuẩn hóa hành trình đặt phòng (Booking funnel)
**Vấn đề:** CTA hiện không dẫn tới hành động cụ thể.  
**Đề xuất:**
1. Quyết định mô hình booking:
   - **(A) Tích hợp booking engine** (Siteminder, Cloudbeds, Traveloka partner, Booking.com affiliate/booking link…)
   - **(B) Tự build booking flow** (chọn ngày → chọn phòng → thông tin khách → thanh toán/đặt cọc)
2. Nút **“Đặt phòng ngay”**:
   - Luôn dẫn tới trang/section đặt phòng (hero booking widget) **kèm focus** vào form.
   - Nếu có booking engine: mở trang engine ở tab mới hoặc embed modal (cân nhắc performance).
3. Nút **“Kiểm tra phòng trống”**:
   - Validate input (ngày hợp lệ, check-out > check-in, số khách).
   - Trả kết quả ngay bên dưới: danh sách phòng khả dụng + giá theo ngày + CTA “Đặt phòng”.

**Acceptance criteria:**
- Click “Đặt phòng ngay” luôn tạo ra 1 event (đo lường) và đưa user vào bước tiếp theo.
- “Kiểm tra phòng trống” hiển thị trạng thái loading + kết quả (hoặc thông báo lỗi có hướng dẫn).

#### P0.2. Trang chi tiết phòng (Room detail)
**Vấn đề:** “Xem chi tiết” chưa hoạt động, thiếu thông tin quyết định mua.  
**Đề xuất:**
- Tạo route/URL riêng cho từng phòng (ví dụ):
  - `/rooms/superior`, `/rooms/deluxe`, …
- Nội dung trang phòng:
  - Ảnh gallery (tối ưu), diện tích, loại giường, số khách, tiện nghi, chính sách (check-in/out, hủy), giá tham chiếu.
  - CTA “Đặt phòng” (prefill ngày/khách nếu có).
  - FAQ ngắn (2–5 câu).

**SEO benefit:** mỗi phòng trở thành landing page có thể xếp hạng riêng.

#### P0.3. Liên hệ (Contact) & tín nhiệm (Trust)
**Vấn đề:** thiếu contact rõ ràng làm giảm chuyển đổi.  
**Đề xuất:**
- Section/Trang “Liên hệ” có:
  - Địa chỉ + link Google Maps, số điện thoại (click-to-call), email, giờ lễ tân.
  - Form liên hệ (có anti-spam: honeypot/recaptcha).
  - Nút “Chat/Zalo/WhatsApp” (nếu phù hợp thị trường).
- “Footer chuẩn” trên mọi trang:
  - Link Privacy Policy, Terms, Cancellation Policy, Payment Policy.

#### P0.4. Sửa điều hướng top navigation
**Vấn đề:** nhiều mục top nav đưa về hero thay vì section tương ứng.  
**Đề xuất:**
- Thống nhất 1 hệ điều hướng (top nav + bottom nav dùng chung map anchor/route).
- Dùng anchor đúng (`#rooms`, `#amenities`, `#offers`, `#contact`…) hoặc route riêng.
- Đồng bộ trạng thái active theo scroll (scrollspy) để user biết đang ở đâu.

---

### P1 – Tăng chuyển đổi & đo lường (1–3 tuần)

#### P1.1. Tracking & Analytics (GA4/GTM)
**Đề xuất triển khai event tracking tối thiểu:**
- `view_room_list`, `select_room`, `view_room_detail`
- `click_book_now`, `booking_start`, `booking_complete` (nếu có)
- `apply_offer`, `view_offer_detail`
- `contact_click_phone`, `contact_submit_form`
- `chat_open`, `chat_submit` (khi AI hoạt động)

**Funnel đề xuất:**
1. Landing view
2. Booking widget interaction
3. Availability result view
4. Room detail view
5. Booking start
6. Booking complete

**Dashboard:**
- Tạo dashboard theo kênh (Organic/Paid/Social/Direct), theo device, theo ngôn ngữ.

#### P1.2. Tối ưu CTA/copy & “lý do chọn Imperial Hue”
**Bổ sung các khối nội dung tăng niềm tin:**
- Review/testimonials (Google reviews embed hoặc trích dẫn + link).
- USP rõ: vị trí, dịch vụ, phong cách Huế, bữa sáng, đưa đón…
- Hình ảnh thật (ưu tiên ảnh khách sạn) thay vì stock.

**CTA placement:**
- Sticky CTA “Đặt phòng” trên mobile (giống bottom nav nhưng ưu tiên booking).
- CTA thứ cấp: “Nhắn lễ tân” / “Xem ưu đãi hôm nay”.

#### P1.3. Ưu đãi (Offers) thành mô-đun kinh doanh
**Đề xuất:**
- Tạo danh sách ưu đãi có cấu trúc (title, điều kiện, thời gian áp dụng, CTA).
- Cho phép gắn ưu đãi vào phòng (offer → applicable room types).
- Gắn “offer badge” lên card phòng (tăng CTR).
- Có trang chi tiết ưu đãi + schema `Offer`.

#### P1.4. “Khám phá Huế” – nội dung hỗ trợ SEO & upsell
**Đề xuất:**
- Xây section/mini-blog: lịch trình 1/2/3 ngày, ẩm thực, di sản, trải nghiệm đôi, gia đình…
- Mỗi bài có CTA mềm: “Gợi ý phòng phù hợp”, “Đặt combo”.

---

### P2 – Hiệu năng, SEO nâng cao, AI thực dụng (3–6 tuần)

#### P2.1. Hiệu năng (Core Web Vitals) – checklist kỹ thuật
**Ảnh (quan trọng nhất cho LCP):**
- Dùng ảnh **WebP/AVIF**, tạo `srcset` responsive theo breakpoint.
- Lazy-load ảnh ngoài viewport; preload ảnh hero nếu là LCP.
- Tránh hotlink từ nguồn không ổn định; cân nhắc **CDN ảnh riêng**.
- `preconnect`/`dns-prefetch` tới domain ảnh bên thứ ba (nếu vẫn dùng).

**JS/CSS:**
- Tách bundle (code-splitting) theo route/section (Room detail, Gallery…).
- Loại bỏ thư viện thừa, kiểm tra tree-shaking.
- Giảm CSS không dùng (purge).

**Caching/CDN:**
- Vì asset có hash, cấu hình cache: `max-age=31536000, immutable` cho `/assets/*`.
- Bật Brotli/Gzip (Vercel thường có, nhưng nên xác thực bằng Lighthouse/DevTools).

**Kết quả kỳ vọng:** giảm tải ban đầu, tăng điểm Lighthouse Performance, cải thiện LCP/INP.

#### P2.2. SEO kỹ thuật (Technical SEO)
**Cần làm ngay (baseline):**
- Title/description chuẩn thương hiệu (không dùng `dyad-generated-app`).
- OpenGraph/Twitter card cho share.
- `sitemap.xml`, `robots.txt`, canonical.
- Structured data:
  - `Hotel`/`LodgingBusiness`
  - `Offer` (ưu đãi)
  - `FAQPage` (câu hỏi thường gặp)
  - `BreadcrumbList` (nếu có route nhiều tầng)

**i18n (VI/EN):**
- Nếu hỗ trợ đa ngôn ngữ: `hreflang`, URL theo locale (`/en`, `/vi`) hoặc query rõ ràng.
- Nút đổi ngôn ngữ cần có menu rõ ràng, lưu lựa chọn (cookie/localStorage) và đồng bộ SEO.

#### P2.3. AI Agent “Imperial” – làm đúng để tăng conversion
**Nguyên tắc:** AI phải **gắn vào hành động kinh doanh** (đề xuất phòng/ưu đãi, hỗ trợ đặt phòng), không chỉ chat cho vui.

**MVP AI (khả thi, ít rủi ro):**
- Bộ prompt + knowledge base (FAQ khách sạn, chính sách, địa điểm).
- “Quick replies” theo kịch bản:
  - “Tôi đi 2 người, 2 đêm, muốn yên tĩnh”
  - “Gợi ý lịch trình 2 ngày”
  - “Ưu đãi hiện có”
- AI trả về **card đề xuất**:
  - Phòng phù hợp + CTA “Xem phòng” / “Đặt phòng”
  - Ưu đãi phù hợp + CTA “Áp dụng ưu đãi”

**Kỹ thuật & an toàn:**
- Hiển thị trạng thái: typing/loading, lỗi khi không có kết nối.
- Disclaimer: “AI có thể sai; liên hệ lễ tân để xác nhận”.
- Log hội thoại (ẩn PII), đo lường `chat_to_booking` conversion.

---

## 5) Gợi ý thiết kế lại cấu trúc trang (Information Architecture)

### Option A (nhanh, SEO tốt): đa trang (recommended)
- `/` (Landing)
- `/rooms` (list)
- `/rooms/:slug` (detail)
- `/offers` + `/offers/:slug`
- `/explore-hue` + `/explore-hue/:slug`
- `/contact`

### Option B (giữ 1 trang): single-page có anchor chuẩn
- `/#rooms`, `/#amenities`, `/#offers`, `/#gallery`, `/#contact`
- Vẫn nên có route riêng cho room detail & offer detail để SEO tốt hơn.

---

## 6) Kế hoạch triển khai theo giai đoạn (Roadmap)

### Giai đoạn 1 (0–7 ngày): “Make it work”
- Fix điều hướng top nav (đúng anchor/route).
- Kích hoạt CTA quan trọng: Đặt phòng ngay / Kiểm tra phòng trống.
- Tạo Contact section + footer policy tối thiểu.
- Tạo trang room detail cho 2–3 phòng (pilot).

### Giai đoạn 2 (1–3 tuần): “Measure & optimize”
- GA4 + GTM events + funnel dashboard.
- Hoàn thiện room detail cho toàn bộ phòng.
- Offers module + landing page ưu đãi.
- Nội dung “Khám phá Huế” (5–10 bài nền tảng).

### Giai đoạn 3 (3–6 tuần): “Scale”
- Tối ưu CWV (ảnh, bundle, cache).
- SEO kỹ thuật nâng cao (schema đầy đủ, i18n/hreflang).
- AI Agent MVP có đề xuất phòng/ưu đãi + tracking.

---

## 7) Danh sách “quick wins” cụ thể (có thể làm ngay)

1. Đổi title trang từ `dyad-generated-app` → “Imperial Hue Boutique Hotel | Khách sạn boutique tại Huế”.
2. Sửa cache cho asset có hash → `immutable` để tăng tốc quay lại.
3. Thêm Contact: số điện thoại + Zalo + Maps ở cuối trang (ít nhất).
4. “Đặt phòng ngay” scroll tới form + focus, hoặc mở booking engine.
5. “Xem chi tiết” mở modal đơn giản (ảnh + mô tả + CTA) trước khi làm route đầy đủ.
6. Ảnh hero: preload + nén WebP.

---

## 8) Phụ lục – Checklist kiểm thử sau khi tối ưu
- [ ] Tất cả CTA đều tạo hành động rõ ràng (chuyển trang / mở modal / hiển thị kết quả).
- [ ] Form đặt phòng có validate và thông báo lỗi thân thiện.
- [ ] Room detail có đầy đủ ảnh, tiện nghi, chính sách, CTA.
- [ ] Contact có địa chỉ, điện thoại, email, bản đồ, form.
- [ ] GA4 ghi nhận events và funnel hoạt động.
- [ ] Lighthouse mobile đạt mục tiêu CWV.
- [ ] SEO: title/description/OG + sitemap + schema OK.

