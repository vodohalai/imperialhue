import { CalendarClock, FileStack, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import AutomationWorkflow from "@/components/admin/AutomationWorkflow";

const stats = [
  {
    title: "Chủ đề SEO",
    value: "Sẵn sàng kết nối",
    desc: "AI sẽ nghiên cứu các chủ đề về du lịch, ẩm thực, địa điểm và trải nghiệm ở Huế.",
    icon: Target,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    title: "Bài AI chờ duyệt",
    value: "Kiểm soát bởi admin",
    desc: "Mọi bài AI tạo ra sẽ nằm trong hàng chờ để bạn xem lại trước khi lên lịch đăng.",
    icon: FileStack,
    tone: "bg-teal-50 text-teal-600",
  },
  {
    title: "Lịch đăng 06:00",
    value: "Asia/Ho_Chi_Minh",
    desc: "Bài đã duyệt sẽ tự động xuất bản mỗi ngày lúc 06:00 sáng theo giờ Việt Nam.",
    icon: CalendarClock,
    tone: "bg-sky-50 text-sky-600",
  },
];

const AdminAutomation = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="border-b border-[#ece6dd] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">Automation</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">AI Blog Automation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Theo dõi trực quan toàn bộ quy trình từ nghiên cứu SEO, viết bài, tạo ảnh, duyệt nội dung đến đăng bài tự động.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-bold text-[#0D9488]">
            <Sparkles className="h-4 w-4" />
            Semi-auto workflow
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

        <AutomationWorkflow />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f97316]">Cách dùng</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Bạn sẽ thao tác như thế nào?</h2>

            <div className="mt-5 space-y-4">
              {[
                "Bước 1: AI nghiên cứu chủ đề SEO mới liên quan đến Huế.",
                "Bước 2: AI tạo bài viết và ảnh bìa theo chủ đề đã chọn.",
                "Bước 3: Bạn duyệt bài, sau đó hệ thống tự đăng lúc 06:00.",
              ].map((item, index) => (
                <div key={item} className="flex gap-4 rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Trạng thái hiện tại</h2>
              <p className="mt-1 text-sm text-slate-500">Phần workflow đã được hiển thị trực quan để bạn dễ hình dung toàn bộ luồng automation.</p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-dashed border-[#d8e7e4] bg-[#f7fbfa] p-4 text-sm text-slate-600">
                  Các module hiện đang ở chế độ trình bày trực quan, sẵn sàng để nối dữ liệu thật ở bước tiếp theo.
                </div>
                <div className="rounded-2xl border border-dashed border-[#f3dcc8] bg-[#fff8f2] p-4 text-sm text-slate-600">
                  Khi kết nối xong backend, mỗi module sẽ hiển thị số lượng thật, trạng thái thật và thao tác trực tiếp.
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#0D9488] p-6 text-white shadow-sm">
              <h2 className="text-xl font-black">Bước tiếp theo</h2>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Tiếp theo mình có thể nối workflow này với dữ liệu Supabase để bạn bắt đầu bấm nút nghiên cứu topic, tạo bài AI và lên lịch thật.
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