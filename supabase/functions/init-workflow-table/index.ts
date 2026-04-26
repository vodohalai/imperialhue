// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if table already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('workflow_controls')
      .select('id')
      .limit(1)

    if (!checkError || existing) {
      return new Response(JSON.stringify({ success: true, message: "Table already exists" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Table does not exist, create it
    const { error: createError } = await supabaseAdmin.rpc('create_workflow_controls_table')

    if (createError) {
      console.error("[init-workflow-table] Error creating table:", createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    // Insert initial row
    await supabaseAdmin.from('workflow_controls').insert([{ workflow_key: 'blog_automation', mode: 'running' }])

    return new Response(JSON.stringify({ success: true, message: "Table created successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[init-workflow-table] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})