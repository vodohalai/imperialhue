// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
}

const WORKFLOW_KEY = "blog_automation"

const buildSlug = (value: string) =>
  value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim() || `bai-viet-${Date.now()}`

const fetchSearchResults = async (apiKey: string, query: string) => {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      topic: "general",
      max_results: 5,
      include_answer: true,
      include_raw_content: false,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.detail || data?.error || "Tavily search failed")
  }

  return data
}

async function searchUnsplash(accessKey: string, query: string): Promise<string | null> {
  try {
    const keywords = query
      ?.replace(/[\u201c\u201d""]/g, "")
      ?.replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s]/g, " ")
      ?.trim()
      || "Hue Vietnam travel"

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=3&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      },
    )

    if (!response.ok) {
      console.error("[automation-run] Unsplash search failed", { status: response.status })
      return null
    }

    const data = await response.json()
    const results = data?.results || []

    if (results.length === 0) {
      console.warn("[automation-run] Unsplash returned no results for query:", keywords)
      return null
    }

    const imageUrl = results[0]?.urls?.regular || null

    if (imageUrl) {
      console.log("[automation-run] Unsplash image found", {
        query: keywords,
        url: imageUrl,
        photographer: results[0]?.user?.name,
      })
    }

    return imageUrl
  } catch (error) {
    console.error("[automation-run] Unsplash search error:", error.message)
    return null
  }
}

async function writeLog(supabaseAdmin, action, status, message, details = null, durationMs = null) {
  try {
    await supabaseAdmin.from("workflow_logs").insert([{
      workflow_key: WORKFLOW_KEY,
      action,
      status,
      message,
      details,
      duration_ms: durationMs,
    }])
  } catch (logError) {
    console.error("[automation-run] Failed to write log:", logError.message)
  }
}

