import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Article } from "@/integrations/supabase/types";

const AdminPreview = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (error) {
        console.error("❌ Error fetching article:", error);
        setArticle(null);
      } else {
        setArticle(data as Article);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#0D9488]" />
          <p className="mt-4 text-sm text-slate-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
        <div className="w-full max-w-xl rounded-[2.5rem] border border-[#ece6dd] bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Không tìm thấy bài viết</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Bài viết không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            to="/admin"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-6 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <header className="border-b border-[#ece6dd] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/admin"
            className="rounded-full p-2 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <Eye className="h-4 w-4 text-indigo-500" />
            Preview
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-[3rem] border border-[#ece6dd] bg-white shadow-sm">
          <div className="relative h-[350px]">
            {article.image_url ? (
              <img
                src={article.image_url}
                alt={article.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-7xl">
                🏯
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                <span className="rounded-full bg-[#f97316] px-3 py-1">{article.category}</span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(article.published_at || article.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <h1 className="text-3xl font-black leading-tight md:text-4xl">{article.title}</h1>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-8 border-l-4 border-[#0D9488] pl-6 text-lg font-semibold leading-relaxed text-slate-600 italic">
              {article.excerpt}
            </div>

            <div
              className="article-content prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-12 rounded-2xl bg-[#f0fdfa] p-5 text-sm text-[#0D9488]">
              <p className="font-bold">Đây là bản xem trước cho admin</p>
              <p className="mt-2">
                Trạng thái bài viết:{" "}
                <span className="font-bold">
                  {article.status === "published"
                    ? "Đã xuất bản"
                    : article.status === "scheduled"
                    ? "Đã lên lịch"
                    : article.status === "draft"
                    ? "Bản nháp"
                    : article.status}
                </span>
              </p>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default AdminPreview;