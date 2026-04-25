import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Calendar, Tag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Article } from "@/integrations/supabase/types";

const Explore = () => {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          {/* Header */}
          <div className="rounded-[2.5rem] border border-[#ece6dd] bg-white p-10 shadow-sm text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("explore.label")}</p>
            <h1 className="mt-4 text-4xl font-black text-slate-900">{t("explore.pageTitle")}</h1>
            <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-slate-600">{t("explore.pageDesc")}</p>
          </div>

          {/* Blog Listing */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-[450px] rounded-[2rem] bg-white border border-[#ece6dd] animate-pulse" />
              ))
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <article key={article.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-[#ece6dd] overflow-hidden shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
                  <Link to={`/explore/\${article.slug}`} className="relative h-60 overflow-hidden">
                    {article.image_url ? (
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-4xl">🏯</div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-[#0D9488] shadow-sm">
                        {article.category}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(article.published_at || "").toLocaleDateString('vi-VN')}
                    </div>
                    
                    <h2 className="text-xl font-black text-slate-900 leading-tight group-hover:text-[#0D9488] transition">
                      <Link to={`/explore/\${article.slug}`}>{article.title}</Link>
                    </h2>
                    
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-6 flex items-center justify-between">
                      <Link to={`/explore/\${article.slug}`} className="text-sm font-bold text-[#f97316] flex items-center gap-2">
                        {t("rooms.viewDetail")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-medium">Chưa có bài viết nào được xuất bản.</div>
            )}
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Explore;