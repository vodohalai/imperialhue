import { Bot, CalendarClock, FileStack, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Chủ đề SEO",
    value: "Sẵn sàng kết nối",
    desc: "Nơi AI sẽ nghiên cứu các chủ đề về Huế như du lịch, ẩm thực và địa điểm.",
    icon: Target,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    title: "Bài AI chờ duyệt",
    value: "Quy trình bán tự động",
    desc: "Các bài AI tạo ra sẽ được đưa vào hàng chờ để bạn xem lại trước khi đăng.",
    icon: FileStack,
    tone: "bg-teal-50 text-teal-600",
  },
  {
    title: "Lịch đăng 06:00",
    value: "Asia/Ho_Chi_Minh",
    desc: "Những bài đã duyệt sẽ được tự động đăng theo lịch mỗi ngày lúc 06:00 sáng.",
    icon: CalendarClock,
    tone: "bg-sky-50 text-sky-600",
  },
];

const actions = [
  {
    title: "Nghiên cứu chủ đề SEO",
    desc: "AI tìm các chủ đề tiềm năng liên quan Huế để chuẩn bị cho lịch nội dung tiếp theo.",
  },
  {
    title: "Tạo bài và ảnh bằng AI",
    desc: "AI sinh tiêu đề, nội dung, ảnh bìa và lưu vào hệ thống để admin duyệt.",
  },
  {
    title: "Duyệt và lên lịch đăng",
    desc: "Chỉ những bài đã được duyệt mới được đưa vào lịch đăng tự động buổi sáng.",
  },
];

const AdminAutomation = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="border-b border-[#ece6dd] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">Automation</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">AI Blog Automation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Khu quản lý dành riêng cho quy trình nghiên cứu SEO, tạo bài viết và lên lịch đăng tự động cho blog.
            </p>
          </div>
          <div className="hidden rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-bold text-[#0D9488] md:inline-flex">
            Semi-auto mode
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-black text-slate-900">{item.title}</h2>
                <p className="mt-1 text-sm font-bold text-[#0D9488]">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f97316]">Quy trình</p>
                <h2 className="text-xl font-black text-slate-900">Luồng vận hành AI</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {actions.map((action, index) => (
                <div key={action.title} className="flex gap-4 rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{action.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Trạng thái hiện tại</h2>
                  <p className="text-sm text-slate-500">Phần giao diện quản lý đã sẵn sàng để nối với dữ liệu thật.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-dashed border-[#d8e7e4] bg-[#f7fbfa] p-4 text-sm text-slate-600">
                  Chưa có dữ liệu automation được kết nối.
                </div>
                <div className="rounded-2xl border border-dashed border-[#f3dcc8] bg-[#fff8f2] p-4 text-sm text-slate-600">
                  Bước tiếp theo là nối các nút này với Supabase để AI bắt đầu chạy thật.
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#0D9488] p-6 text-white shadow-sm">
              <h2 className="text-xl font-black">Đi tiếp sang bước vận hành</h2>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Sau khi hoàn tất dữ liệu và functions, tab này sẽ trở thành nơi điều khiển toàn bộ hệ thống AI blog.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/admin"
                  className="rounded-full bg-white px-5 py-3 text-center text-sm font-bold text-[#0D9488]"
                >
                  Về tổng quan
                </Link>
                <Link
                  to="/admin/editor"
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white"
                >
                  Viết bài thủ công
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminAutomation;