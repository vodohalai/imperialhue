// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { requireAdminOrCron } from "../shared/auth.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORKFLOW_KEY = "blog_automation"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    try {
      await requireAdminOrCron(req)
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      const status = message === "forbidden" ? 403 : 401
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: control } = await supabaseAdmin
      .from('workflow_controls')
      .select('mode')
      .eq('workflow_key', WORKFLOW_KEY)
      .single()

    if (control?.mode === 'paused') {
      console.log("[workflow-scheduler] Workflow is paused. Skipping.")
      return new Response(JSON.stringify({ status: 'skipped', reason: 'paused' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: string[] = []
    const nowIso = new Date().toISOString()

    const { data: dueJobs, error: dueJobsError } = await supabaseAdmin
      .from('ai_content_jobs')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', nowIso)

    if (dueJobsError) {
      console.error("[workflow-scheduler] Failed to fetch scheduled jobs:", dueJobsError.message)
      return new Response(JSON.stringify({ error: dueJobsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (dueJobs && dueJobs.length > 0) {
      for (const job of dueJobs) {
        const publishedAt = new Date().toISOString()

        const { error: updateJobError } = await supabaseAdmin
          .from('ai_content_jobs')
          .update({
            status: 'published',
            published_at: publishedAt,
            updated_at: publishedAt,
          })
          .eq('id', job.id)

        if (updateJobError) {
          console.error("[workflow-scheduler] Failed to publish job:", {
            jobId: job.id,
            message: updateJobError.message,
          })
          continue
        }

        if (job.article_id) {
          const { error: updateArticleError } = await supabaseAdmin
            .from('articles')
            .update({
              status: 'published',
              published_at: publishedAt,
              updated_at: publishedAt,
            })
            .eq('id', job.article_id)

          if (updateArticleError) {
            console.error("[workflow-scheduler] Failed to publish article:", {
              articleId: job.article_id,
              message: updateArticleError.message,
            })
            continue
          }
        }

        results.push(`Đã xuất bản bài theo lịch: ${job.title || job.id}`)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      actions: results,
      timestamp: nowIso
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[workflow-scheduler] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
