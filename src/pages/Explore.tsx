import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Calendar, RefreshCcw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Article } from "@/integrations/supabase/types";

const fetchArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, image_url, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Article[];
};

const Explore = () => {
  const { t } = useLanguage();
  const {
    data: articles = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["published-articles"],
    queryFn: fetchArticles,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const showSkeleton = isLoading && articles.length === 0;

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-[2.5rem] border border-[#ece6dd] bg-white p-8 text-center shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("explore.label")}</p>
            <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">{t("explore.pageTitle")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{t("explore.pageDesc")}</p>
            {isFetching && articles.length > 0 && (
              <p className="mt-3 text-xs font-medium text-slate-400">Đang cập nhật bài viết...</p>
            )}
          </div>

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
              <p className="font-bold">Không thể tải bài viết</p>
              <p className="mt-1 text-sm">{(error as Error)?.message || "Đã xảy ra lỗi không xác định."}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
              >
                <RefreshCcw className="h-4 w-4" />
                Thử lại
              </button>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showSkeleton ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[2rem] border border-[#ece6dd] bg-white shadow-sm">
                  <div className="h-56 animate-pulse bg-slate-200" />
                  <div className="space-y-4 p-6">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-6 w-4/5 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              ))
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-[#ece6dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link to={`/explore/${article.slug}`} className="relative h-56 overflow-hidden">
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

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {article.published_at ? new Date(article.published_at).toLocaleDateString("vi-VN") : ""}
                    </div>

                    <h2 className="text-xl font-black leading-tight text-slate-900 transition group-hover:text-[#0D9488]">
                      <Link to={`/explore/${article.slug}`}>{article.title}</Link>
                    </h2>

                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-500">{article.excerpt}</p>

                    <div className="mt-auto pt-6">
                      <Link
                        to={`/explore/${article.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#f97316]"
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