import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://kbzobkzdzdqfqulfqoly.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtiem9ia3pkemRxZnF1bGZxb2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTY1NDgsImV4cCI6MjA5MjY5MjU0OH0.m1M0qyPJSEvoo8e-Tr71v70ep6FsznZpKTOEHQ_jfMw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
