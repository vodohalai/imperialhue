# Cron Secret Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm cron secret guard cho `workflow-scheduler` và `automation-run` theo cơ chế Cron OR Admin.

**Architecture:** Mở rộng shared auth helper trong Edge Functions để hỗ trợ `requireAdminOrCron(req)`. Hai endpoint mục tiêu dùng guard mới, giữ nguyên luồng xử lý cũ.

**Tech Stack:** Supabase Edge Functions (Deno), supabase-js (esm.sh).

---

## File Map

**Modify**
- `supabase/functions/shared/auth.ts`
- `supabase/functions/workflow-scheduler/index.ts`
- `supabase/functions/automation-run/index.ts`

---

## Task 1: Add cron guard helper

**Files:**
- Modify: `supabase/functions/shared/auth.ts`

- [ ] **Step 1: Add cron secret reader**

Add helpers:
```ts
const CRON_HEADER = "x-vercel-cron";

function getCronSecret(req: Request): string | null {
  const value = req.headers.get(CRON_HEADER) || req.headers.get(CRON_HEADER.toUpperCase());
  return value?.trim() ? value.trim() : null;
}

function isValidCron(req: Request): boolean {
  const expected = Deno.env.get("VERCEL_CRON_SECRET") || "";
  if (!expected) return false;
  const provided = getCronSecret(req) || "";
  return Boolean(provided) && provided === expected;
}
```

- [ ] **Step 2: Add `requireAdminOrCron`**

Add:
```ts
export async function requireAdminOrCron(req: Request): Promise<User | null> {
  if (isValidCron(req)) return null;
  return await requireAdmin(req);
}
```

Expected: `requireAdminOrCron` returns `null` if cron secret passed, else returns admin user (or throws).

---

## Task 2: Apply to workflow-scheduler

**Files:**
- Modify: `supabase/functions/workflow-scheduler/index.ts`

- [ ] **Step 1: Replace guard**

Replace:
```ts
await requireAdmin(req)
```
with:
```ts
await requireAdminOrCron(req)
```

Keep existing try/catch block mapping errors to 401/403.

---

## Task 3: Apply to automation-run

**Files:**
- Modify: `supabase/functions/automation-run/index.ts`

- [ ] **Step 1: Replace guard**

Replace:
```ts
await requireAdmin(req)
```
with:
```ts
await requireAdminOrCron(req)
```

Keep existing try/catch block mapping errors to 401/403.

---

## Task 4: Verification

- [ ] **Step 1: Lint + build**

Run:
```bash
pnpm -s lint
pnpm -s build
```

- [ ] **Step 2: Manual request checklist (prod/staging)**

Expected:
- Gọi `workflow-scheduler` với `x-vercel-cron` đúng secret → 200
- Gọi `workflow-scheduler` không header → 401
- Gọi `automation-run` với `x-vercel-cron` đúng secret và `action=research` → 200 (nếu OPENAI key có)
- Admin UI vẫn gọi được `automation-run` với Authorization admin token → 200

