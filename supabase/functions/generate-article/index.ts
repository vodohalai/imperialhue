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
    const { prompt, lang = 'vi' } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    console.log("[generate-article] Generating content for prompt:", prompt)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer \${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Bạn là một chuyên gia Content SEO và hướng dẫn viên du lịch tại Huế. 
            Nhiệm vụ: Viết một bài blog hấp dẫn, chuẩn SEO. 
            Ngôn ngữ: \${lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}.
            Yêu cầu trả về định dạng JSON gồm: 
            - title: Tiêu đề thu hút (dưới 60 ký tự)
            - excerpt: Đoạn giới thiệu ngắn (dưới 160 ký tự)
            - content: Nội dung chi tiết bài viết (định dạng HTML sạch, chia các thẻ h2, h3, p)
            - category: Phân loại phù hợp (Ẩm thực, Di tích, Lịch trình, Văn hóa)`
          },
          {
            role: 'user',
            content: `Hãy viết bài về chủ đề: \${prompt}`
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
    console.error("[generate-article] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})