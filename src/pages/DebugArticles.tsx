import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Article } from "@/integrations/supabase/types";
import { createTestArticle } from "@/utils/create-test-article";

const DebugArticles = () => {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("❌ Error fetching articles:", error);
        return;
      }
      
      setArticles(data || []);
    } catch (err: any) {
      console.error("💥 Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    setCreating(true);
    try {
      await createTestArticle();
      await fetchArticles();
    } catch (err: any) {
      console.error("❌ Error creating test:", err);
      alert("Lỗi khi tạo bài test: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-4">🔧 Debug Articles</h1>
          <p className="text-slate-600">Trang này giúp bạn kiểm tra dữ liệu articles trong database.</p>
        </div>

        <div className="mb-8 flex gap-4">
          <button
            onClick={fetchArticles}
            className="bg-[#0D9488] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0b7a6f]"
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={handleCreateTest}
            disabled={creating}
            className="bg-[#f97316] text-white px-6 py-3 rounded-full font-bold hover:bg-[#ea6a0f] disabled:opacity-50"
          >
            {creating ? "🚀 Creating..." : "📝 Create Test Article"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488] mx-auto"></div>
            <p className="mt-4 text-slate-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-[#ece6dd] p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-4">📊 Tổng quan</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{articles.length}</p>
                  <p className="text-sm text-slate-500">Tổng bài viết</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{articles.filter(a => a.status === 'published').length}</p>
                  <p className="text-sm text-slate-500">Đã xuất bản</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-600">{articles.filter(a => a.status === 'draft').length}</p>
                  <p className="text-sm text-slate-500">Bản nháp</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-[#ece6dd] p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-4">📝 Danh sách bài viết</h2>
              {articles.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Chưa có bài viết nào trong database.</p>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border border-[#ece6dd] rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              article.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {article.status === 'published' ? '✅ Published' : '📝 Draft'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(article.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900">{article.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">Slug: {article.slug}</p>
                          <p className="text-sm text-slate-600">Category: {article.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link 
                            to={`/explore/${article.slug}`}
                            className="px-3 py-1 bg-[#0D9488] text-white text-sm rounded-lg hover:bg-[#0b7a6f]"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugArticles;
