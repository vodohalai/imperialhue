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
    const { action } = await req.json()
    if (!action || !['write', 'generate-image', 'research'].includes(action)) {
      throw new Error('Invalid action. Supported: write, generate-image, research')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'research') {
      const openaiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openaiKey) {
        throw new Error('Missing OPENAI_API_KEY')
      }

      console.log("[automation-run] Researching new SEO topics...")

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `Bạn là chuyên gia SEO du lịch Huế. Hãy tạo 2 chủ đề blog mới về du lịch Huế, mỗi chủ đề là một object JSON với các trường: topic (tên chủ đề), keyword (từ khóa chính), search_intent (mục đích tìm kiếm, ví dụ: travel_planning, food_search, information, booking), category (Ẩm thực/Di tích/Lịch trình/Văn hóa/Kinh nghiệm), priority_score (1-100). Trả về object JSON có key "topics" chứa array 2 object.`
            }
          ],
          response_format: { type: 'json_object' },
        }),
      })

      if (!aiResponse.ok) {
        const errData = await aiResponse.json()
        throw new Error(`OpenAI error: ${errData.error?.message || 'Unknown'}`)
      }

      const aiData = await aiResponse.json()
      const parsed = JSON.parse(aiData.choices[0].message.content)
      const topics = parsed.topics || []

      if (!topics.length) {
        throw new Error('AI không trả về chủ đề nào')
      }

      const insertedTopics = []
      const errors: string[] = []
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i]
        const { data, error } = await supabaseAdmin
          .from('seo_topics')
          .insert([{
            topic: topic.topic,
            keyword: topic.keyword,
            search_intent: topic.search_intent || 'information',
            category: topic.category || 'Du lịch',
            priority_score: topic.priority_score || 50,
            status: 'pending',
          }])
          .select()
          .single()

        if (error) {
          console.error(`[automation-run] Error inserting topic ${i}:`, error.message)
          errors.push(`Topic ${i+1}: ${error.message}`)
          continue
        }
        insertedTopics.push(data)
      }

      console.log(`[automation-run] Research completed. Inserted: ${insertedTopics.length} topics, Errors: ${errors.length}`)
      return new Response(JSON.stringify({ success: true, topics: insertedTopics, errors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'write') {
      // Pick a pending SEO topic (oldest first)
      const { data: topic, error: topicError } = await supabaseAdmin
        .from('seo_topics')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (topicError) throw topicError
      if (!topic) {
        return new Response(JSON.stringify({ success: false, message: 'Không còn chủ đề nào đang chờ.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Generate article using OpenAI
      const openaiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openaiKey) {
        throw new Error('Missing OPENAI_API_KEY')
      }

      const prompt = `Viết một bài blog du lịch Huế với chủ đề: "${topic.topic}". Từ khóa chính: "${topic.keyword}".`
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5.4-mini', // Model mới theo yêu cầu
          messages: [
            {
              role: 'system',
              content: 'Bạn là chuyên gia Content SEO du lịch Huế. Viết bài blog HTML đầy đủ title, excerpt, content (HTML) và category.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      })

      if (!aiResponse.ok) {
        const errData = await aiResponse.json()
        throw new Error(`OpenAI error: ${errData.error?.message || 'Unknown'}`)
      }

      const aiData = await aiResponse.json()
      const generated = JSON.parse(aiData.choices[0].message.content)

      // Insert into ai_content_jobs
      const { data: job, error: insertError } = await supabaseAdmin
        .from('ai_content_jobs')
        .insert([{
          topic_id: topic.id,
          title: generated.title,
          status: 'draft_ai',
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Create article record to hold content
      const slug = generated.title
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim() || `bai-viet-${Date.now()}`

      const { data: article, error: articleError } = await supabaseAdmin
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

      if (articleError) throw articleError

      // Update job with article_id
      await supabaseAdmin
        .from('ai_content_jobs')
        .update({ article_id: article.id })
        .eq('id', job.id)

      // Mark topic as used
      await supabaseAdmin
        .from('seo_topics')
        .update({ status: 'used', updated_at: new Date().toISOString() })
        .eq('id', topic.id)

      return new Response(JSON.stringify({ success: true, job, article }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'generate-image') {
      // Find a job without image that needs cover
      const { data: job, error: jobError } = await supabaseAdmin
        .from('ai_content_jobs')
        .select('*')
        .eq('status', 'draft_ai')
        .is('image_url', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (jobError) throw jobError
      if (!job) {
        return new Response(JSON.stringify({ success: false, message: 'Không có bài viết nào cần ảnh.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const openaiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openaiKey) {
        throw new Error('Missing OPENAI_API_KEY')
      }

      // Generate cover image using OpenAI Images API
      const imagePrompt = job.title
        ? `A beautiful, professional cover photo for a travel blog article titled "${job.title}" about Hue, Vietnam. Cinematic, warm lighting, 16:9, no text.`
        : 'Imperial Hue boutique hotel, luxury room, warm ambiance, Cinematic style'

      const imgResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-2',   // Model ảnh theo yêu cầu
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
        }),
      })

      if (!imgResponse.ok) {
        const errData = await imgResponse.json()
        throw new Error(`OpenAI image generation failed: ${errData.error?.message || 'Unknown'}`)
      }

      const imgData = await imgResponse.json()
      const imageUrl = imgData.data?.[0]?.url

      if (!imageUrl) {
        throw new Error('Image generation returned no URL')
      }

      // Update job with the generated image URL
      const { error: updateJobError } = await supabaseAdmin
        .from('ai_content_jobs')
        .update({ image_url: imageUrl })
        .eq('id', job.id)

      if (updateJobError) throw updateJobError

      // If the job has an article, update the article's image as well
      if (job.article_id) {
        await supabaseAdmin
          .from('articles')
          .update({ image_url: imageUrl })
          .eq('id', job.article_id)
      }

      return new Response(JSON.stringify({ success: true, image_url: imageUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error("[automation-run] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})