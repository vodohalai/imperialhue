// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import * as postgres from "https://deno.land/x/postgres@v0.19.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DATABASE_URL = Deno.env.get('SUPABASE_DB_URL') ?? ''
const pool = new postgres.Pool(DATABASE_URL, 3, true)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const connection = await pool.connect()
    try {
      // Create seo_topics table
      await connection.queryObject(`
        CREATE TABLE IF NOT EXISTS public.seo_topics (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          topic text NOT NULL,
          keyword text NOT NULL,
          search_intent text,
          category text,
          priority_score integer DEFAULT 0,
          status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'rejected')),
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        )
      `)
      await connection.queryObject(`ALTER TABLE public.seo_topics ENABLE ROW LEVEL SECURITY`)
      await connection.queryObject(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated select on seo_topics') THEN
            CREATE POLICY "Allow authenticated select on seo_topics" ON public.seo_topics FOR SELECT TO authenticated USING (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated insert on seo_topics') THEN
            CREATE POLICY "Allow authenticated insert on seo_topics" ON public.seo_topics FOR INSERT TO authenticated WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update on seo_topics') THEN
            CREATE POLICY "Allow authenticated update on seo_topics" ON public.seo_topics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated delete on seo_topics') THEN
            CREATE POLICY "Allow authenticated delete on seo_topics" ON public.seo_topics FOR DELETE TO authenticated USING (true);
          END IF;
        END $$;
      `)

      // Create ai_content_jobs table
      await connection.queryObject(`
        CREATE TABLE IF NOT EXISTS public.ai_content_jobs (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          topic_id uuid REFERENCES public.seo_topics(id) ON DELETE SET NULL,
          article_id uuid,
          title text,
          image_prompt text,
          image_url text,
          status text NOT NULL DEFAULT 'draft_ai' CHECK (status IN ('draft_ai', 'scheduled', 'published', 'failed')),
          scheduled_for timestamp with time zone,
          published_at timestamp with time zone,
          error_message text,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        )
      `)
      await connection.queryObject(`ALTER TABLE public.ai_content_jobs ENABLE ROW LEVEL SECURITY`)
      await connection.queryObject(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated select on ai_content_jobs') THEN
            CREATE POLICY "Allow authenticated select on ai_content_jobs" ON public.ai_content_jobs FOR SELECT TO authenticated USING (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated insert on ai_content_jobs') THEN
            CREATE POLICY "Allow authenticated insert on ai_content_jobs" ON public.ai_content_jobs FOR INSERT TO authenticated WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update on ai_content_jobs') THEN
            CREATE POLICY "Allow authenticated update on ai_content_jobs" ON public.ai_content_jobs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated delete on ai_content_jobs') THEN
            CREATE POLICY "Allow authenticated delete on ai_content_jobs" ON public.ai_content_jobs FOR DELETE TO authenticated USING (true);
          END IF;
        END $$;
      `)

      // Insert sample data if tables are empty
      const topicCount = await connection.queryObject(`SELECT count(*) FROM public.seo_topics`)
      if (topicCount.rows[0].count === '0') {
        await connection.queryObject(`
          INSERT INTO public.seo_topics (topic, keyword, search_intent, category, priority_score, status) VALUES
          ('Du lịch Huế 3 ngày 2 đêm', 'du lịch Huế 3 ngày', 'travel_planning', 'Lịch trình', 85, 'used'),
          ('Bún bò Huế ngon nhất', 'bún bò Huế ngon', 'food_search', 'Ẩm thực', 92, 'used'),
          ('Đại Nội Huế giá vé', 'vé Đại Nội Huế', 'information', 'Di tích', 78, 'used'),
          ('Khách sạn Huế gần sông Hương', 'khách sạn Huế sông Hương', 'booking', 'Kinh nghiệm', 88, 'pending'),
          ('Lăng Tự Đức đẹp nhất', 'lăng Tự Đức', 'information', 'Di tích', 80, 'pending')
        `)
      }

      const jobCount = await connection.queryObject(`SELECT count(*) FROM public.ai_content_jobs`)
      if (jobCount.rows[0].count === '0') {
        await connection.queryObject(`
          INSERT INTO public.ai_content_jobs (title, status) VALUES
          ('Khám phá bún bò Huế - Tinh hoa ẩm thực cố đô', 'published'),
          ('Lịch trình 3 ngày khám phá Huế trọn vẹn', 'scheduled'),
          ('Kinh nghiệm thăm Đại Nội Huế - Di sản văn hóa', 'draft_ai'),
          ('Top 5 khách sạn view sông Hương đẹp nhất', 'draft_ai')
        `)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[init-automation-tables] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})