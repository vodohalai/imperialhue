// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import * as postgres from "https://deno.land/x/postgres@v0.19.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DATABASE_URL = Deno.env.get('SUPABASE_DB_URL') ?? ''
const pool = new postgres.Pool(DATABASE_URL, 3, true)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const connection = await pool.connect()

    try {
      // Create table if not exists
      await connection.queryObject(`
        CREATE TABLE IF NOT EXISTS public.workflow_controls (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          workflow_key text NOT NULL UNIQUE,
          mode text NOT NULL DEFAULT 'running' CHECK (mode IN ('running', 'paused')),
          updated_at timestamp with time zone DEFAULT now()
        )
      `)

      // Enable RLS
      await connection.queryObject(`ALTER TABLE public.workflow_controls ENABLE ROW LEVEL SECURITY`)

      // Create policies
      await connection.queryObject(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE policyname = 'Allow all for authenticated users' AND tablename = 'workflow_controls'
          ) THEN
            CREATE POLICY "Allow all for authenticated users" ON public.workflow_controls
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
          END IF;
        END
        $$;
      `)

      // Insert initial row if missing
      const result = await connection.queryObject(
        `INSERT INTO public.workflow_controls (workflow_key, mode) VALUES ($1, 'running') ON CONFLICT (workflow_key) DO NOTHING RETURNING id`,
        ['blog_automation']
      )
      const created = result.rows.length > 0

      return new Response(
        JSON.stringify({ success: true, message: created ? "Table created and row inserted" : "Table already exists" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[init-workflow-table] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})