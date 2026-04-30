// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORKFLOW_KEY = "blog_automation"
const AUTOMATION_RUN_URL = "https://kbzobkzdzdqfqulfqoly.supabase.co/functions/v1/automation-run"

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

async function invokeAutomationAction(action: string, serviceRoleKey: string): Promise<{ success: boolean; data: any }> {
  const actionStart = Date.now()
  console.log(`[workflow-scheduler] Invoking automation-run action="${action}"`)

  try {
    const response = await fetch(AUTOMATION_RUN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ action }),
    })

    const data = await response.json()
    const durationMs = Date.now() - actionStart

    if (!response.ok || !data.success) {
      console.error(`[workflow-scheduler] automation-run action="${action}" failed`, {
        status: response.status,
        message: data?.message,
        durationMs,
      })
      return { success: false, data: { ...data, duration_ms: durationMs } }
    }

    console.log(`[workflow-scheduler] automation-run action="${action}" succeeded`, {
      durationMs,
      summary: data?.topics ? `${data.topics.length} topics` : data?.article ? `article #${data.article.id}` : data?.image_url ? "image generated" : "ok",
    })

    return { success: true, data: { ...data, duration_ms: durationMs } }
  } catch (error) {
    const durationMs = Date.now() - actionStart
    console.error(`[workflow-scheduler] automation-run action="${action}" network error:`, error.message)
    return { success: false, data: { error: error.message, duration_ms: durationMs } }
  }
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

    if (totalJobs > 0) {
      // ── Có bài đến hạn → xuất bản như bình thường ────────────
      if (failedCount.value === 0) {
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
    }

    // ── Không có bài đến hạn → chạy pipeline từ đầu ──────────
    console.log("[workflow-scheduler] No due jobs. Starting full pipeline: research → write → generate-image")
    await writeLog(supabaseAdmin, "scheduler", "success", "Không có bài đến hạn — bắt đầu pipeline tự động", null, Date.now() - startTime)

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const pipelineResults: string[] = []
    const pipelineErrors: string[] = []

    // Step 1: Research
    const researchResult = await invokeAutomationAction("research", serviceRoleKey)
    if (researchResult.success) {
      pipelineResults.push(`Research: tìm thấy ${researchResult.data.topics?.length || 0} chủ đề mới`)
    } else {
      pipelineErrors.push(`Research thất bại: ${researchResult.data?.message || researchResult.data?.error || "unknown"}`)
    }

    // Step 2: Write
    const writeResult = await invokeAutomationAction("write", serviceRoleKey)
    if (writeResult.success) {
      pipelineResults.push(`Write: đã viết bài "${writeResult.data.article?.title || "không tên"}"`)
    } else {
      pipelineErrors.push(`Write thất bại: ${writeResult.data?.message || writeResult.data?.error || "unknown"}`)
    }

    // Step 3: Generate Image
    const imageResult = await invokeAutomationAction("generate-image", serviceRoleKey)
    if (imageResult.success) {
      pipelineResults.push(`Generate Image: đã tạo ảnh (nguồn: ${imageResult.data.image_source || "unknown"})`)
    } else {
      pipelineErrors.push(`Generate Image thất bại: ${imageResult.data?.message || imageResult.data?.error || "unknown"}`)
    }

    const pipelineDurationMs = Date.now() - startTime
    await writeLog(supabaseAdmin, "scheduler", pipelineErrors.length === 0 ? "success" : "success",
      `Pipeline hoàn tất: ${pipelineResults.length}/${pipelineResults.length + pipelineErrors.length} bước thành công`,
      { pipeline_results: pipelineResults, pipeline_errors: pipelineErrors.length > 0 ? pipelineErrors : undefined },
      pipelineDurationMs
    )

    return new Response(JSON.stringify({
      success: true,
      mode: "pipeline",
      pipeline_results: pipelineResults,
      pipeline_errors: pipelineErrors.length > 0 ? pipelineErrors : undefined,
      timestamp: nowIso,
      duration_ms: pipelineDurationMs,
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
