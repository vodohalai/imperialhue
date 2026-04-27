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

    const openaiKey = Deno.env.get("OPENAI_API_KEY")

    if (action === "research") {
      if (!openaiKey) {
        console.error("[automation-run] Missing OPENAI_API_KEY for research")
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
        console.error("[automation-run] OpenAI research failed", { error: aiData })
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

      console.log("[automation-run] Research result parsed", { topicsCount: topics.length })

      if (!topics.length) {
        console.error("[automation-run] No topics returned from AI")
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

      return new Response(
        JSON.stringify({ success: true, topics: insertedTopics, errors }),
        { headers: jsonHeaders },
      )
    }

    if (action === "write") {
      if (!openaiKey) {
        console.error("[automation-run] Missing OPENAI_API_KEY for write")
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
        console.error("[automation-run] Failed to fetch pending topic", { message: topicError.message })
        return new Response(
          JSON.stringify({ success: false, message: topicError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (!topic) {
        console.error("[automation-run] No pending topic found for write")
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
        console.error("[automation-run] OpenAI write failed", { error: aiData })
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
        console.error("[automation-run] AI returned incomplete article payload", { generated })
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
        console.error("[automation-run] Failed to insert article", { message: articleError.message })
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
        return new Response(
          JSON.stringify({ success: false, message: linkError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      console.log("[automation-run] Linked ai_content_job to article", {
        jobId: job.id,
        articleId: article.id,
      })

      const { error: topicUpdateError } = await supabaseAdmin
        .from("seo_topics")
        .update({ status: "used", updated_at: new Date().toISOString() })
        .eq("id", topic.id)

      if (topicUpdateError) {
        console.error("[automation-run] Failed to mark topic as used", { message: topicUpdateError.message })
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
        return new Response(
          JSON.stringify({ success: false, message: jobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      if (!job) {
        console.error("[automation-run] No draft_ai job without image_url found")
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

      if (!openaiKey) {
        console.error("[automation-run] Missing OPENAI_API_KEY for generate-image")
        return new Response(
          JSON.stringify({ success: false, message: "Missing OPENAI_API_KEY" }),
          { status: 500, headers: jsonHeaders },
        )
      }

      const imagePrompt = job.title
        ? `A beautiful, professional cover photo for a travel blog article titled "${job.title}" about Hue, Vietnam. Cinematic, warm lighting, 16:9, no text.`
        : "Imperial Hue boutique hotel, luxury room, cinematic style"

      console.log("[automation-run] Sending image prompt", { imagePrompt })

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
        console.error("[automation-run] OpenAI image generation failed", { error: imgData })
        return new Response(
          JSON.stringify({
            success: false,
            message: imgData?.error?.message || "OpenAI image generation failed",
          }),
          { status: imgResponse.status, headers: jsonHeaders },
        )
      }

      const imageObject = imgData?.data?.[0]
      const directUrl = imageObject?.url || null
      const base64Image = imageObject?.b64_json || null
      const imageUrl = directUrl || (base64Image ? `data:image/png;base64,${base64Image}` : null)

      console.log("[automation-run] Image generation response received", {
        hasDirectUrl: Boolean(directUrl),
        hasBase64: Boolean(base64Image),
        resolvedImageUrlType: directUrl ? "url" : base64Image ? "data-url" : "none",
      })

      if (!imageUrl) {
        console.error("[automation-run] Image generation returned neither url nor b64_json", { imgData })
        return new Response(
          JSON.stringify({ success: false, message: "Image generation returned no usable image data" }),
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
        return new Response(
          JSON.stringify({ success: false, message: updateJobError.message }),
          { status: 500, headers: jsonHeaders },
        )
      }

      console.log("[automation-run] Updated ai_content_jobs.image_url", {
        jobId: job.id,
        articleId: job.article_id,
        imageUrlType: directUrl ? "url" : "data-url",
      })

      if (job.article_id) {
        console.log("[automation-run] Attempting to update article image_url", {
          articleId: job.article_id,
          imageUrlType: directUrl ? "url" : "data-url",
        })

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
          return new Response(
            JSON.stringify({ success: false, message: updateArticleError.message }),
            { status: 500, headers: jsonHeaders },
          )
        }

        const { data: updatedArticle, error: verifyArticleError } = await supabaseAdmin
          .from("articles")
          .select("id,image_url,updated_at")
          .eq("id", job.article_id)
          .maybeSingle()

        if (verifyArticleError) {
          console.error("[automation-run] Failed to verify updated article", {
            articleId: job.article_id,
            message: verifyArticleError.message,
          })
        } else {
          console.log("[automation-run] Verified article after image update", {
            id: updatedArticle?.id,
            hasImageUrl: Boolean(updatedArticle?.image_url),
            imageUrlPreview: updatedArticle?.image_url?.slice?.(0, 80),
          })
        }
      } else {
        console.error("[automation-run] Job has no article_id, so article image cannot be updated", {
          jobId: job.id,
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          image_url: imageUrl,
          article_id: job.article_id,
          image_source: directUrl ? "url" : "b64_json",
        }),
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