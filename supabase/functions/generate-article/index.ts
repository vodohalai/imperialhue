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
            content: `Bạn là chuyên gia Content SEO du lịch Huế và copywriter khách sạn cao cấp. Hãy viết bài blog CHẤT LƯỢNG CAO, giàu thông tin thực tế, tự nhiên, dễ đọc và có chiều sâu.

YÊU CẦU BẮT BUỘC:
- Trả về ĐÚNG JSON object với 4 trường: title, excerpt, content, category.
- "content" phải là HTML hoàn chỉnh, sạch, không bọc trong markdown.
- Bài viết dài KHOẢNG 900 đến 1100 từ.
- Văn phong chuyên nghiệp, gợi cảm hứng, hữu ích cho người đang lên kế hoạch du lịch Huế.
- Tối ưu SEO tự nhiên, không nhồi nhét từ khóa. Từ khóa chính nên xuất hiện trong title, mở bài, và 1–2 thẻ <h2>.

CẤU TRÚC BÀI VIẾT:
+ 1 đoạn MỞ BÀI hấp dẫn (khoảng 80–120 từ) — nêu vấn đề, gợi tò mò, giới thiệu chủ đề.
+ 4 đến 6 PHẦN NỘI DUNG CHÍNH dùng thẻ <h2>. Mỗi phần đi sâu vào một khía cạnh cụ thể.
+ Trong mỗi phần có thể dùng <h3> để chia ý nhỏ, <p> cho đoạn văn, <ul><li> cho danh sách.
+ 1 đoạn KẾT BÀI (khoảng 80–120 từ) — tổng kết nhẹ nhàng, định hướng hành động.

YÊU CẦU NỘI DUNG:
- CỤ THỂ & THỰC TẾ: Đưa tên địa điểm, món ăn, con số, mẹo thực tế. Tránh viết chung chung, mơ hồ.
- GIỌNG ĐIỆU: Thân thiện, am hiểu, như một người bạn địa phương chia sẻ bí kíp.
- LIÊN HỆ IMPERIAL HUE: Khi phù hợp, nhắc đến trải nghiệm lưu trú tại Imperial Hue một cách tự nhiên, không quảng cáo lộ liễu (tối đa 1–2 lần trong bài).

YÊU CẦU KHÁC:
- excerpt dài khoảng 140 đến 180 ký tự, súc tích và hấp dẫn, chứa từ khóa chính.
- title hấp dẫn, rõ chủ đề, dài khoảng 50–70 ký tự, phù hợp SEO, chứa từ khóa chính.
- category phải là MỘT trong: Ẩm thực, Di tích, Lịch trình, Văn hóa, Kinh nghiệm, Du lịch.
- KHÔNG thêm bất kỳ text nào ngoài JSON.
- KHÔNG dùng placeholder như "[Tên địa điểm]" — mọi thứ phải là thông tin thật.`
          },
          {
            role: 'user',
            content: `Hãy viết một bài blog RẤT CHI TIẾT về chủ đề sau: "${prompt}".

Ngôn ngữ đầu ra: ${lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}.

Hãy đảm bảo:
- Nội dung ĐỦ SÂU để người đọc thực sự có thể tham khảo cho chuyến đi.
- Có ví dụ, gợi ý cụ thể, thông tin giàu giá trị thực tiễn.
- Độ dài mục tiêu khoảng 1000 từ.
- HTML sạch, dễ hiển thị đẹp trên website khách sạn.`
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
