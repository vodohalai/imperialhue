import type { Session } from "@supabase/supabase-js";

export function isAdminSession(session: Session | null): boolean {
  const role = (session?.user?.app_metadata as any)?.role;
  return role === "admin";
}
