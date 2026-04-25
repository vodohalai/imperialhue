// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

// Declare Deno for the TypeScript compiler
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, lang = 'vi' } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      console.error("[generate-article] Missing OPENAI_API_KEY");
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY. Please set it in Supabase Secrets." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log("[generate-article] Requesting OpenAI for:", prompt)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer \${apiKey}`,
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
            content: `Viết bài blog về: \${prompt}. Ngôn ngữ: \${lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[generate-article] OpenAI Error:", data.error?.message);
      return new Response(JSON.stringify({ error: data.error?.message || "OpenAI API Error" }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("[generate-article] Critical Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})