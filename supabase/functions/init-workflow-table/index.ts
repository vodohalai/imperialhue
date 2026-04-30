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
      await connection.queryObject(`
        CREATE TABLE IF NOT EXISTS public.workflow_controls (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          workflow_key text NOT NULL UNIQUE,
          mode text NOT NULL DEFAULT 'running' CHECK (mode IN ('running', 'paused')),
          default_schedule_time text NOT NULL DEFAULT '06:00',
          updated_at timestamp with time zone DEFAULT now()
        )
      `)

      await connection.queryObject(`
        ALTER TABLE public.workflow_controls
        ADD COLUMN IF NOT EXISTS default_schedule_time text NOT NULL DEFAULT '06:00'
      `)

      await connection.queryObject(`ALTER TABLE public.workflow_controls ENABLE ROW LEVEL SECURITY`)

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

      const result = await connection.queryObject(
        `INSERT INTO public.workflow_controls (workflow_key, mode, default_schedule_time)
         VALUES ($1, 'running', '06:00')
         ON CONFLICT (workflow_key) DO UPDATE
         SET default_schedule_time = COALESCE(public.workflow_controls.default_schedule_time, '06:00')
         RETURNING id`,
        ['blog_automation']
      )
      const created = result.rows.length > 0

      return new Response(
        JSON.stringify({ success: true, message: created ? "Table ready" : "Table already exists" }),
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