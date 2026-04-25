import { BadgePercent, CalendarDays, Gift, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const offers = [
  { title: "Đặt sớm tiết kiệm", desc: "Giảm giá cho khách đặt trước 14 ngày.", badge: "Hot" },
  { title: "Kỳ nghỉ dài ngày", desc: "Ưu đãi đặc biệt cho lưu trú từ 3 đêm.", badge: "Best value" },
  { title: "Combo bữa sáng", desc: "Tặng bữa sáng cho một số hạng phòng.", badge: "Popular" },
];

const Offers = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Ưu đãi</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Ưu đãi nổi bật tại The Imperial Hue</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Chọn ưu đãi phù hợp để tối ưu chi phí và nâng cấp trải nghiệm lưu trú của bạn.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.title} className="rounded-[1.75rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                  <Gift className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-[#fbfaf7] px-3 py-1 text-xs font-semibold text-slate-600">{offer.badge}</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{offer.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{offer.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#0D9488]">
                <Sparkles className="h-4 w-4" />
                Áp dụng ngay khi đặt phòng
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[2rem] bg-[#0D9488] p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Hành động</p>
              <h2 className="mt-2 text-2xl font-black">Sẵn sàng đặt phòng với ưu đãi tốt nhất</h2>
            </div>
            <Link to="/contact" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0D9488]">
              Đặt phòng ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;