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
        ALTER TABLE public.workflow_controls
        ADD COLUMN IF NOT EXISTS auto_publish boolean NOT NULL DEFAULT false
      `)
      console.log("[add-auto-publish-column] Column auto_publish ensured")
      return new Response(JSON.stringify({ success: true, message: "auto_publish column added or already exists" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[add-auto-publish-column] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})