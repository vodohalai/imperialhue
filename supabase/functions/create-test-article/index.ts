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
    const { supabase } = await import('../shared/supabase-client.ts')
    
    const articleData = {
      slug: 'danh-muc-hue',
      title: 'Khám phá danh mục Huế',
      content: '<p>The Imperial Hue mang đến trải nghiệm du lịch độc đáo với những điểm đến hấp dẫn và văn hóa đặc sắc của cố đô.</p><p>Hãy cùng khám phá những địa điểm thú vị quanh khách sạn:</p><ul><li>Đại Nội Huế - Di sản văn hóa thế giới</li><li>Sông Hương thơ mộng</li><li>Ẩm thực cung đình đậm đà</li></ul>',
      excerpt: 'Khám phá những điểm đến hấp dẫn và văn hóa đặc sắc của cố đô Huế.',
      status: 'published',
      category: 'Du lịch',
      published_at: new Date().toISOString(),
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    }

    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single()

    if (error) {
      console.error("[create-test-article] Error:", error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log("[create-test-article] Article created:", data)
    return new Response(JSON.stringify({ success: true, article: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error("[create-test-article] Critical error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})