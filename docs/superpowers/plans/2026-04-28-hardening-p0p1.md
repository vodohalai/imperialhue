# Hardening P0+P1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hardening bảo mật + tối ưu hiệu năng cho website (P0+P1) với thay đổi UI tối thiểu.

**Architecture:** Frontend được harden bằng sanitize HTML, admin role gate, khóa debug route, tối ưu tracking và code-splitting. Supabase Edge Functions được sửa lỗi, thêm admin auth gate cho endpoint nhạy cảm và rate-limit/payload-guard cho endpoint public gọi OpenAI.

**Tech Stack:** Vite, React, TypeScript, React Router, TanStack Query, Supabase JS, Supabase Edge Functions (Deno).

---

## File Map (tệp sẽ tạo/sửa)

**Create (Frontend)**
- `src/security/sanitizeHtml.ts`
- `src/security/admin.ts`
- `.env.example`

**Modify (Frontend)**
- `src/pages/ExploreDetail.tsx`
- `src/components/admin/AutomationWorkflow.tsx`
- `src/pages/DebugArticles.tsx`
- `src/App.tsx`
- `src/hooks/useBehaviorTracker.ts`
- `src/integrations/supabase/client.ts`
- `vite.config.ts`

**Modify (Supabase Edge Functions)**
- `supabase/functions/analyze-intent/index.ts`
- `supabase/functions/create-test-article/index.ts`
- `supabase/functions/generate-article/index.ts`
- `supabase/functions/automation-run/index.ts`
- `supabase/functions/init-automation-tables/index.ts`
- `supabase/functions/init-workflow-table/index.ts`
- `supabase/functions/workflow-scheduler/index.ts`

**Modify (Deploy)**
- `vercel.json`

---

## Task 1: Add HTML Sanitizer (client-side)

**Files:**
- Create: `src/security/sanitizeHtml.ts`
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Add dependencies**

Run:
```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

Expected: dependencies added; lockfile updated.

- [ ] **Step 2: Implement sanitizer utility**

Create `src/security/sanitizeHtml.ts`:
```ts
import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "code",
  "pre",
  "span",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "loading",
];

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "link", "meta"],
    FORBID_ATTR: ["style", "onerror", "onclick", "onload", "onmouseover"],
    USE_PROFILES: { html: true },
  });
}
```

- [ ] **Step 3: Verify TypeScript build picks up types**

Run:
```bash
pnpm -s build
```

Expected: build passes.

---

## Task 2: Apply sanitizer to HTML rendering sinks

**Files:**
- Modify: `src/pages/ExploreDetail.tsx`
- Modify: `src/components/admin/AutomationWorkflow.tsx`

- [ ] **Step 1: ExploreDetail sanitize before render**

In `src/pages/ExploreDetail.tsx`, import + memoize:
```ts
import { useMemo } from "react";
import { sanitizeHtml } from "@/security/sanitizeHtml";
```

Near where `article.content` is used:
```ts
const safeContent = useMemo(() => sanitizeHtml(article.content || ""), [article.content]);
```

Replace:
```tsx
dangerouslySetInnerHTML={{ __html: article.content }}
```
with:
```tsx
dangerouslySetInnerHTML={{ __html: safeContent }}
```

- [ ] **Step 2: AutomationWorkflow review preview sanitize**

In `src/components/admin/AutomationWorkflow.tsx`, import + memoize around `reviewItem.article.content` and replace `dangerouslySetInnerHTML` input with sanitized content.

- [ ] **Step 3: Smoke check UI**

Run:
```bash
pnpm -s dev --host 0.0.0.0 --port 8080
```

Expected: ExploreDetail và admin preview vẫn render HTML; không lỗi console.

---

## Task 3: Admin authorization (role claim) + lock debug route

**Files:**
- Create: `src/security/admin.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/DebugArticles.tsx`

- [ ] **Step 1: Add reusable admin checker**

Create `src/security/admin.ts`:
```ts
import type { Session } from "@supabase/supabase-js";

