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
            content: `Bạn là chuyên gia Content SEO du lịch Huế và copywriter khách sạn cao cấp. Hãy viết bài blog chất lượng cao, giàu thông tin, tự nhiên, dễ đọc và có chiều sâu.

Yêu cầu bắt buộc:
- Trả về đúng JSON object với 4 trường: title, excerpt, content, category.
- "content" phải là HTML hoàn chỉnh, sạch, không bọc trong markdown.
- Bài viết dài khoảng 900 đến 1100 từ.
- Văn phong chuyên nghiệp, gợi cảm hứng, hữu ích cho người đang lên kế hoạch du lịch Huế.
- Tối ưu SEO tự nhiên, không nhồi nhét từ khóa.
- Có cấu trúc rõ ràng với:
  + 1 đoạn mở bài hấp dẫn
  + 4 đến 6 phần nội dung chính dùng thẻ <h2>
  + trong mỗi phần có thể dùng <h3>, <p>, <ul>, <li> khi phù hợp
  + 1 đoạn kết bài có định hướng hành động nhẹ nhàng
- Nội dung phải cụ thể, thực tế, nhiều chi tiết, tránh viết chung chung.
- Ưu tiên liên hệ mềm với trải nghiệm lưu trú tại Imperial Hue khi phù hợp, nhưng không quảng cáo lộ liễu.
- excerpt dài khoảng 140 đến 180 ký tự, súc tích và hấp dẫn.
- title hấp dẫn, rõ chủ đề, phù hợp SEO.
- category phải là một trong các nhóm phù hợp như: Ẩm thực, Di tích, Lịch trình, Văn hóa, Kinh nghiệm.
- Không thêm bất kỳ text nào ngoài JSON.`
          },
          {
            role: 'user',
            content: `Hãy viết một bài blog rất chi tiết về chủ đề sau: "${prompt}".

Ngôn ngữ đầu ra: ${lang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}.

Hãy đảm bảo:
- Nội dung đủ sâu để người đọc thực sự có thể tham khảo cho chuyến đi.
- Có ví dụ, gợi ý cụ thể, thông tin giàu giá trị.
- Độ dài mục tiêu khoảng 1000 từ.
- HTML dễ hiển thị đẹp trên website khách sạn.`
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