// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORKFLOW_KEY = "blog_automation"

async function writeLog(supabaseAdmin, action, status, message, details = null, durationMs = null) {
  await supabaseAdmin.from("workflow_logs").insert([{
    workflow_key: WORKFLOW_KEY,
    action,
    status,
    message,
    details,
    duration_ms: durationMs,
  }])
}

serve(async (req) => {
  const startTime = Date.now()

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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
      await writeLog(supabaseAdmin, "scheduler", "skipped", "Workflow đang tạm dừng")
      return new Response(JSON.stringify({ status: 'skipped', reason: 'paused' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: string[] = []
    const failedCount = { value: 0 }
    const nowIso = new Date().toISOString()

    const { data: dueJobs, error: dueJobsError } = await supabaseAdmin
      .from('ai_content_jobs')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', nowIso)

    if (dueJobsError) {
      console.error("[workflow-scheduler] Failed to fetch scheduled jobs:", dueJobsError.message)
      await writeLog(supabaseAdmin, "scheduler", "failed", dueJobsError.message)
      return new Response(JSON.stringify({ error: dueJobsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (dueJobs && dueJobs.length > 0) {
      console.log(`[workflow-scheduler] Publishing ${dueJobs.length} scheduled job(s)`)

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
          failedCount.value++
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
            failedCount.value++
            continue
          }
        }

        results.push(`Đã xuất bản bài theo lịch: ${job.title || job.id}`)
      }
    }

    const durationMs = Date.now() - startTime
    const totalJobs = dueJobs?.length || 0
    const successCount = totalJobs - failedCount.value

    if (totalJobs === 0) {
      await writeLog(supabaseAdmin, "scheduler", "success", "Không có bài nào đến hạn xuất bản", { checked_at: nowIso }, durationMs)
    } else if (failedCount.value === 0) {
      await writeLog(supabaseAdmin, "scheduler", "success", `Đã xuất bản ${successCount} bài`, { published: results, total: totalJobs, checked_at: nowIso }, durationMs)
    } else {
      await writeLog(supabaseAdmin, "scheduler", "success", `Đã xuất bản ${successCount}/${totalJobs} bài (${failedCount.value} lỗi)`, { published: results, total: totalJobs, failed: failedCount.value, checked_at: nowIso }, durationMs)
    }

    return new Response(JSON.stringify({
      success: true,
      actions: results,
      timestamp: nowIso,
      duration_ms: durationMs,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const durationMs = Date.now() - startTime
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    await writeLog(supabaseAdmin, "scheduler", "failed", error.message, { stack: error.stack }, durationMs)

    console.error("[workflow-scheduler] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
