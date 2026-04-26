import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Sparkles, Send, Image as ImageIcon, Loader2, Menu, X } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import type { Article, ArticleStatus } from "@/integrations/supabase/types";

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [form, setForm] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    status: "draft",
    category: "Du lịch",
    slug: ""
  });

  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
    if (data) setForm(data);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return showError("Vui lòng nhập chủ đề cho AI");
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { prompt: aiPrompt }
      });
      
      if (error) {
        const errorDetails = error.message;
        console.error("Edge Function Error:", error);
        throw new Error(errorDetails);
      }
      
      if (data) {
        setForm({
          ...form,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          slug: generateSlug(data.title)
        });
        showSuccess("AI đã tạo nội dung xong!");
      }
    } catch (err: any) {
      showError(err.message || "Không thể kết nối với dịch vụ AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (status: ArticleStatus) => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      let error;
      if (id) {
        ({ error } = await supabase.from("articles").update(payload).eq("id", id));
      } else {
        ({ error } = await supabase.from("articles").insert([payload]));
      }

      if (error) throw error;
      showSuccess(status === 'published' ? "Đã xuất bản bài viết!" : "Đã lưu bản nháp");
      navigate("/admin");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#ece6dd] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-1.5 hover:bg-slate-100 rounded-full transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-black text-slate-900 text-sm">{id ? "Chỉnh sửa" : "Viết bài mới"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#ece6dd] font-bold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Lưu
            </button>
            <button 
              onClick={() => handleSave('published')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0D9488] font-bold text-white shadow-lg shadow-teal-100 hover:bg-[#0b7a6f] transition text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Đăng
            </button>
          </div>
        </div>
      </header>

      {/* Desktop header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#ece6dd] px-8 py-4 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="p-2 hover:bg-slate-100 rounded-full transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-black text-slate-900 text-xl">{id ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#ece6dd] font-bold text-slate-600 hover:bg-slate-50 transition text-sm"
            >
              <Save className="h-4 w-4" />
              Lưu nháp
            </button>
            <button 
              onClick={() => handleSave('published')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D9488] font-bold text-white shadow-lg shadow-teal-100 hover:bg-[#0b7a6f] transition text-sm"
            >
              <Send className="h-4 w-4" />
              Đăng ngay
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 lg:gap-8">
        <div className="space-y-5 lg:space-y-6">
          {/* AI Assistant - simplified on mobile */}
          <div className="bg-[#f0f9f8] border border-[#d1e9e7] rounded-[1.5rem] lg:rounded-[2.5rem] p-5 lg:p-8">
            <div className="flex items-center gap-3 mb-3 lg:mb-4">
              <div className="h-8 w-8 lg:h-10 lg:w-10 bg-[#0D9488] rounded-xl flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm lg:text-base">AI Writing Assistant</h3>
                <p className="text-xs lg:text-sm text-slate-500 hidden sm:block">Nhập chủ đề và để AI soạn thảo bài viết</p>
              </div>
            </div>
            <div className="flex gap-2 lg:gap-3">
              <input 
                type="text" 
                placeholder="Chủ đề bài viết..."
                className="flex-1 rounded-xl lg:rounded-2xl border border-[#d1e9e7] bg-white px-4 py-3 text-xs lg:text-sm outline-none"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="bg-[#0D9488] text-white px-4 lg:px-8 rounded-xl lg:rounded-2xl font-bold flex items-center gap-2 transition hover:opacity-90 disabled:opacity-50 text-xs lg:text-sm"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" /> : <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />}
                <span className="hidden sm:inline">Tạo nội dung</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-[#ece6dd] p-5 lg:p-8 space-y-5 lg:space-y-6 shadow-sm">
            <div>
              <label className="block text-xs lg:text-sm font-bold text-slate-500 mb-1.5 lg:mb-2 uppercase tracking-wider">Tiêu đề bài viết</label>
              <input 
                type="text" 
                className="w-full text-lg lg:text-3xl font-black text-slate-900 outline-none placeholder:text-slate-200"
                placeholder="Nhập tiêu đề hấp dẫn..."
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm({ ...form, title, slug: generateSlug(title) });
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <div className="flex-1">
                <label className="block text-xs lg:text-sm font-bold text-slate-500 mb-1.5 lg:mb-2 uppercase tracking-wider">Slug (URL)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-xl px-3 py-2 text-xs lg:text-sm text-slate-500 font-mono"
                  value={form.slug}
                  readOnly
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-xs lg:text-sm font-bold text-slate-500 mb-1.5 lg:mb-2 uppercase tracking-wider">Danh mục</label>
                <select 
                  className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-xl px-3 py-2 text-xs lg:text-sm font-bold"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Ẩm thực</option>
                  <option>Di tích</option>
                  <option>Lịch trình</option>
                  <option>Văn hóa</option>
                  <option>Kinh nghiệm</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-bold text-slate-500 mb-1.5 lg:mb-2 uppercase tracking-wider">Mô tả ngắn (Excerpt)</label>
              <textarea 
                className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-xl lg:rounded-2xl px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm outline-none min-h-[80px] lg:min-h-[100px]"
                placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-bold text-slate-500 mb-1.5 lg:mb-2 uppercase tracking-wider">Nội dung bài viết (HTML/Text)</label>
              <textarea 
                className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-xl lg:rounded-2xl px-4 lg:px-6 py-4 lg:py-6 text-sm lg:text-base outline-none min-h-[300px] lg:min-h-[500px] font-medium leading-relaxed"
                placeholder="Bắt đầu viết nội dung ở đây..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-[2rem] border border-[#ece6dd] p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#0D9488]" />
              Hình ảnh đại diện
            </h3>
            <div className="aspect-[4/3] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              {form.image_url ? (
                <img src={form.image_url} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <p className="text-xs text-slate-400 font-medium">Chưa có ảnh đại diện</p>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Dán URL ảnh vào đây..."
              className="w-full mt-4 bg-[#fbfaf7] border border-[#ece6dd] rounded-xl px-4 py-2 text-xs outline-none"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>

          <div className="bg-white rounded-[2rem] border border-[#ece6dd] p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#0D9488]" />
              Xem trước Meta
            </h3>
            <div className="space-y-3">
              <p className="text-xs font-bold text-blue-600 line-clamp-1">{form.title || "Tiêu đề Google"}</p>
              <p className="text-[11px] text-green-700 font-medium">imperialhue.vn/explore/{form.slug || "bai-viet"}</p>
              <p className="text-[11px] text-slate-500 line-clamp-2">{form.excerpt || "Đoạn mô tả ngắn hiển thị trên kết quả tìm kiếm Google..."}</p>
            </div>
          </div>
        </aside>

        {/* Mobile floating sidebar toggle */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="h-12 w-12 rounded-full bg-[#0D9488] text-white shadow-xl flex items-center justify-center"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {showSidebar && (
          <>
            <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setShowSidebar(false)} />
            <div className="fixed bottom-20 right-4 z-40 w-72 space-y-4 lg:hidden">
              <div className="bg-white rounded-2xl border border-[#ece6dd] p-5 shadow-2xl">
                <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-[#0D9488]" />
                  Hình ảnh đại diện
                </h3>
                <div className="aspect-[4/3] rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {form.image_url ? (
                    <img src={form.image_url} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <p className="text-xs text-slate-400">Chưa có ảnh</p>
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="URL ảnh..."
                  className="w-full mt-3 bg-[#fbfaf7] border border-[#ece6dd] rounded-xl px-3 py-2 text-xs outline-none"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>
              <div className="bg-white rounded-2xl border border-[#ece6dd] p-5 shadow-2xl">
                <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-[#0D9488]" />
                  Xem trước Meta
                </h3>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-blue-600 line-clamp-1">{form.title || "Tiêu đề Google"}</p>
                  <p className="text-[11px] text-green-700 font-medium">imperialhue.vn/explore/{form.slug || "bai-viet"}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{form.excerpt || "Đoạn mô tả ngắn..."}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminEditor;