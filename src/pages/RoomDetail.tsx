import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BedDouble, CalendarDays, ShieldCheck, Sparkles, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { getRoomBySlug, formatPrice } from "@/data/rooms";

const RoomDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const room = getRoomBySlug(slug);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [activeImage, setActiveImage] = useState(0);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);

  if (!room) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <SiteHeader />
        <div className="m-6 mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Không tìm thấy phòng</h1>
          <Link to="/rooms" className="mt-4 inline-flex rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
            Quay lại danh sách phòng
          </Link>
        </div>
        <SiteBottomNav />
      </div>
    );
  }

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const total = room.price * nights;

  const handleBook = () => {
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`/booking/${room.slug}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/rooms" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D9488]">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách phòng
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[2rem]">
                <img src={room.images[activeImage]} alt={room.name} className="h-[420px] w-full object-cover" />
              </div>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {room.images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(index)}
                    className={`overflow-hidden rounded-2xl border-2 transition ${
                      index === activeImage ? "border-[#f97316]" : "border-transparent"
                    }`}
                  >
                    <img src={image} alt={`${room.name} ${index + 1}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">Mô tả</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{room.longDescription}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <Users className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">Tối đa {room.capacity} khách</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <BedDouble className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">{room.bed}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <Sparkles className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">{room.size}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <ShieldCheck className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">Tiện nghi</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {room.amenities.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3 text-sm text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">Chính sách</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {room.policy.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Giá từ</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{formatPrice(room.price)}</p>

                <div className="mt-5 space-y-3">
                  <label className="block rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nhận phòng</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarDays className="h-4 w-4 text-[#0D9488]" />
                      <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent outline-none" />
                    </div>
                  </label>
                  <label className="block rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Trả phòng</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarDays className="h-4 w-4 text-[#0D9488]" />
                      <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent outline-none" />
                    </div>
                  </label>
                  <label className="block rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Khách</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Users className="h-4 w-4 text-[#0D9488]" />
                      <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent outline-none">
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} khách</option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>

                <div className="mt-5 rounded-2xl bg-[#0D9488] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Tổng tạm tính</p>
                  <p className="mt-1 text-xl font-black">{total.toLocaleString("vi-VN")} VND</p>
                  <p className="text-xs text-white/80">Cho {nights} đêm · {guests} khách</p>
                </div>

                <button onClick={handleBook} className="mt-5 w-full rounded-full bg-[#f97316] px-5 py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#ea6a0f]">
                  Đặt phòng ngay
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default RoomDetail;