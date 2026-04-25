// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  console.log("[generate-article] Received request", { method: req.method });
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, lang = 'vi' } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      console.error("[generate-article] Error: OPENAI_API_KEY is not defined in Supabase Secrets");
      return new Response(
        JSON.stringify({ error: "Chưa cấu hình OPENAI_API_KEY trong Supabase Secrets." }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("[generate-article] Calling OpenAI API...", { prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Bạn là chuyên gia Content SEO du lịch Huế. Trả về JSON: title, excerpt, content (HTML), category.`
          },
          {
            role: 'user',
            content: `Viết bài blog về: ${prompt}. Ngôn ngữ: ${lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[generate-article] OpenAI API returned error:", data.error);
      return new Response(
        JSON.stringify({ error: data.error?.message || "Lỗi từ OpenAI API" }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("[generate-article] OpenAI response received successfully");
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("[generate-article] Critical system error:", error.message)
    return new Response(
      JSON.stringify({ error: `Lỗi hệ thống: ${error.message}` }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})