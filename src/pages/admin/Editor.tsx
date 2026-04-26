import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Sparkles, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import type { Article, ArticleStatus } from "@/integrations/supabase/types";
import AdminImageUpload from "@/components/AdminImageUpload";

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
    slug: "",
  });

  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
    if (error) {
      showError(error.message);
      return;
    }
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
        body: { prompt: aiPrompt },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setForm((prev) => ({
          ...prev,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          slug: generateSlug(data.title),
        }));
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
        published_at: status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (id) {
        ({ error } = await supabase.from("articles").update(payload).eq("id", id));
      } else {
        ({ error } = await supabase.from("articles").insert([payload]));
      }

      if (error) throw error;
      showSuccess(status === "published" ? "Đã xuất bản bài viết!" : "Đã lưu bản nháp");
      navigate("/admin");
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <header className="sticky top-0 z-30 border-b border-[#ece6dd] bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="rounded-full p-1.5 transition hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-black text-slate-900">{id ? "Chỉnh sửa" : "Viết bài mới"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave("draft")}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full border border-[#ece6dd] px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Save className="h-3.5 w-3.5" />
              Lưu
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full bg-[#0D9488] px-3 py-2 text-xs font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-[#0b7a6f]"
            >
              <Send className="h-3.5 w-3.5" />
              Đăng
            </button>
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-30 hidden border-b border-[#ece6dd] bg-white/80 px-8 py-4 backdrop-blur-md lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="rounded-full p-2 transition hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-black text-slate-900">{id ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave("draft")}
              disabled={loading}
              className="flex items-center gap-2 rounded-full border border-[#ece6dd] px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Save className="h-4 w-4" />
              Lưu nháp
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-[#0D9488] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-[#0b7a6f]"
            >
              <Send className="h-4 w-4" />
              Đăng ngay
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_350px] lg:gap-8 lg:p-8">
        <div className="space-y-5 lg:space-y-6">
          <div className="rounded-[1.5rem] border border-[#d1e9e7] bg-[#f0f9f8] p-5 lg:rounded-[2.5rem] lg:p-8">
            <div className="mb-3 flex items-center gap-3 lg:mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0D9488] text-white lg:h-10 lg:w-10">
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 lg:text-base">AI Writing Assistant</h3>
                <p className="hidden text-xs text-slate-500 sm:block lg:text-sm">Nhập chủ đề và để AI soạn thảo bài viết</p>
              </div>
            </div>
            <div className="flex gap-2 lg:gap-3">
              <input
                type="text"
                placeholder="Chủ đề bài viết..."
                className="flex-1 rounded-xl border border-[#d1e9e7] bg-white px-4 py-3 text-xs outline-none lg:rounded-2xl lg:text-sm"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="flex items-center gap-2 rounded-xl bg-[#0D9488] px-4 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50 lg:rounded-2xl lg:px-8 lg:text-sm"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin lg:h-5 lg:w-5" /> : <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />}
                <span className="hidden sm:inline">Tạo nội dung</span>
              </button>
            </div>
          </div>

          <div className="space-y-5 rounded-[1.5rem] border border-[#ece6dd] bg-white p-5 shadow-sm lg:space-y-6 lg:rounded-[2.5rem] lg:p-8">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 lg:mb-2 lg:text-sm">Tiêu đề bài viết</label>
              <input
                type="text"
                className="w-full text-lg font-black text-slate-900 outline-none placeholder:text-slate-200 lg:text-3xl"
                placeholder="Nhập tiêu đề hấp dẫn..."
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm({ ...form, title, slug: generateSlug(title) });
                }}
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 lg:mb-2 lg:text-sm">Slug (URL)</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[#ece6dd] bg-[#fbfaf7] px-3 py-2 text-xs font-mono text-slate-500 lg:text-sm"
                  value={form.slug}
                  readOnly
                />
              </div>
              <div className="w-full lg:w-48">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 lg:mb-2 lg:text-sm">Danh mục</label>
                <select
                  className="w-full rounded-xl border border-[#ece6dd] bg-[#fbfaf7] px-3 py-2 text-xs font-bold lg:text-sm"
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
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 lg:mb-2 lg:text-sm">Mô tả ngắn (Excerpt)</label>
              <textarea
                className="min-h-[80px] w-full rounded-xl border border-[#ece6dd] bg-[#fbfaf7] px-3 py-2 text-xs outline-none lg:min-h-[100px] lg:rounded-2xl lg:px-4 lg:py-3 lg:text-sm"
                placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 lg:mb-2 lg:text-sm">Nội dung bài viết (HTML/Text)</label>
              <textarea
                className="min-h-[300px] w-full rounded-xl border border-[#ece6dd] bg-[#fbfaf7] px-4 py-4 text-sm font-medium leading-relaxed outline-none lg:min-h-[500px] lg:rounded-2xl lg:px-6 lg:py-6 lg:text-base"
                placeholder="Bắt đầu viết nội dung ở đây..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900">
              <ImageIcon className="h-5 w-5 text-[#0D9488]" />
              Hình ảnh đại diện
            </h3>

            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">URL ảnh</label>
            <input
              type="text"
              className="mb-4 w-full rounded-2xl border border-[#ece6dd] bg-[#fbfaf7] px-4 py-3 text-sm outline-none"
              placeholder="https://example.com/image.jpg"
              value={form.image_url || ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />

            <div className="mb-4 h-px bg-[#ece6dd]" />

            <AdminImageUpload value={form.image_url || ""} onChange={(url) => setForm({ ...form, image_url: url })} />
          </div>

          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900">
              <ImageIcon className="h-5 w-5 text-[#0D9488]" />
              Xem trước Meta
            </h3>
            <div className="space-y-3">
              <p className="line-clamp-1 text-xs font-bold text-blue-600">{form.title || "Tiêu đề Google"}</p>
              <p className="text-[11px] font-medium text-green-700">imperialhue.vn/explore/{form.slug || "bai-viet"}</p>
              <p className="line-clamp-2 text-[11px] text-slate-500">{form.excerpt || "Đoạn mô tả ngắn hiển thị trên kết quả tìm kiếm Google..."}</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AdminEditor;