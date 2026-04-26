import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Article } from "@/integrations/supabase/types";

const fetchArticles = async (): Promise<Article[]> => {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data || [];
};

const Explore = () => {
  const { t } = useLanguage();
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["published-articles"],
    queryFn: fetchArticles,
    staleTime: 5 * 60 * 1000, // 5 phút giữ cache
  });

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="rounded-[2.5rem] border border-[#ece6dd] bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("explore.label")}</p>
            <h1 className="mt-4 text-4xl font-black text-slate-900">{t("explore.pageTitle")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">{t("explore.pageDesc")}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-[450px] animate-pulse rounded-[2rem] border border-[#ece6dd] bg-white" />
              ))
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-[#ece6dd] bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
                >
                  <Link to={`/explore/${article.slug}`} className="relative h-60 overflow-hidden">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-4xl text-slate-300">🏯</div>
                    )}
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-[#0D9488] shadow-sm backdrop-blur">
                        {article.category}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-8">
                    <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(article.published_at || "").toLocaleDateString("vi-VN")}
                    </div>

                    <h2 className="text-xl font-black leading-tight text-slate-900 transition group-hover:text-[#0D9488]">
                      <Link to={`/explore/${article.slug}`}>{article.title}</Link>
                    </h2>

                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-500">{article.excerpt}</p>

                    <div className="mt-auto flex items-center justify-between pt-6">
                      <Link
                        to={`/explore/${article.slug}`}
                        className="flex items-center gap-2 text-sm font-bold text-[#f97316]"
                      >
                        {t("rooms.viewDetail")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full py-20 text-center font-medium text-slate-400">
                Chưa có bài viết nào được xuất bản.
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Explore;