import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT_MAX = 20
const rateLimitState = new Map<string, { count: number; resetAt: number }>()

const getClientIp = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("X-Forwarded-For")
  if (forwarded) return forwarded.split(",")[0].trim()
  const cf = req.headers.get("cf-connecting-ip") || req.headers.get("CF-Connecting-IP")
  if (cf) return cf.trim()
  return "unknown"
}

const isRateLimited = (key: string) => {
  const now = Date.now()
  const existing = rateLimitState.get(key)
  if (!existing || now >= existing.resetAt) {
    rateLimitState.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  if (existing.count >= RATE_LIMIT_MAX) return true
  existing.count += 1
  return false
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const bodyText = await req.text()
    if (bodyText.length > 50_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const parsed = JSON.parse(bodyText || "{}")
    const behaviorsRaw = Array.isArray(parsed.behaviors) ? parsed.behaviors : []
    const behaviors = behaviorsRaw.slice(-50)
    const current_page = typeof parsed.current_page === "string" ? parsed.current_page : ""
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Sử dụng GPT-4o cho độ chính xác cao nhất về tâm lý học hành vi
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia phân tích tâm lý khách hàng ngành khách sạn. Dựa trên lịch sử hành vi (views, price hovers, scroll depth), hãy trả về 1 số từ 0-100 đại diện cho Intent Score (ý định mua) và 1 câu đề xuất ưu đãi phù hợp.'
          },
          {
            role: 'user',
            content: `Dữ liệu hành vi: ${JSON.stringify(behaviors)}. Trang hiện tại: ${current_page}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "OpenAI request failed" }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!data?.choices?.[0]?.message?.content) {
      return new Response(JSON.stringify({ error: "Invalid OpenAI response" }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[analyze-intent] Error:", error?.message || error)
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
