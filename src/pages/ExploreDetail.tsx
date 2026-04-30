import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Share2, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { supabase } from "@/integrations/supabase/client";
import type { Article } from "@/integrations/supabase/types";

const ExploreDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setArticle(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        console.error("❌ Supabase error:", error);
        setArticle(null);
        setLoading(false);
        return;
      }

      setArticle(data);
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#0D9488]"></div>
          <p className="mt-4 text-slate-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <SiteHeader />
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-[2.5rem] border border-[#ece6dd] bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-black text-slate-900">Không tìm thấy bài viết</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Bài viết bạn đang mở không tồn tại, chưa được xuất bản, hoặc đường dẫn chưa đúng.
            </p>
            <Link
              to="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-6 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại Khám phá Huế
            </Link>
          </div>
        </div>
        <SiteBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/explore"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0D9488] transition hover:-translate-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Khám phá Huế
          </Link>

          <article className="overflow-hidden rounded-[3rem] border border-[#ece6dd] bg-white shadow-sm">
            <div className="relative h-[450px]">
              {article.image_url ? (
                <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-7xl">🏯</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                  <span className="rounded-full bg-[#f97316] px-4 py-1.5">{article.category}</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(article.published_at || "").toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <h1 className="text-4xl font-black leading-tight md:text-5xl">{article.title}</h1>
              </div>
            </div>

            <div className="p-10 md:p-16">
              <div className="mb-10 border-l-4 border-[#0D9488] pl-6 text-xl font-semibold leading-relaxed text-slate-600 italic">
                {article.excerpt}
              </div>

              <div
                className="article-content prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-[#ece6dd] pt-10 md:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0D9488]/10 font-bold text-[#0D9488]">
                    IH
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Đăng bởi</p>
                    <p className="text-base font-black text-slate-900">Imperial Hue Team</p>
                  </div>
                </div>

                <button className="flex items-center gap-2 rounded-full bg-slate-50 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </button>
              </div>
            </div>
          </article>

          <section className="mt-12 rounded-[2.5rem] bg-[#0D9488] p-10 text-center text-white shadow-xl shadow-teal-100">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-yellow-300" />
            <h2 className="text-3xl font-black">Lên kế hoạch cho hành trình của bạn?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Nghỉ dưỡng tại The Imperial Hue để tận hưởng trọn vẹn văn hóa và ẩm thực cố đô với dịch vụ tận tâm nhất.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/rooms"
                className="w-full rounded-full bg-white px-10 py-4 font-black text-[#0D9488] shadow-lg transition hover:scale-105 active:scale-95 sm:w-auto"
              >
                Xem phòng nghỉ
              </Link>
              <Link
                to="/contact"
                className="w-full rounded-full border border-white/20 bg-black/10 px-10 py-4 font-black text-white transition hover:bg-black/20 sm:w-auto"
              >
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