export function isAdminSession(session: Session | null): boolean {
  const role = (session?.user?.app_metadata as any)?.role;
  return role === "admin";
}
```

- [ ] **Step 2: Update ProtectedRoute to require admin**

In `src/App.tsx`:
1) Change session state type from `any` to `Session | null` (import `Session`).
2) Gate access: `if (!session || !isAdminSession(session)) return <Navigate to="/admin/login" />;`

Use:
```ts
import type { Session } from "@supabase/supabase-js";
import { isAdminSession } from "@/security/admin";
```

- [ ] **Step 3: Protect debug route**

In `src/App.tsx`, wrap `/debug-articles` in `ProtectedRoute` giống `/admin/*`.

- [ ] **Step 4: Reduce debug logging**

In `src/pages/DebugArticles.tsx`, remove `console.log` của toàn bộ data, giữ error logs tối thiểu.

- [ ] **Step 5: Manual check**

Expected:
- Không đăng nhập -> `/admin` redirect `/admin/login`
- Đăng nhập nhưng không có role admin -> vẫn bị chặn
- `/debug-articles` chỉ vào được khi admin

---

## Task 4: Supabase client env config (frontend)

**Files:**
- Modify: `src/integrations/supabase/client.ts`
- Create: `.env.example`

- [ ] **Step 1: Update client to use Vite env**

In `src/integrations/supabase/client.ts` replace constants with env:
```ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://kbzobkzdzdqfqulfqoly.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtiem9ia3pkemRxZnF1bGZxb2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTY1NDgsImV4cCI6MjA5MjY5MjU0OH0.m1M0qyPJSEvoo8e-Tr71v70ep6FsznZpKTOEHQ_jfMw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

- [ ] **Step 2: Add `.env.example`**

Create `.env.example`:
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 3: Verify build**

Run:
```bash
pnpm -s build
```

---

## Task 5: Optimize behavior tracking (dedupe/throttle/batch + AI debounce)

**Files:**
- Modify: `src/hooks/useBehaviorTracker.ts`

- [ ] **Step 1: Add throttle + dedupe state**

Update hook to track `lastScrollBucketRef` (Set of buckets) và throttle theo timestamp.

Target logic:
- Scroll depth bucketed: `25/50/75/100`.
- Mỗi bucket chỉ log 1 lần / page view.
- Throttle scroll handler ~ 250ms.

- [ ] **Step 2: Batch inserts**

Replace per-event insert:
```ts
await supabase.from("user_behaviors").insert(event);
```
with queued insert:
- `queueRef.current.push(event)`
- `flush()` inserts array mỗi 5s hoặc khi queue >= N (ví dụ 10)
- `useEffect` cleanup gọi `flush()` best-effort

- [ ] **Step 3: Debounce analyzeIntent**

Thay vì `length % 3 === 0`:
- Gọi AI khi có >= N events (ví dụ 8) và cách lần trước >= 30s
- Hoặc debounce theo timer (ví dụ user ngừng tương tác 5s)

- [ ] **Step 4: Manual check**

Expected:
- Scroll không tạo spam insert liên tục
- Khi cuộn qua 25/50/75/100 chỉ log 1 lần/bucket
- AI invoke ít hơn rõ rệt

---

## Task 6: Code splitting routes + dev-only Vite plugin

**Files:**
- Modify: `src/App.tsx`
- Modify: `vite.config.ts`

- [ ] **Step 1: Lazy-load thêm pages**

Convert các import trực tiếp sau sang `lazy()`:
- `Rooms`, `RoomDetail`, `Offers`, `Contact`, `About`, `Amenities`, `Availability`, `Booking`

Keep `Index`, `NotFound` eager (hoặc lazy cũng được nếu muốn).

- [ ] **Step 2: Ensure Suspense wrapping consistent**

All lazy routes should be wrapped with:
```tsx
<Suspense fallback={<LoadingFallback />}>
  <Component />
</Suspense>
```

- [ ] **Step 3: Make dyadComponentTagger dev-only**

Update `vite.config.ts` to:
```ts
export default defineConfig(({ mode }) => ({
  server: { host: "::", port: 8080 },
  plugins: [mode === "development" ? dyadComponentTagger() : null, react()].filter(Boolean),
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
}));
```

- [ ] **Step 4: Verify build**

Run:
```bash
pnpm -s build
```

---

## Task 7: Vercel cache headers for hashed assets

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Add headers rules**

Update `vercel.json` to include:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Rebuild**

Run:
```bash
pnpm -s build
```

---

## Task 8: Edge Functions – fix bugs + add guards (admin gate + rate-limit)

**Files:**
- Modify: `supabase/functions/analyze-intent/index.ts`
- Modify: `supabase/functions/create-test-article/index.ts`
- Modify: `supabase/functions/generate-article/index.ts`
- Modify: `supabase/functions/automation-run/index.ts`
- Modify: `supabase/functions/init-automation-tables/index.ts`
- Modify: `supabase/functions/init-workflow-table/index.ts`
- Modify: `supabase/functions/workflow-scheduler/index.ts`

- [ ] **Step 1: Fix analyze-intent Authorization header**

In `supabase/functions/analyze-intent/index.ts`, change:
```ts
'Authorization': `Bearer \${apiKey}`,
```
to:
```ts
Authorization: `Bearer ${apiKey}`,
```

- [ ] **Step 2: Add payload guards + rate-limit (best effort)**

Add:
- IP detection: `x-forwarded-for` (first IP) or `cf-connecting-ip`.
- In-memory Map limiter with window (ví dụ 20 req / 5 phút / IP).
- Reject too-large body (read `await req.text()` first; if length > 50_000 return 413).
- Parse JSON from text after size check.
- Cap `behaviors` length (ví dụ 50).

- [ ] **Step 3: Fix create-test-article missing import**

Replace dynamic import with explicit Supabase client:
- Use `createClient` (esm.sh) with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Insert article same as before.

- [ ] **Step 4: Add admin gate helper inside each admin-only function**

For these functions:
- `generate-article`
- `automation-run`
- `init-automation-tables`
- `init-workflow-table`
- `workflow-scheduler`

Implement a small inline guard at top:
1) Require `Authorization` header Bearer token
2) Create Supabase client using `SUPABASE_URL` + `SUPABASE_ANON_KEY` (or service role if only key available) and call `auth.getUser(token)`
3) Check `user.app_metadata.role === "admin"`
4) If fail: return 401/403

Return shape:
```ts
return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
  status: 401,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
```

- [ ] **Step 5: Ensure automation-run still uses service role for DB writes**

Do not remove:
```ts
createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")
```
Just enforce admin gate before running actions.

- [ ] **Step 6: Smoke verify locally (syntax)**

Run:
```bash
pnpm -s lint
pnpm -s build
```

Expected: frontend passes lint/build; edge functions compile at deploy time without import errors.

---

## Task 9: Final verification

- [ ] **Step 1: Install + lint**

Run:
```bash
pnpm -s install
pnpm -s lint
```

- [ ] **Step 2: Production build**

Run:
```bash
pnpm -s build
```

- [ ] **Step 3: Spot checks**

Manual:
- `/explore/:slug` render HTML bình thường.
- `/admin/*` bị chặn nếu không có role admin.
- `/debug-articles` bị chặn nếu không có role admin.
- Scroll không spam events quá mức.

