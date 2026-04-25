import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, BedDouble, CalendarDays, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { rooms, formatPrice } from "@/data/rooms";

const nightsBetween = (a: string, b: string) => {
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  return Math.max(1, Math.round((end - start) / 86400000));
};

const Availability = () => {
  const [params] = useSearchParams();
  const checkIn = params.get("checkIn") || new Date().toISOString().slice(0, 10);
  const checkOut = params.get("checkOut") || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const guests = Number(params.get("guests") || 2);

  const nights = nightsBetween(checkIn, checkOut);
  const valid = new Date(checkOut) > new Date(checkIn);

  const available = useMemo(
    () => rooms.filter((r) => r.capacity >= guests),
    [guests],
  );

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Kết quả tìm kiếm</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Phòng trống cho kỳ nghỉ của bạn</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fbfaf7] px-4 py-2">
                <CalendarDays className="h-4 w-4 text-[#0D9488]" />
                {checkIn} → {checkOut} · {nights} đêm
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fbfaf7] px-4 py-2">
                <Users className="h-4 w-4 text-[#0D9488]" />
                {guests} khách
              </span>
            </div>
            {!valid && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                Ngày trả phòng phải sau ngày nhận phòng. Vui lòng chọn lại.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {available.map((room) => {
              const total = room.price * nights;
              return (
                <article key={room.slug} className="overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-white shadow-sm">
                  <div className="relative h-56">
                    <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0D9488] shadow">
                      Còn phòng
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{room.name}</h2>
                        <p className="mt-1 text-xs text-slate-500">{room.size} · {room.bed}</p>
                      </div>
                      <p className="text-sm font-bold text-[#f97316]">{formatPrice(room.price)}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                      <BedDouble className="h-4 w-4 text-[#0D9488]" />
                      Tối đa {room.capacity} khách
                    </div>
                    <div className="mt-4 rounded-2xl bg-[#fbfaf7] p-3 text-sm text-slate-600">
                      Tổng {nights} đêm: <span className="font-bold text-slate-900">{total.toLocaleString("vi-VN")} VND</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Link to={`/rooms/${room.slug}`} className="text-sm font-semibold text-[#0D9488]">
                        Xem chi tiết
                      </Link>
                      <Link
                        to={`/booking/${room.slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-4 py-2 text-sm font-bold text-white"
                      >
                        Đặt phòng
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {available.length === 0 && (
            <div className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-600">Không có phòng phù hợp với số lượng khách. Vui lòng thử lại với cấu hình khác.</p>
            </div>
          )}
        </div>
      </div>

      <SiteBottomNav />
    </div>
  );
};

export default Availability;