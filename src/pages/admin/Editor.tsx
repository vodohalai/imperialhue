import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Sparkles, Send, Eye, Image as ImageIcon, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import type { Article, ArticleStatus } from "@/integrations/supabase/types";

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  
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
        // Cố gắng lấy message lỗi chi tiết từ response nếu có
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
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#ece6dd] px-8 py-4">
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#ece6dd] font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <Save className="h-4 w-4" />
              Lưu nháp
            </button>
            <button 
              onClick={() => handleSave('published')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D9488] font-bold text-white shadow-lg shadow-teal-100 hover:bg-[#0b7a6f] transition"
            >
              <Send className="h-4 w-4" />
              Đăng ngay
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          <div className="bg-[#f0f9f8] border border-[#d1e9e7] rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-[#0D9488] rounded-xl flex items-center justify-center text-white"><Sparkles /></div>
              <div>
                <h3 className="font-black text-slate-900">AI Writing Assistant</h3>
                <p className="text-sm text-slate-500">Nhập chủ đề và để AI soạn thảo bài viết tối ưu SEO cho bạn</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Ví dụ: Top 10 quán cafe đẹp ở Huế nên ghé thăm..."
                className="flex-1 rounded-2xl border border-[#d1e9e7] bg-white px-5 py-4 text-sm outline-none"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="bg-[#0D9488] text-white px-8 rounded-2xl font-bold flex items-center gap-2 transition hover:opacity-90 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Tạo nội dung
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-[#ece6dd] p-8 space-y-6 shadow-sm">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Tiêu đề bài viết</label>
              <input 
                type="text" 
                className="w-full text-3xl font-black text-slate-900 outline-none placeholder:text-slate-200"
                placeholder="Nhập tiêu đề hấp dẫn..."
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm({ ...form, title, slug: generateSlug(title) });
                }}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Slug (URL)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-xl px-4 py-2 text-sm text-slate-500 font-mono"
                  value={form.slug}
                  readOnly
                />
              </div>
              <div className="w-48">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Danh mục</label>
                <select 
                  className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-xl px-4 py-2 text-sm font-bold"
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
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Mô tả ngắn (Excerpt)</label>
              <textarea 
                className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-2xl px-4 py-3 text-sm outline-none min-h-[100px]"
                placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Nội dung bài viết (HTML/Text)</label>
              <textarea 
                className="w-full bg-[#fbfaf7] border border-[#ece6dd] rounded-2xl px-6 py-6 text-base outline-none min-h-[500px] font-medium leading-relaxed"
                placeholder="Bắt đầu viết nội dung ở đây..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-[#ece6dd] p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#0D9488]" />
              Hình ảnh đại diện
            </h3>
            <div className="aspect-[4/3] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              {form.image_url ? (
                <img src={form.image_url} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <p className="text-xs text-slate-400 font-medium">Chưa có ảnh đại diện</p>
                </>
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
              <Eye className="h-5 w-5 text-[#0D9488]" />
              Xem trước Meta
            </h3>
            <div className="space-y-3">
              <p className="text-xs font-bold text-blue-600 line-clamp-1">{form.title || "Tiêu đề Google"}</p>
              <p className="text-[11px] text-green-700 font-medium">imperialhue.vn/explore/{form.slug || "bai-viet"}</p>
              <p className="text-[11px] text-slate-500 line-clamp-2">{form.excerpt || "Đoạn mô tả ngắn hiển thị trên kết quả tìm kiếm Google..."}</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AdminEditor;