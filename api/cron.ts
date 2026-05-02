import type { VercelRequest, VercelResponse } from "@vercel/node";

const WORKFLOW_SCHEDULER_URL =
  "https://kbzobkzdzdqfqulfqoly.supabase.co/functions/v1/workflow-scheduler";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtiem9ia3pkemRxZnF1bGZxb2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTY1NDgsImV4cCI6MjA5MjY5MjU0OH0.m1M0qyPJSEvoo8e-Tr71v70ep6FsznZpKTOEHQ_jfMw";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Chỉ chấp nhận POST để hạn chế truy cập ngẫu nhiên từ trình duyệt
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("[cron] Triggering workflow-scheduler...");
    const response = await fetch(WORKFLOW_SCHEDULER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    console.log("[cron] workflow-scheduler response:", JSON.stringify(data).slice(0, 400));

    return res.status(200).json({
      success: true,
      message: "Workflow scheduler triggered",
      result: data,
    });
  } catch (error: any) {
    console.error("[cron] Error triggering workflow scheduler:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