serve(async (req) => {
  const startTime = Date.now()

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const action = body?.action

    console.log("[automation-run] Incoming request", { action })

    if (!action || !["write", "generate-image", "research"].includes(action)) {
      console.error("[automation-run] Invalid action received", { action })
      return new Response(
        JSON.stringify({ success: false, message: "Invalid action. Supported: write, generate-image, research" }),
        { status: 400, headers: jsonHeaders },
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY")
    const openaiKey = Deno.env.get("OPENAI_API_KEY")
    const tavilyKey = Deno.env.get("TAVILY_API_KEY")

    // ─── RESEARCH ────────────────────────────────────────────────
    if (action === "research") {
      const actionStart = Date.now()
      console.log("[automation-run] Starting live research with Tavily")

      if (!deepseekKey) {
        console.error("[automation-run] Missing DEEPSEEK_API_KEY for research")
        await writeLog(supabaseAdmin, "research", "failed", "Thiếu DEEPSEEK_API_KEY", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "Missing DEEPSEEK_API_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (!tavilyKey) {
        console.error("[automation-run] Missing TAVILY_API_KEY for research")
        await writeLog(supabaseAdmin, "research", "failed", "Thiếu TAVILY_API_KEY", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "Missing TAVILY_API_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const trendQueries = [
        "xu hướng du lịch Huế mới nhất 2026",
        "điểm đến mới nổi ở Huế 2026",
        "ẩm thực Huế nổi bật gần đây",
      ]

      const searchPayloads = await Promise.all(
        trendQueries.map((query) => fetchSearchResults(tavilyKey, query)),
      )

      const searchContext = searchPayloads
        .map((payload, index) => {
          const items = (payload.results || []).map((item: any) => ({
            title: item.title,
            url: item.url,
            content: item.content,
          }))

          return {
            query: trendQueries[index],
            answer: payload.answer || "",
            results: items,
          }
        })

      const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deepseekKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            {
              role: "system",
              content:
                'Bạn là chuyên gia SEO du lịch Huế theo thời gian thực. Dựa trên dữ liệu tìm kiếm web mới nhất, hãy tạo đúng JSON object với key "topics" là mảng gồm 2 object.\n\nMỗi object phải có:\n- topic: tiêu đề chủ đề hấp dẫn, rõ ràng (vd: "Khám phá 5 quán bún bò Huế ngon nhất lòng phố cổ")\n- keyword: từ khóa chính SEO (vd: "bún bò Huế ngon")\n- search_intent: một trong "information", "commercial", "transactional", "navigational"\n- category: một trong "Ẩm thực", "Di tích", "Lịch trình", "Văn hóa", "Kinh nghiệm", "Du lịch"\n- priority_score: số 0-100 đánh giá độ ưu tiên dựa trên xu hướng và lượng tìm kiếm\n- research_notes: PHẢI LÀ BẢN TÓM TẮT CHI TIẾT (300-500 từ) bao gồm:\n  + Xu hướng/sự kiện mới nhất liên quan đến chủ đề\n  + 3-5 thông tin/fact cụ thể có thể dùng trong bài (tên địa điểm, món ăn, giá cả, thời gian, mẹo...)\n  + Góc nhìn độc đáo hoặc insight mà bài viết nên khai thác\n  + Đối tượng độc giả phù hợp\n- source_urls: mảng URL nguồn tham khảo thực tế (ít nhất 2 URL)',
            },
            {
              role: "user",
              content: `Dưới đây là dữ liệu nghiên cứu thời gian thực từ Tavily:\n${JSON.stringify(searchContext)}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      })

      const aiData = await aiResponse.json()

      if (!aiResponse.ok) {
        console.error("[automation-run] DeepSeek research failed", { error: aiData })
        await writeLog(supabaseAdmin, "research", "failed", aiData?.error?.message || "DeepSeek research failed", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({
            success: false,
            message: aiData?.error?.message || "DeepSeek research failed",
          }),
          { status: aiResponse.status, headers: jsonHeaders },
        )
      }

      const parsed = JSON.parse(aiData.choices?.[0]?.message?.content || "{}")
      const topics = parsed.topics || []

      console.log("[automation-run] Research result parsed", { topicsCount: topics.length })

      if (!topics.length) {
        console.error("[automation-run] No topics returned from AI")
        await writeLog(supabaseAdmin, "research", "failed", "AI không trả về chủ đề nào", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "AI không trả về chủ đề nào" }),
          { status: 200, headers: jsonHeaders },
        )
      }

      const insertedTopics = []
      const errors = []

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i]
        const { data, error } = await supabaseAdmin
          .from("seo_topics")
          .insert([
            {
              topic: topic.topic,
              keyword: topic.keyword,
              search_intent: topic.search_intent || "information",
              category: topic.category || "Du lịch",
              priority_score: topic.priority_score || 50,
              research_notes: topic.research_notes || "",
              source_urls: topic.source_urls || [],
              researched_at: new Date().toISOString(),
              status: "pending",
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("[automation-run] Error inserting topic", { index: i, message: error.message })
          errors.push(`Topic ${i + 1}: ${error.message}`)
          continue
        }

        insertedTopics.push(data)
      }

      console.log("[automation-run] Research completed", {
        insertedTopics: insertedTopics.length,
        errors: errors.length,
      })

      const durationMs = Date.now() - actionStart
      await writeLog(supabaseAdmin, "research", "success",
        `Đã tìm thấy ${insertedTopics.length} chủ đề mới`,
        { topics: insertedTopics.map((t: any) => ({ id: t.id, topic: t.topic, keyword: t.keyword })), errors: errors.length > 0 ? errors : undefined },
        durationMs
      )

      return new Response(
        JSON.stringify({ success: true, topics: insertedTopics, errors, duration_ms: durationMs }),
        { headers: jsonHeaders },
      )
    }

    // ─── WRITE ───────────────────────────────────────────────────
    if (action === "write") {
      const actionStart = Date.now()

      if (!deepseekKey) {
        console.error("[automation-run] Missing DEEPSEEK_API_KEY for write")
        await writeLog(supabaseAdmin, "write", "failed", "Thiếu DEEPSEEK_API_KEY", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "Missing DEEPSEEK_API_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const { data: topic, error: topicError } = await supabaseAdmin
        .from("seo_topics")
        .select("*")
        .eq("status", "pending")
        .order("researched_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (topicError) {
        console.error("[automation-run] Failed to fetch pending topic", { message: topicError.message })
        await writeLog(supabaseAdmin, "write", "failed", topicError.message, null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: topicError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (!topic) {
        console.error("[automation-run] No pending topic found for write")
        await writeLog(supabaseAdmin, "write", "skipped", "Không còn chủ đề nào đang chờ", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "Không còn chủ đề nào đang chờ." }),
          { headers: jsonHeaders },
        )
      }

      console.log("[automation-run] Writing article for topic", {
        topicId: topic.id,
        topic: topic.topic,
        keyword: topic.keyword,
      })

      const categoryHint = topic.category || "Du lịch"
      const searchIntent = topic.search_intent || "information"

      const prompt = `Hãy viết một bài blog du lịch Huế thật chi tiết và hữu ích.

CHỦ ĐỀ: "${topic.topic}"
TỪ KHÓA CHÍNH: "${topic.keyword}"
NHÓM CHỦ ĐỀ: ${categoryHint}
MỤC ĐÍCH TÌM KIẾM CỦA NGƯỜI DÙNG: ${searchIntent}

═══════════════════════════════
DỮ LIỆU NGHIÊN CỨU THỜI GIAN THỰC (hãy tận dụng tối đa):
${topic.research_notes || "Không có ghi chú nghiên cứu."}
═══════════════════════════════

NGUỒN THAM KHẢO (dùng để lấy số liệu, dẫn chứng cụ thể):
${Array.isArray(topic.source_urls) && topic.source_urls.length > 0 ? topic.source_urls.map((url: string, i: number) => `${i + 1}. ${url}`).join("\n") : "Không có nguồn tham khảo."}

LƯU Ý QUAN TRỌNG:
- Độ dài mục tiêu: 900–1100 từ.
- Ngôn ngữ: Tiếng Việt.`

      const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deepseekKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            {
              role: "system",
              content:
                'Bạn là chuyên gia Content SEO du lịch Huế và copywriter khách sạn cao cấp. Hãy viết bài blog CHẤT LƯỢNG CAO, giàu thông tin thực tế, tự nhiên, dễ đọc và có chiều sâu — dựa trên dữ liệu nghiên cứu thời gian thực được cung cấp.\n\nYÊU CẦU BẮT BUỘC:\n- Trả về ĐÚNG JSON object với 4 trường: title, excerpt, content, category.\n- "content" phải là HTML hoàn chỉnh, sạch, không bọc trong markdown.\n- Bài viết dài KHOẢNG 900 đến 1100 từ.\n- Văn phong chuyên nghiệp, gợi cảm hứng, hữu ích cho người đang lên kế hoạch du lịch Huế.\n- Tối ưu SEO tự nhiên, không nhồi nhét từ khóa. Từ khóa chính nên xuất hiện trong title, mở bài, và 1–2 thẻ <h2>.\n\nCẤU TRÚC BÀI VIẾT:\n+ 1 đoạn MỞ BÀI hấp dẫn (khoảng 80–120 từ) — nêu vấn đề, gợi tò mò, giới thiệu chủ đề.\n+ 4 đến 6 PHẦN NỘI DUNG CHÍNH dùng thẻ <h2>. Mỗi phần đi sâu vào một khía cạnh cụ thể.\n+ Trong mỗi phần có thể dùng <h3> để chia ý nhỏ, <p> cho đoạn văn, <ul><li> cho danh sách.\n+ 1 đoạn KẾT BÀI (khoảng 80–120 từ) — tổng kết nhẹ nhàng, định hướng hành động, có thể liên hệ mềm với Imperial Hue.\n\nYÊU CẦU NỘI DUNG:\n- CỤ THỂ & THỰC TẾ: Đưa tên địa điểm, món ăn, con số, mẹo thực tế. Tránh viết chung chung, mơ hồ.\n- TẬN DỤNG DỮ LIỆU NGHIÊN CỨU: Dữ liệu nghiên cứu thời gian thực là "xương sống" của bài viết. Hãy dùng insight, số liệu, xu hướng từ đó.\n- LIÊN HỆ IMPERIAL HUE: Khi phù hợp, nhắc đến trải nghiệm lưu trú tại Imperial Hue một cách tự nhiên, không quảng cáo lộ liễu (tối đa 1–2 lần trong bài).\n- GIỌNG ĐIỆU: Thân thiện, am hiểu, như một người bạn địa phương chia sẻ bí kíp.\n\nYÊU CẦU KHÁC:\n- excerpt dài khoảng 140 đến 180 ký tự, súc tích và hấp dẫn, chứa từ khóa chính.\n- title hấp dẫn, rõ chủ đề, dài khoảng 50–70 ký tự, phù hợp SEO, chứa từ khóa chính.\n- category phải là MỘT trong: Ẩm thực, Di tích, Lịch trình, Văn hóa, Kinh nghiệm, Du lịch.\n- KHÔNG thêm bất kỳ text nào ngoài JSON.\n- KHÔNG dùng placeholder như "[Tên địa điểm]" — mọi thứ phải là thông tin thật.',
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      })

      const aiData = await aiResponse.json()

      if (!aiResponse.ok) {
        console.error("[automation-run] DeepSeek write failed", { error: aiData })
        await writeLog(supabaseAdmin, "write", "failed", aiData?.error?.message || "DeepSeek write failed", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({
            success: false,
            message: aiData?.error?.message || "DeepSeek write failed",
          }),
          { status: aiResponse.status, headers: jsonHeaders },
        )
      }

      const generated = JSON.parse(aiData.choices?.[0]?.message?.content || "{}")

      if (!generated?.title || !generated?.content) {
        console.error("[automation-run] AI returned incomplete article payload", { generated })
        await writeLog(supabaseAdmin, "write", "failed", "AI không trả về đủ dữ liệu bài viết", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "AI không trả về đủ dữ liệu bài viết." }),
          { headers: jsonHeaders },
        )
      }

      const { data: job, error: insertJobError } = await supabaseAdmin
        .from("ai_content_jobs")
        .insert([
          {
            topic_id: topic.id,
            title: generated.title,
            status: "draft_ai",
          },
        ])
        .select()
        .single()

      if (insertJobError) {
        console.error("[automation-run] Failed to insert ai_content_job", { message: insertJobError.message })
        await writeLog(supabaseAdmin, "write", "failed", insertJobError.message, null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: insertJobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const slug = buildSlug(generated.title)

      const sourceBlock = Array.isArray(topic.source_urls) && topic.source_urls.length > 0
        ? `<h2>Nguồn tham khảo</h2><ul>${topic.source_urls.map((url: string) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></li>`).join("")}</ul>`
        : ""

      const { data: article, error: articleError } = await supabaseAdmin
        .from("articles")
        .insert([
          {
            slug,
            title: generated.title,
            content: `${generated.content}${sourceBlock}`,
            excerpt: generated.excerpt || "",
            category: generated.category || "Du lịch",
            status: "draft",
            image_url: "",
          },
        ])
        .select()
        .single()

      if (articleError) {
        console.error("[automation-run] Failed to insert article", { message: articleError.message })
        await writeLog(supabaseAdmin, "write", "failed", articleError.message, null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: articleError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      console.log("[automation-run] Article created", {
        articleId: article.id,
        slug: article.slug,
        title: article.title,
      })

      const { error: linkError } = await supabaseAdmin
        .from("ai_content_jobs")
        .update({ article_id: article.id })
        .eq("id", job.id)

      if (linkError) {
        console.error("[automation-run] Failed to link job to article", { message: linkError.message })
        await writeLog(supabaseAdmin, "write", "failed", linkError.message, { articleId: article.id, jobId: job.id }, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: linkError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const { error: topicUpdateError } = await supabaseAdmin
        .from("seo_topics")
        .update({ status: "used", updated_at: new Date().toISOString() })
        .eq("id", topic.id)

      if (topicUpdateError) {
        console.error("[automation-run] Failed to mark topic as used", { message: topicUpdateError.message })
        await writeLog(supabaseAdmin, "write", "failed", topicUpdateError.message, { articleId: article.id, topicId: topic.id }, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: topicUpdateError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const durationMs = Date.now() - actionStart
      await writeLog(supabaseAdmin, "write", "success",
        `Đã viết bài "${generated.title}"`,
        { articleId: article.id, slug: article.slug, topicId: topic.id, topic: topic.topic },
        durationMs
      )

      return new Response(
        JSON.stringify({ success: true, job, article, duration_ms: durationMs }),
        { headers: jsonHeaders },
      )
    }

    // ─── GENERATE IMAGE ──────────────────────────────────────────
    if (action === "generate-image") {
      const actionStart = Date.now()
      console.log("[automation-run] Starting generate-image flow")

      const { data: job, error: jobError } = await supabaseAdmin
        .from("ai_content_jobs")
        .select("*")
        .eq("status", "draft_ai")
        .is("image_url", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (jobError) {
        console.error("[automation-run] Failed to fetch image job", { message: jobError.message })
        await writeLog(supabaseAdmin, "generate-image", "failed", jobError.message, null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: jobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (!job) {
        console.error("[automation-run] No draft_ai job without image_url found")
        await writeLog(supabaseAdmin, "generate-image", "skipped", "Không có bài viết nào cần ảnh", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "Không có bài viết nào cần ảnh." }),
          { headers: jsonHeaders },
        )
      }

      console.log("[automation-run] Found job for image generation", {
        jobId: job.id,
        title: job.title,
        articleId: job.article_id,
      })

      const unsplashAccessKey = Deno.env.get("UNSPLASH_ACCESS_KEY")

      if (!openaiKey && !unsplashAccessKey) {
        console.error("[automation-run] Missing both OPENAI_API_KEY and UNSPLASH_ACCESS_KEY for generate-image")
        await writeLog(supabaseAdmin, "generate-image", "failed", "Thiếu cả OPENAI_API_KEY và UNSPLASH_ACCESS_KEY", null, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: "Missing both OPENAI_API_KEY and UNSPLASH_ACCESS_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      let imageUrl: string | null = null
      let imageSource: string = "unknown"

      // ── Try OpenAI first ──────────────────────────────────────
      if (openaiKey) {
        const imagePrompt = job.title
          ? `A beautiful, professional cover photo for a travel blog article titled "${job.title}" about Hue, Vietnam. Cinematic, warm lighting, 16:9, no text.`
          : "Imperial Hue boutique hotel, luxury room, cinematic style"

        console.log("[automation-run] Sending OpenAI image prompt", { imagePrompt })

        const imgResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: imagePrompt,
            size: "1024x1024",
          }),
        })

        const imgData = await imgResponse.json()

        if (!imgResponse.ok) {
          console.error("[automation-run] OpenAI image generation failed, will try Unsplash fallback", { error: imgData?.error?.message })
        } else {
          const imageObject = imgData?.data?.[0]
          const directUrl = imageObject?.url || null
          const base64Image = imageObject?.b64_json || null
          imageUrl = directUrl || (base64Image ? `data:image/png;base64,${base64Image}` : null)

          if (imageUrl) {
            imageSource = "openai"
            console.log("[automation-run] OpenAI image generated successfully", {
              imageUrlType: directUrl ? "url" : "b64_json",
            })
          } else {
            console.warn("[automation-run] OpenAI returned no usable image data, will try Unsplash fallback")
          }
        }
      } else {
        console.log("[automation-run] No OPENAI_API_KEY, skipping OpenAI, will try Unsplash directly")
      }

      // ── Fallback to Unsplash ──────────────────────────────────
      if (!imageUrl && unsplashAccessKey) {
        const searchQuery = job.title
          ? `${job.title} Hue Vietnam travel`
          : "Hue Vietnam travel landscape"

        console.log("[automation-run] Trying Unsplash fallback", { query: searchQuery })
        imageUrl = await searchUnsplash(unsplashAccessKey, searchQuery)

        if (imageUrl) {
          imageSource = "unsplash"
        }
      }

      if (!imageUrl) {
        const failReason = !openaiKey
          ? "Không có OPENAI_API_KEY và Unsplash cũng không tìm thấy ảnh phù hợp"
          : "OpenAI tạo ảnh thất bại và Unsplash cũng không tìm thấy ảnh phù hợp"

        console.error("[automation-run] All image sources exhausted", { failReason })
        await writeLog(supabaseAdmin, "generate-image", "failed", failReason, { jobId: job.id, title: job.title }, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: failReason }),
          { headers: jsonHeaders },
        )
      }

      const { error: updateJobError } = await supabaseAdmin
        .from("ai_content_jobs")
        .update({
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)

      if (updateJobError) {
        console.error("[automation-run] Failed to update ai_content_jobs.image_url", {
          jobId: job.id,
          message: updateJobError.message,
        })
        await writeLog(supabaseAdmin, "generate-image", "failed", updateJobError.message, { jobId: job.id }, Date.now() - actionStart)
        return new Response(
          JSON.stringify({ success: false, message: updateJobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      console.log("[automation-run] Updated ai_content_jobs.image_url", {
        jobId: job.id,
        articleId: job.article_id,
        imageSource,
      })

      if (job.article_id) {
        const { error: updateArticleError } = await supabaseAdmin
          .from("articles")
          .update({
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.article_id)

        if (updateArticleError) {
          console.error("[automation-run] Failed to update articles.image_url", {
            articleId: job.article_id,
            message: updateArticleError.message,
          })
          await writeLog(supabaseAdmin, "generate-image", "failed", updateArticleError.message, { articleId: job.article_id, jobId: job.id }, Date.now() - actionStart)
          return new Response(
            JSON.stringify({ success: false, message: updateArticleError.message }),
            { status: 500, headers: jsonHeaders },
          )
        }
      }

      const durationMs = Date.now() - actionStart
      await writeLog(supabaseAdmin, "generate-image", "success",
        `Đã lấy ảnh cho bài "${job.title || 'không tên'}" (nguồn: ${imageSource})`,
        { jobId: job.id, articleId: job.article_id, imageUrl, imageSource },
        durationMs
      )

      return new Response(
        JSON.stringify({
          success: true,
          image_url: imageUrl,
          article_id: job.article_id,
          image_source: imageSource,
          duration_ms: durationMs,
        }),
        { headers: jsonHeaders },
      )
    }

    // ─── UNSUPPORTED ─────────────────────────────────────────────
    return new Response(
      JSON.stringify({ success: false, message: "Unsupported action" }),
      { status: 400, headers: jsonHeaders },
    )
  } catch (error) {
    const durationMs = Date.now() - startTime
    console.error("[automation-run] Error:", error?.message || error)

    try {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      )
      await writeLog(supabaseAdmin, "unknown", "failed", error?.message || "Unknown server error", { stack: error?.stack }, durationMs)
    } catch (_) {
      // silent - can't log if logging itself fails
    }

    return new Response(
      JSON.stringify({ success: false, message: error?.message || "Unknown server error" }),
      { status: 500, headers: jsonHeaders },
    )
  }
})
