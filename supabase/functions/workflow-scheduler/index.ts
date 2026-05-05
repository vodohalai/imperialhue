// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-force-run',
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

async function invokeAutomationAction(
  action: string,
  serviceRoleKey: string,
  extraBody: Record<string, unknown> = {}
): Promise<{ success: boolean; data: any }> {
  const actionStart = Date.now()
  const body = { action, ...extraBody }
  console.log(`[workflow-scheduler] Invoking automation-run action="${action}"`, { extraKeys: Object.keys(extraBody) })

  try {
    const response = await fetch(AUTOMATION_RUN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify(body),
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

// ─── Helpers ─────────────────────────────────────────────────

/** Chuyển giờ Việt Nam (UTC+7) sang giờ UTC */
function vietnamToUtc(hours: number, minutes: number): { h: number; m: number } {
  let utcH = hours - 7
  if (utcH < 0) utcH += 24
  return { h: utcH, m: minutes }
}

/** Kiểm tra xem thời gian hiện tại có khớp với giờ đăng không (±2 phút) */
function isScheduleTime(now: Date, scheduleUtcH: number, scheduleUtcM: number): boolean {
  const nowH = now.getUTCHours()
  const nowM = now.getUTCMinutes()

  if (nowH !== scheduleUtcH) return false

  // Cho phép sai số ±2 phút vì cron chạy mỗi 5 phút
  const diff = Math.abs(nowM - scheduleUtcM)
  return diff <= 2
}

/** Kiểm tra hôm nay đã chạy pipeline thành công chưa */
async function hasRunToday(supabaseAdmin): Promise<boolean> {
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabaseAdmin
    .from("workflow_logs")
    .select("id")
    .eq("workflow_key", WORKFLOW_KEY)
    .eq("action", "scheduler")
    .eq("status", "success")
    .gte("created_at", todayStart.toISOString())
    .limit(1)

  if (error) {
    console.error("[workflow-scheduler] Error checking today's runs:", error.message)
    return false
  }

  return (data?.length || 0) > 0
}

async function hasPendingTopic(supabaseAdmin): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("seo_topics")
    .select("id")
    .eq("status", "pending")
    .limit(1)

  if (error) {
    console.error("[workflow-scheduler] Error checking pending topics:", error.message)
    return false
  }

  return (data?.length || 0) > 0
}

// ─── Main ────────────────────────────────────────────────────

serve(async (req) => {
  const startTime = Date.now()

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Kiểm tra force flag qua header (dùng cho nút "Chạy ngay")
  const forceRun = req.headers.get("x-force-run") === "true"

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Lấy trạng thái workflow
    const { data: control } = await supabaseAdmin
      .from('workflow_controls')
      .select('mode, auto_publish, default_schedule_time')
      .eq('workflow_key', WORKFLOW_KEY)
      .single()

    if (!control) {
      console.log("[workflow-scheduler] No workflow_controls row yet. Skipping.")
      return new Response(JSON.stringify({ status: 'skipped', reason: 'no_control_row' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Nếu đang pause → skip (force vẫn bỏ qua pause)
    if (control?.mode === 'paused' && !forceRun) {
      console.log("[workflow-scheduler] Workflow is paused. Skipping.")
      return new Response(JSON.stringify({ status: 'skipped', reason: 'paused' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const autoPublish = control?.auto_publish === true
    const scheduleTime = control?.default_schedule_time || "08:00"

    // 3. Parse giờ đăng (Việt Nam) → UTC
    const [scheduleH, scheduleM] = scheduleTime.split(":").map(Number)
    const targetUtc = vietnamToUtc(scheduleH, scheduleM)

    const now = new Date()
    const nowIso = now.toISOString()

    console.log(`[workflow-scheduler] Schedule check: VN=${scheduleTime} → UTC=${String(targetUtc.h).padStart(2,"0")}:${String(targetUtc.m).padStart(2,"0")} | Now UTC=${String(now.getUTCHours()).padStart(2,"0")}:${String(now.getUTCMinutes()).padStart(2,"0")} | force=${forceRun}`)

    // 4. Kiểm tra đúng giờ (bỏ qua nếu force)
    if (!forceRun && !isScheduleTime(now, targetUtc.h, targetUtc.m)) {
      const msg = `Chưa đến giờ chạy (hẹn: ${scheduleTime} giờ VN)`
      console.log(`[workflow-scheduler] ${msg}`)
      return new Response(JSON.stringify({ status: 'skipped', reason: 'not_time_yet', schedule_time_vn: scheduleTime }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Kiểm tra hôm nay đã chạy chưa (bỏ qua nếu force)
    if (!forceRun) {
      const alreadyRan = await hasRunToday(supabaseAdmin)
      if (alreadyRan) {
        console.log("[workflow-scheduler] Pipeline already ran today. Skipping.")
        return new Response(JSON.stringify({ status: 'skipped', reason: 'already_ran_today' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // 6. Chạy pipeline: research → write → generate-image
    console.log(`[workflow-scheduler] Starting pipeline: research → write → generate-image`)
    console.log(`[workflow-scheduler] auto_publish =`, autoPublish)
    await writeLog(supabaseAdmin, "scheduler", "running", "Bắt đầu pipeline tự động", { auto_publish: autoPublish, schedule_time_vn: scheduleTime }, Date.now() - startTime)

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const pipelineResults: string[] = []
    const pipelineErrors: string[] = []
    let writeSucceeded = false
    let attemptedResearch = false
    let skippedReason: string | null = null

    const pendingBefore = await hasPendingTopic(supabaseAdmin)
    if (!pendingBefore) {
      attemptedResearch = true
      const researchResult = await invokeAutomationAction("research", serviceRoleKey)
      if (researchResult.success) {
        pipelineResults.push(`Research: tìm thấy ${researchResult.data.topics?.length || 0} chủ đề mới`)
      } else {
        pipelineErrors.push(`Research thất bại: ${researchResult.data?.message || researchResult.data?.error || "unknown"}`)
      }
    }

    // Step 1: Write (kèm auto_publish)
    const writeExtra: Record<string, unknown> = {}
    if (autoPublish) {
      writeExtra.auto_publish = true
    }

    let writeResult = await invokeAutomationAction("write", serviceRoleKey, writeExtra)
    if (!writeResult.success) {
      const msg = writeResult.data?.message || writeResult.data?.error || "unknown"
      if (!attemptedResearch && msg.includes("Không còn chủ đề nào đang chờ")) {
        attemptedResearch = true
        const researchResult = await invokeAutomationAction("research", serviceRoleKey)
        if (researchResult.success) {
          pipelineResults.push(`Research: tìm thấy ${researchResult.data.topics?.length || 0} chủ đề mới`)
        } else {
          pipelineErrors.push(`Research thất bại: ${researchResult.data?.message || researchResult.data?.error || "unknown"}`)
        }
        writeResult = await invokeAutomationAction("write", serviceRoleKey, writeExtra)
      }
    }

    if (writeResult.success) {
      writeSucceeded = true
      const statusLabel = autoPublish ? "đã đăng" : "đã viết nháp"
      pipelineResults.push(`Write: ${statusLabel} bài "${writeResult.data.article?.title || "không tên"}"`)

      // Step 2: Generate Image
      const imageResult = await invokeAutomationAction("generate-image", serviceRoleKey)
      if (imageResult.success) {
        pipelineResults.push(`Generate Image: đã tạo ảnh (nguồn: ${imageResult.data.image_source || "unknown"})`)
      } else {
        pipelineErrors.push(`Generate Image thất bại: ${imageResult.data?.message || imageResult.data?.error || "unknown"}`)
      }
    } else {
      const msg = writeResult.data?.message || writeResult.data?.error || "unknown"
      if (msg.includes("Không còn chủ đề nào đang chờ")) {
        skippedReason = "no_pending_topic"
      }
      pipelineErrors.push(`Write thất bại: ${msg}`)
    }

    const pipelineDurationMs = Date.now() - startTime
    const schedulerStatus = writeSucceeded ? "success" : skippedReason ? "skipped" : "failed"
    await writeLog(supabaseAdmin, "scheduler", schedulerStatus,
      `Pipeline hoàn tất: ${pipelineResults.length}/${pipelineResults.length + pipelineErrors.length} bước thành công`,
      { pipeline_results: pipelineResults, pipeline_errors: pipelineErrors.length > 0 ? pipelineErrors : undefined, auto_publish: autoPublish, schedule_time_vn: scheduleTime, skipped_reason: skippedReason || undefined },
      pipelineDurationMs
    )

    return new Response(JSON.stringify({
      success: writeSucceeded,
      mode: "pipeline",
      pipeline_results: pipelineResults,
      pipeline_errors: pipelineErrors.length > 0 ? pipelineErrors : undefined,
      auto_publish: autoPublish,
      schedule_time_vn: scheduleTime,
      scheduler_status: schedulerStatus,
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
