# Cron Secret Hardening (workflow-scheduler + automation-run)

Ngày: 2026-04-29

## Mục tiêu

- Cho phép scheduler/cron (ví dụ Vercel Cron) gọi Edge Functions tự động mà không cần user admin token.
- Giữ nguyên khả năng admin UI gọi được endpoint.
- Không mở public endpoint: chỉ chấp nhận khi có admin token hoặc cron secret hợp lệ.

## Phạm vi

- Supabase Edge Functions:
  - `workflow-scheduler`
  - `automation-run`
- Shared auth helper:
  - Thêm “Cron OR Admin” guard.

## Thiết kế

### Auth mode: Cron OR Admin

Request được phép nếu thỏa 1 trong 2 điều kiện:

1) Admin token:
- Header: `Authorization: Bearer <jwt>`
- JWT hợp lệ và user có `app_metadata.role === "admin"`

2) Cron secret:
- Header: `x-vercel-cron: <secret>`
- `secret === Deno.env.get("VERCEL_CRON_SECRET")`

### Error behavior

- Thiếu cả hai → 401
- Có token nhưng không admin → 403
- Có cron header nhưng secret sai/thiếu env → 401

### Ops

- Cần cấu hình Supabase Secrets:
  - `VERCEL_CRON_SECRET` (random, đủ dài)

