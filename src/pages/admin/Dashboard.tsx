import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, LayoutDashboard, LogOut, Edit, Trash2, Menu, X, Bot } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import type { Article } from "@/integrations/supabase/types";

const AdminDashboard = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      showSuccess("Đã xóa bài viết");
      setArticles(articles.filter((a) => a.id !== id));
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-[#ece6dd] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#0D9488] rounded-xl flex items-center justify-center text-white font-bold text-sm">I</div>
          <span className="font-black text-slate-900 text-sm">ADMIN PANEL</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-slate-100">
          {sidebarOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`bg-white border-r border-[#ece6dd] flex flex-col fixed lg:sticky top-0 lg:top-0 left-0 z-50 h-full w-72 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-8 lg:mb-10">
            <div className="h-10 w-10 bg-[#0D9488] rounded-xl flex items-center justify-center text-white font-bold">I</div>
            <span className="font-black text-slate-900 tracking-tight text-sm lg:text-base">ADMIN PANEL</span>
          </div>
          
          <nav className="space-y-2">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0D9488]/10 text-[#0D9488] font-bold text-sm">
              <LayoutDashboard className="h-5 w-5" />
              Tổng quan
            </Link>
            <Link to="/admin/editor" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 font-semibold transition text-sm">
              <Plus className="h-5 w-5" />
              Viết bài mới
            </Link>
            <Link to="/admin/automation" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 font-semibold transition text-sm">
              <Bot className="h-5 w-5" />
              Automation
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-6 lg:p-8">
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-bold hover:opacity-80 text-sm">
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="hidden lg:flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Quản lý bài viết</h1>
            <p className="text-slate-500 mt-1">Tạo và tối ưu nội dung blog để tăng traffic SEO</p>
          </div>
          <Link to="/admin/editor" className="flex items-center gap-2 bg-[#0D9488] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-teal-100 text-sm">
            <Plus className="h-5 w-5" />
            Viết bài mới
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 lg:mb-10">
          <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-[#ece6dd] shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Tổng bài</p>
                <p className="text-lg sm:text-2xl font-black text-slate-900">{articles.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-[#ece6dd] shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-50 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Đã đăng</p>
                <p className="text-lg sm:text-2xl font-black text-green-600">{articles.filter(a => a.status === 'published').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-[#ece6dd] shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-50 text-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Nháp</p>
                <p className="text-lg sm:text-2xl font-black text-orange-600">{articles.filter(a => a.status === 'draft').length}</p>
              </div>
            </div>
          </div>
        </div>

        <Link to="/admin/editor" className="lg:hidden flex items-center justify-center gap-2 mb-6 bg-[#0D9488] text-white px-5 py-3 rounded-full font-bold shadow-lg shadow-teal-100 text-sm">
          <Plus className="h-5 w-5" />
          Viết bài mới
        </Link>

        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-[#ece6dd] overflow-hidden shadow-sm">
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#ece6dd]">
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-bold text-slate-600">Tiêu đề</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-bold text-slate-600">Danh mục</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-bold text-slate-600">Trạng thái</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-bold text-slate-600">Ngày tạo</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm font-bold text-slate-600 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece6dd]">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 text-sm">Đang tải dữ liệu...</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400 text-sm">Chưa có bài viết nào</td></tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/30 transition">
                    <td className="px-4 sm:px-8 py-4 sm:py-5">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-10 w-14 sm:h-12 sm:w-16 bg-slate-100 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                          {article.image_url ? (
                            <img src={article.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">🏞️</div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 line-clamp-1 text-sm sm:text-base">{article.title}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">{article.category}</span>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${article.status === 'published' ? 'bg-green-600' : 'bg-orange-600'}`} />
                        {article.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5 text-xs sm:text-sm text-slate-500 font-medium">
                      {new Date(article.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/editor/${article.id}`)}
                          className="p-2 hover:bg-[#0D9488]/10 text-slate-400 hover:text-[#0D9488] rounded-xl transition"
                        >
                          <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(article.id)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-[#ece6dd]">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Đang tải dữ liệu...</div>
            ) : articles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Chưa có bài viết nào</div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="p-4 hover:bg-slate-50/30 transition">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                      {article.image_url ? (
                        <img src={article.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">🏞️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600">{article.category}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${article.status === 'published' ? 'bg-green-600' : 'bg-orange-600'}`} />
                          {article.status === 'published' ? 'Đã đăng' : 'Nháp'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{new Date(article.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => navigate(`/admin/editor/${article.id}`)}
                        className="p-2 hover:bg-[#0D9488]/10 text-slate-400 hover:text-[#0D9488] rounded-xl transition"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;