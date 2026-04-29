import type { User } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { supabaseAdmin } from "./supabase-client.ts";

const CRON_HEADER = "x-vercel-cron";

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length ? token : null;
}

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

export async function requireAdmin(req: Request): Promise<User> {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error("missing_token");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error("invalid_token");
  }

  const role = (data.user.app_metadata as any)?.role;
  if (role !== "admin") {
    throw new Error("forbidden");
  }

  return data.user;
}

export async function requireAdminOrCron(req: Request): Promise<User | null> {
  if (isValidCron(req)) return null;
  return await requireAdmin(req);
}
