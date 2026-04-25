import { Clock3, Mail, MapPinned, Phone } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Liên hệ</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Kết nối với The Imperial Hue</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gọi ngay hoặc gửi yêu cầu để đội ngũ lễ tân hỗ trợ bạn nhanh nhất.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                <MapPinned className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                <div>
                  <p className="font-semibold text-slate-900">Địa chỉ</p>
                  <p className="text-sm text-slate-600">8 Hùng Vương, Phú Nhuận, TP. Huế</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                <Phone className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                <div>
                  <p className="font-semibold text-slate-900">Điện thoại</p>
                  <p className="text-sm text-slate-600">+84 234 382 1234</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                <Mail className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p className="text-sm text-slate-600">reservations@imperialhue.vn</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                <Clock3 className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                <div>
                  <p className="font-semibold text-slate-900">Giờ hỗ trợ</p>
                  <p className="text-sm text-slate-600">24/7 cho đặt phòng và tư vấn</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Họ và tên" />
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Email" />
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Số điện thoại" />
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Ngày nhận phòng" />
            </div>
            <textarea className="mt-4 min-h-32 w-full rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Nội dung yêu cầu của bạn" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-[#0D9488] px-6 py-3 text-sm font-semibold text-white">
                Gửi yêu cầu
              </button>
              <a href="tel:+842343821234" className="rounded-full border border-[#d9e7e5] px-6 py-3 text-center text-sm font-semibold text-[#0D9488]">
                Gọi ngay
              </a>
            </div>
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Contact;