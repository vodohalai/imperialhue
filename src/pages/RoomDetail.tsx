import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BedDouble, ShieldCheck, Sparkles, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import StyledSelect from "@/components/StyledSelect";
import StyledDatePicker from "@/components/StyledDatePicker";
import { getRoomBySlug } from "@/data/rooms";
import { useLanguage } from "@/i18n/LanguageContext";

const RoomDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const room = getRoomBySlug(slug);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [activeImage, setActiveImage] = useState(0);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);

  const guestOptions = [1, 2, 3, 4].map((n) => ({
    value: String(n),
    label: `${n} ${t("search.guestUnit")}`,
  }));

  if (!room) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <SiteHeader />
        <div className="m-6 mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">{t("detail.notFound")}</h1>
          <Link to="/rooms" className="mt-4 inline-flex rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
            {t("detail.backToList")}
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
            {t("detail.backToList")}
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[2rem]">
                <img src={room.images[activeImage]} alt={t(room.nameKey)} className="h-[420px] w-full object-cover" />
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
                    <img src={image} alt={`${t(room.nameKey)} ${index + 1}`} className="h-20 w-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">{t("detail.description")}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t(room.longDescKey)}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <Users className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">{t("detail.maxGuests")} {room.capacity} {t("rooms.guest")}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <BedDouble className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">{t(room.bedKey)}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <Sparkles className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">{room.size}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] p-3">
                    <ShieldCheck className="h-5 w-5 text-[#0D9488]" />
                    <span className="text-sm font-medium text-slate-700">{t("detail.support247")}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-slate-900">{t("detail.amenities")}</h2>
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
                <h2 className="text-xl font-black text-slate-900">{t("detail.policy")}</h2>
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
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("detail.priceFrom")}</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{room.price.toLocaleString("vi-VN")} VND {t("rooms.perNight")}</p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.checkIn")}</p>
                    <div className="mt-2">
                      <StyledDatePicker value={checkIn} onChange={setCheckIn} min={today} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.checkOut")}</p>
                    <div className="mt-2">
                      <StyledDatePicker value={checkOut} onChange={setCheckOut} min={checkIn} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.guests")}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-[#0D9488]" />
                      <StyledSelect
                        value={String(guests)}
                        onChange={(v) => setGuests(Number(v))}
                        options={guestOptions}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#0D9488] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">{t("detail.totalEst")}</p>
                  <p className="mt-1 text-xl font-black">{total.toLocaleString("vi-VN")} VND</p>
                  <p className="text-xs text-white/80">{t("detail.forNights")} {nights} {t("detail.nights")} · {guests} {t("rooms.guest")}</p>
                </div>

                <button onClick={handleBook} className="mt-5 w-full rounded-full bg-[#f97316] px-5 py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#ea6a0f]">
                  {t("nav.bookNow")}
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