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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const action = body?.action

    if (!action || !["write", "generate-image", "research"].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid action. Supported: write, generate-image, research" }),
        { status: 400, headers: jsonHeaders },
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const openaiKey = Deno.env.get("OPENAI_API_KEY")

    if (action === "research") {
      if (!openaiKey) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing OPENAI_API_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      console.log("[automation-run] Researching new SEO topics...")

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                'Bạn là chuyên gia SEO du lịch Huế. Hãy tạo 2 chủ đề blog mới về du lịch Huế, mỗi chủ đề là một object JSON với các trường: topic, keyword, search_intent, category, priority_score. Trả về object JSON có key "topics" chứa array 2 object.',
            },
          ],
          response_format: { type: "json_object" },
        }),
      })

      const aiData = await aiResponse.json()

      if (!aiResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            message: aiData?.error?.message || "OpenAI research failed",
          }),
          { status: aiResponse.status, headers: jsonHeaders },
        )
      }

      const parsed = JSON.parse(aiData.choices?.[0]?.message?.content || "{}")
      const topics = parsed.topics || []

      if (!topics.length) {
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
              status: "pending",
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("[automation-run] Error inserting topic:", error.message)
          errors.push(`Topic ${i + 1}: ${error.message}`)
          continue
        }

        insertedTopics.push(data)
      }

      return new Response(
        JSON.stringify({ success: true, topics: insertedTopics, errors }),
        { headers: jsonHeaders },
      )
    }

    if (action === "write") {
      if (!openaiKey) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing OPENAI_API_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const { data: topic, error: topicError } = await supabaseAdmin
        .from("seo_topics")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (topicError) {
        return new Response(
          JSON.stringify({ success: false, message: topicError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (!topic) {
        return new Response(
          JSON.stringify({ success: false, message: "Không còn chủ đề nào đang chờ." }),
          { headers: jsonHeaders },
        )
      }

      const prompt = `Viết một bài blog du lịch Huế với chủ đề: "${topic.topic}". Từ khóa chính: "${topic.keyword}".`

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                'Bạn là chuyên gia Content SEO du lịch Huế. Trả về JSON object gồm: title, excerpt, content, category. "content" phải là HTML.',
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      })

      const aiData = await aiResponse.json()

      if (!aiResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            message: aiData?.error?.message || "OpenAI write failed",
          }),
          { status: aiResponse.status, headers: jsonHeaders },
        )
      }

      const generated = JSON.parse(aiData.choices?.[0]?.message?.content || "{}")

      if (!generated?.title || !generated?.content) {
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
        return new Response(
          JSON.stringify({ success: false, message: insertJobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const slug =
        generated.title
          ?.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/--+/g, "-")
          .trim() || `bai-viet-${Date.now()}`

      const { data: article, error: articleError } = await supabaseAdmin
        .from("articles")
        .insert([
          {
            slug,
            title: generated.title,
            content: generated.content,
            excerpt: generated.excerpt || "",
            category: generated.category || "Du lịch",
            status: "draft",
            image_url: "",
          },
        ])
        .select()
        .single()

      if (articleError) {
        return new Response(
          JSON.stringify({ success: false, message: articleError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const { error: linkError } = await supabaseAdmin
        .from("ai_content_jobs")
        .update({ article_id: article.id })
        .eq("id", job.id)

      if (linkError) {
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
        return new Response(
          JSON.stringify({ success: false, message: topicUpdateError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      return new Response(
        JSON.stringify({ success: true, job, article }),
        { headers: jsonHeaders },
      )
    }

    if (action === "generate-image") {
      const { data: job, error: jobError } = await supabaseAdmin
        .from("ai_content_jobs")
        .select("*")
        .eq("status", "draft_ai")
        .is("image_url", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (jobError) {
        return new Response(
          JSON.stringify({ success: false, message: jobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (!job) {
        return new Response(
          JSON.stringify({ success: false, message: "Không có bài viết nào cần ảnh." }),
          { headers: jsonHeaders },
        )
      }

      if (!openaiKey) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing OPENAI_API_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const imagePrompt = job.title
        ? `A beautiful, professional cover photo for a travel blog article titled "${job.title}" about Hue, Vietnam. Cinematic, warm lighting, 16:9, no text.`
        : "Imperial Hue boutique hotel, luxury room, warm ambiance, cinematic style"

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
        return new Response(
          JSON.stringify({
            success: false,
            message: imgData?.error?.message || "OpenAI image generation failed",
          }),
          { status: imgResponse.status, headers: jsonHeaders },
        )
      }

      const imageUrl = imgData?.data?.[0]?.url

      if (!imageUrl) {
        return new Response(
          JSON.stringify({ success: false, message: "Image generation returned no URL" }),
          { headers: jsonHeaders },
        )
      }

      const { error: updateJobError } = await supabaseAdmin
        .from("ai_content_jobs")
        .update({ image_url: imageUrl })
        .eq("id", job.id)

      if (updateJobError) {
        return new Response(
          JSON.stringify({ success: false, message: updateJobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (job.article_id) {
        const { error: updateArticleError } = await supabaseAdmin
          .from("articles")
          .update({ image_url: imageUrl })
          .eq("id", job.article_id)

        if (updateArticleError) {
          return new Response(
            JSON.stringify({ success: false, message: updateArticleError.message }),
            { status: 500, headers: jsonHeaders },
          )
        }
      }

      return new Response(
        JSON.stringify({ success: true, image_url: imageUrl }),
        { headers: jsonHeaders },
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: "Unsupported action" }),
      { status: 400, headers: jsonHeaders },
    )
  } catch (error) {
    console.error("[automation-run] Error:", error?.message || error)
    return new Response(
      JSON.stringify({ success: false, message: error?.message || "Unknown server error" }),
      { status: 500, headers: jsonHeaders },
    )
  }
})