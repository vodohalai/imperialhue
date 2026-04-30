import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { behaviors, current_page } = await req.json()
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY')

    console.log("[analyze-intent] Analyzing behaviors for page:", current_page)

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
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
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("[analyze-intent] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
