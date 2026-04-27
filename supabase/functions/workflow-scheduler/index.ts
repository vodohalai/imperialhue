// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORKFLOW_KEY = "blog_automation"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check if workflow is paused
    const { data: control } = await supabaseAdmin
      .from('workflow_controls')
      .select('mode')
      .eq('workflow_key', WORKFLOW_KEY)
      .single()

    if (control?.mode === 'paused') {
      console.log("[workflow-scheduler] Workflow is paused. Skipping.")
      return new Response(JSON.stringify({ status: 'skipped', reason: 'paused' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: string[] = []

    // 2. Bước 1: Nghiên cứu SEO - Kiểm tra xem có cần thêm topic mới không
    const { count: topicCount } = await supabaseAdmin
      .from('seo_topics')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (!topicCount || topicCount < 3) {
      // Cần thêm topic mới
      const newTopics = await generateSEOTopics()
      if (newTopics.length > 0) {
        for (const topic of newTopics) {
          await supabaseAdmin.from('seo_topics').insert(topic)
        }
        results.push(`Đã tạo ${newTopics.length} chủ đề SEO mới`)
      }
    }

    // 3. Bước 2: Tự động viết bài nếu có topic pending
    const { data: pendingTopics } = await supabaseAdmin
      .from('seo_topics')
      .select('*')
      .eq('status', 'pending')
      .order('priority_score', { ascending: false })
      .limit(1)

    if (pendingTopics && pendingTopics.length > 0) {
      const topic = pendingTopics[0]
      
      // Tự động viết bài cho topic này
      const article = await writeArticleForTopic(supabaseAdmin, topic)
      if (article) {
        results.push(`Đã viết bài cho chủ đề: ${topic.topic}`)
      }
    }

    // 4. Bước 3: Tự động tạo ảnh cho bài viết chưa có ảnh
    const { data: jobsWithoutImages } = await supabaseAdmin
      .from('ai_content_jobs')
      .select('*')
      .eq('status', 'draft_ai')
      .is('image_url', null)
      .limit(1)

    if (jobsWithoutImages && jobsWithoutImages.length > 0) {
      const job = jobsWithoutImages[0]
      const imageUrl = await generateImageForJob(job)
      if (imageUrl) {
        await supabaseAdmin
          .from('ai_content_jobs')
          .update({ image_url: imageUrl })
          .eq('id', job.id)
        
        if (job.article_id) {
          await supabaseAdmin
            .from('articles')
            .update({ image_url: imageUrl })
            .eq('id', job.article_id)
        }
        results.push(`Đã tạo ảnh cho bài: ${job.title}`)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      actions: results,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[workflow-scheduler] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})

async function generateSEOTopics(): Promise<any[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    console.error("[workflow-scheduler] Missing OPENAI_API_KEY")
    return []
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia SEO du lịch Huế. Hãy tạo 2 chủ đề blog mới về du lịch Huế, mỗi chủ đề có: topic, keyword, search_intent, category (Ẩm thực/Di tích/Lịch trình/Văn hóa/Kinh nghiệm), priority_score (1-100). Trả về JSON array.'
          }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    return content.topics || []
  } catch (error) {
    console.error("[workflow-scheduler] Error generating SEO topics:", error.message)
    return []
  }
}

async function writeArticleForTopic(supabaseAdmin: any, topic: any): Promise<any> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) return null

  try {
    const prompt = `Viết một bài blog du lịch Huế với chủ đề: "${topic.topic}". Từ khóa chính: "${topic.keyword}".`
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia Content SEO du lịch Huế. Viết bài blog HTML đầy đủ title, excerpt, content (HTML) và category.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json()
    const generated = JSON.parse(data.choices[0].message.content)

    // Tạo job
    const { data: job } = await supabaseAdmin
      .from('ai_content_jobs')
      .insert([{
        topic_id: topic.id,
        title: generated.title,
        status: 'draft_ai',
      }])
      .select()
      .single()

    // Tạo slug
    const slug = generated.title
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim() || `bai-viet-${Date.now()}`

    // Tạo article
    const { data: article } = await supabaseAdmin
      .from('articles')
      .insert([{
        slug,
        title: generated.title,
        content: generated.content,
        excerpt: generated.excerpt || '',
        category: generated.category || 'Du lịch',
        status: 'draft',
        image_url: '',
      }])
      .select()
      .single()

    // Cập nhật job với article_id
    await supabaseAdmin
      .from('ai_content_jobs')
      .update({ article_id: article.id })
      .eq('id', job.id)

    // Đánh dấu topic đã used
    await supabaseAdmin
      .from('seo_topics')
      .update({ status: 'used', updated_at: new Date().toISOString() })
      .eq('id', topic.id)

    return article
  } catch (error) {
    console.error("[workflow-scheduler] Error writing article:", error.message)
    return null
  }
}

async function generateImageForJob(job: any): Promise<string | null> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) return null

  try {
    const imagePrompt = job.title
      ? `A beautiful, professional cover photo for a travel blog article titled "${job.title}" about Hue, Vietnam. Cinematic, warm lighting, 16:9, no text.`
      : 'Imperial Hue boutique hotel, luxury room, warm ambiance, Cinematic style'

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
      }),
    })

    const data = await response.json()
    return data.data?.[0]?.url || null
  } catch (error) {
    console.error("[workflow-scheduler] Error generating image:", error.message)
    return null
  }
}