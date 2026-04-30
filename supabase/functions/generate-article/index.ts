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
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY')

    if (!apiKey) {
      console.error("[generate-article] Error: DEEPSEEK_API_KEY is not defined in Supabase Secrets");
      return new Response(
        JSON.stringify({ error: "Chưa cấu hình DEEPSEEK_API_KEY trong Supabase Secrets." }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("[generate-article] Calling DeepSeek API...", { prompt });

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
            content: `Bạn là chuyên gia Content SEO du lịch Huế và copywriter khách sạn cao cấp với 10 năm kinh nghiệm. Bài viết của bạn phải khiến người đọc KHÔNG THỂ RỜI MẮT.

═══ YÊU CẦU ĐẦU RA ═══
- Trả về ĐÚNG JSON object: { title, excerpt, content, category }
- "content" là HTML thuần (không markdown, không <code>, không <pre>)
- Độ dài: 900–1200 từ
- KHÔNG thêm text nào ngoài JSON

═══ CẤU TRÚC HTML (PHẢI CÓ KHOẢNG CÁCH RÕ RÀNG) ═══
- MỞ ĐẦU: 1 thẻ <p> hấp dẫn, gây tò mò
- Mỗi phần dùng <h2 style="margin-top:2.5rem; margin-bottom:1rem; font-size:1.5rem; font-weight:800; color:#0f172a">...</h2>
- Mỗi <h3 style="margin-top:1.5rem; margin-bottom:0.75rem; font-size:1.15rem; font-weight:700; color:#1e293b">...</h3>
- Mỗi <p style="margin-bottom:1.25rem; font-size:1.05rem; line-height:1.85; color:#475569">...</p>
- Mỗi <ul style="margin-bottom:1.25rem; padding-left:1.5rem"> với <li style="margin-bottom:0.5rem; font-size:1.05rem; line-height:1.75; color:#475569">...</li>
- KHÔNG dùng <br/> để tạo khoảng cách — dùng margin CSS
- TUYỆT ĐỐI KHÔNG thêm link hay URL

═══ KỸ THUẬT VIẾT LÔI CUỐN ═══
MỞ BÀI (100–150 từ): Bắt đầu bằng câu hỏi tu từ, sự thật thú vị, hoặc khung cảnh sống động. KHÔNG mở bài bằng "Huế là..." hay "Chào mừng...". Phải khiến người đọc TÒ MÒ ngay câu đầu.

THÂN BÀI (4–6 phần <h2>): Mỗi phần là một "câu chuyện nhỏ" — có bối cảnh, chi tiết cụ thể, giá trị thực. Dùng SỐ LIỆU, TÊN RIÊNG, ĐỊA CHỈ, GIÁ CẢ, MẸO CÁ NHÂN. Viết như đang kể cho bạn thân.

KẾT BÀI (80–120 từ): Tổng kết tự nhiên, gợi mở hành động. Có thể liên hệ nhẹ đến Imperial Hue (1 câu).

GIỌNG ĐIỆU: Như một người bạn Huế sành sỏi thì thầm bí mật — ấm áp, tinh tế, thỉnh thoảng hài hước. Dùng câu ngắn xen câu dài. Đoạn không quá 4 câu.

═══ CHẤT LƯỢNG NỘI DUNG ═══
- MỌI THÔNG TIN phải THẬT và CỤ THỂ. Viết "quán Bún Bò Huế Bà Tuyết, 47 Nguyễn Công Trứ" chứ không phải "một quán ăn nổi tiếng".
- Nhắc Imperial Hue tối đa 2 lần, thật tự nhiên, như gợi ý chỗ ở tiện lợi.

═══ SEO ═══
- Từ khóa chính trong: title, excerpt, mở bài, 1–2 thẻ <h2>, kết bài
- Title: 50–65 ký tự, gây tò mò, chứa từ khóa chính
- Excerpt: 140–170 ký tự, tóm lược giá trị, chứa từ khóa chính
- Category: MỘT trong [Ẩm thực, Di tích, Lịch trình, Văn hóa, Kinh nghiệm, Du lịch]`
          },
          {
            role: 'user',
            content: `Hãy viết một bài blog RẤT CHI TIẾT cho chủ đề: "${prompt}".

Ngôn ngữ đầu ra: ${lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}.

Yêu cầu:
- Nội dung ĐỦ SÂU để người đọc tham khảo cho chuyến đi thực tế.
- Có ví dụ, gợi ý cụ thể, thông tin giàu giá trị.
- Độ dài: 900–1200 từ.
- TUYỆT ĐỐI KHÔNG chèn link hay URL.`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[generate-article] DeepSeek API returned error:", data.error);
      return new Response(
        JSON.stringify({ error: data.error?.message || "Lỗi từ DeepSeek API" }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("[generate-article] DeepSeek response received successfully");
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
