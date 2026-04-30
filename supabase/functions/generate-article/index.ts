// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Vui lòng cung cấp chủ đề bài viết." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')

    if (!deepseekKey) {
      console.error("[generate-article] Missing DEEPSEEK_API_KEY")
      return new Response(JSON.stringify({ error: "Thiếu DEEPSEEK_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log("[generate-article] Sending request to DeepSeek for prompt:", prompt)

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          {
            role: 'system',
            content: `Bạn là chuyên gia Content SEO du lịch Huế và copywriter khách sạn cao cấp. Bài viết của bạn phải khiến người đọc không thể rời mắt.

═══ YÊU CẦU ĐẦU RA ═══
- Trả về ĐÚNG JSON object với các key: title, excerpt, content, category
- "content" là HTML thuần (không markdown, không <code>, không <pre>)
- Độ dài: 900-1200 từ
- KHÔNG thêm text nào ngoài JSON
- TUYỆT ĐỐI chỉ trả về JSON, không có markdown code block

═══ CẤU TRÚC HTML ═══
- MỞ ĐẦU: 1 thẻ <p> hấp dẫn, gây tò mò
- Mỗi phần dùng <h2 style="...">...</h2>
- Mỗi <h3 style="...">...</h3>
- Mỗi <p style="...">...</p>
- Mỗi <ul> với <li>...</li>
- KHÔNG dùng <br/> để tạo khoảng cách
- TUYỆT ĐỐI KHÔNG thêm link hay URL

═══ KỸ THUẬT VIẾT LÔI CUỐN ═══
MỞ BÀI (100-150 từ): Bắt đầu bằng câu hỏi tu từ, sự thật thú vị, hoặc khung cảnh sống động. KHÔNG mở bài bằng "Huế là..." hay "Chào mừng...". 

THÂN BÀI (4-6 phần <h2>): Mỗi phần là một "câu chuyện nhỏ" — có bối cảnh, chi tiết cụ thể, giá trị thực. Dùng SỐ LIỆU, TÊN RIÊNG, ĐỊA CHỈ, GIÁ CẢ, MẸO CÁ NHÂN.

KẾT BÀI (80-120 từ): Tổng kết tự nhiên, gợi mở hành động. Có thể liên hệ nhẹ đến Imperial Hue (1 câu).
GIỌNG ĐIỆU: Như một người bạn Huế sành sỏi thì thầm bí mật — ấm áp, tinh tế, thỉnh thoảng hài hước.

═══ CHẤT LƯỢNG NỘI DUNG ═══
- MỌI THÔNG TIN phải THẬT và CỤ THỂ. Không placeholder.
- Nhắc Imperial Hue tối đa 2 lần, thật tự nhiên.

═══ SEO ═══
- Từ khóa chính trong: title, excerpt, mở bài, 1-2 thẻ <h2>, kết bài
- Title: 50-65 ký tự, gây tò mò, chứa từ khóa chính
- Excerpt: 140-170 ký tự, tóm lược giá trị, chứa từ khóa chính
- Category: MỘT trong [Ẩm thực, Di tích, Lịch trình, Văn hóa, Kinh nghiệm, Du lịch]`
          },
          {
            role: 'user',
            content: `Hãy viết một bài blog du lịch Huế THẬT CHI TIẾT, HẤP DẪN và HỮU ÍCH cho người đọc với chủ đề sau:\n\n${prompt}\n\nĐộ dài: 900-1200 từ. Ngôn ngữ: Tiếng Việt. TUYỆT ĐỐI CHỈ TRẢ VỀ JSON.`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[generate-article] DeepSeek error:", data)
      return new Response(JSON.stringify({ error: data?.error?.message || "Lỗi khi gọi AI" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const rawContent = data.choices?.[0]?.message?.content || "{}"
    let result: any = null

    // ─── Safe JSON parsing ────────────────────────────────
    try {
      result = JSON.parse(rawContent)
    } catch (parseError) {
      console.warn("[generate-article] Initial JSON parse failed, trying cleanup", { error: parseError.message })
      let cleaned = rawContent.trim()
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7)
      if (cleaned.startsWith("```")) cleaned = cleaned.slice(3)
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3)

      try {
        result = JSON.parse(cleaned)
      } catch (secondError) {
        console.error("[generate-article] Failed to parse AI JSON after cleanup", { error: secondError.message })
        return new Response(
          JSON.stringify({ error: "AI trả về JSON không hợp lệ. Vui lòng thử lại." }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (!result || (!result.title && !result.content)) {
      console.error("[generate-article] Parsed result is missing required fields", { result })
      return new Response(
        JSON.stringify({ error: "AI trả về dữ liệu không đầy đủ." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("[generate-article] Successfully generated article:", { title: result.title, category: result.category })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("[generate-article] Unexpected error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})