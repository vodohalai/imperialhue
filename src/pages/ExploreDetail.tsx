import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, Share2, Clock, MapPin, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Article } from "@/integrations/supabase/types";

const ExploreDetail = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    setArticle(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">Đang tải...</div>;
  if (!article) return <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">Không tìm thấy bài viết</div>;

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/explore" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0D9488] hover:translate-x-[-4px] transition">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Khám phá Huế
          </Link>

          <article className="bg-white rounded-[3rem] border border-[#ece6dd] overflow-hidden shadow-sm">
            {/* Featured Image */}
            <div className="relative h-[450px]">
              {article.image_url ? (
                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-7xl">🏯</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest mb-4">
                  <span className="px-4 py-1.5 bg-[#f97316] rounded-full">{article.category}</span>
                  <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(article.published_at || "").toLocaleDateString('vi-VN')}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight">{article.title}</h1>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-10 md:p-16">
              {/* Excerpt/Intro */}
              <div className="text-xl font-semibold text-slate-600 leading-relaxed italic mb-10 border-l-4 border-[#0D9488] pl-6">
                {article.excerpt}
              </div>

              {/* Main Text Content */}
              <div 
                className="prose prose-slate max-w-none 
                prose-h2:text-2xl prose-h2:font-black prose-h2:text-slate-900 prose-h2:mt-10 prose-h2:mb-5
                prose-p:text-slate-600 prose-p:leading-8 prose-p:text-lg prose-p:mb-6
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                prose-li:text-slate-600 prose-li:mb-2"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Author & Tags */}
              <div className="mt-16 pt-10 border-t border-[#ece6dd] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-[#0D9488] font-bold">IH</div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đăng bởi</p>
                    <p className="text-base font-black text-slate-900">Imperial Hue Team</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition">
                    <Share2 className="h-4 w-4" /> Chia sẻ
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* CTA Section */}
          <section className="mt-12 rounded-[2.5rem] bg-[#0D9488] p-10 text-white text-center shadow-xl shadow-teal-100">
            <Sparkles className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-black">Lên kế hoạch cho hành trình của bạn?</h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">Nghỉ dưỡng tại The Imperial Hue để tận hưởng trọn vẹn văn hóa và ẩm thực cố đô với dịch vụ tận tâm nhất.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/rooms" className="w-full sm:w-auto px-10 py-4 bg-white text-[#0D9488] font-black rounded-full shadow-lg transition hover:scale-105 active:scale-95">
                Xem phòng nghỉ
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-10 py-4 bg-black/10 border border-white/20 text-white font-black rounded-full hover:bg-black/20 transition">
                Liên hệ ngay
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteBottomNav />
    </div>
  );
};

export default ExploreDetail;