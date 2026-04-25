import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { getRoomBySlug } from "@/data/rooms";
import { useLanguage } from "@/i18n/LanguageContext";
import { showSuccess } from "@/utils/toast";

const Booking = () => {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { t } = useLanguage();
  const room = getRoomBySlug(slug);

  const [checkIn, setCheckIn] = useState(params.get("checkIn") || new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(params.get("checkOut") || new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [guests, setGuests] = useState(Number(params.get("guests") || 2));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  if (!room) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <SiteHeader />
        <div className="m-6 mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">{t("detail.notFound")}</h1>
          <Link to="/rooms" className="mt-4 inline-flex rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
            {t("booking.viewRooms")}
          </Link>
        </div>
        <SiteBottomNav />
      </div>
    );
  }

  const nights = Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  const total = room.price * nights;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    showSuccess(t("booking.successMsg"));
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link to={`/rooms/${room.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D9488]">
            <ArrowLeft className="h-4 w-4" />
            {t("booking.backToDetail")}
          </Link>

          {done ? (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0D9488] text-white">
                <Check className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-black text-slate-900">{t("booking.thankYou")}, {name || "Guest"}!</h1>
              <p className="mt-2 text-sm text-slate-600">
                {t(room.nameKey)} ({checkIn} → {checkOut}) {t("booking.confirmDesc")}
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link to="/" className="rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
                  {t("booking.goHome")}
                </Link>
                <Link to="/rooms" className="rounded-full border border-[#d9e7e5] px-5 py-3 text-sm font-semibold text-[#0D9488]">
                  {t("booking.viewMore")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("booking.label")}</p>
                <h1 className="mt-2 text-2xl font-black text-slate-900">{t("booking.title")}</h1>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.checkIn")}</p>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-semibold outline-none" />
                  </label>
                  <label className="rounded-2xl bg-[#fbfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.checkOut")}</p>
                    <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="mt-2 w-full bg-transparent text-sm font-semibold outline-none" />
                  </label>
                  <label className="rounded-2xl bg-[#fbfaf7] p-4 md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.guests")}</p>
                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-2 w-full bg-transparent text-sm font-semibold outline-none">
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n} {t("search.guestUnit")}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("booking.name")} />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("booking.email")} />
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none md:col-span-2" placeholder={t("booking.phone")} />
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-28 rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none md:col-span-2" placeholder={t("booking.notes")} />
                </div>

                <button type="submit" className="mt-6 w-full rounded-full bg-[#f97316] px-6 py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#ea6a0f]">
                  {t("booking.confirm")}
                </button>
              </form>

              <aside className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
                <img src={room.images[0]} alt={t(room.nameKey)} className="h-44 w-full rounded-2xl object-cover" />
                <h2 className="mt-4 text-xl font-bold text-slate-900">{t(room.nameKey)}</h2>
                <p className="text-sm text-slate-500">{room.size} · {t(room.bedKey)}</p>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#0D9488]" />
                      {t("booking.nightLabel")}
                    </span>
                    <span className="font-semibold text-slate-900">{nights}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#0D9488]" />
                      {t("booking.guestLabel")}
                    </span>
                    <span className="font-semibold text-slate-900">{guests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("booking.pricePerNight")}</span>
                    <span className="font-semibold text-slate-900">{room.price.toLocaleString("vi-VN")} VND</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#0D9488] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">{t("detail.totalEst")}</p>
                  <p className="mt-1 text-2xl font-black">{total.toLocaleString("vi-VN")} VND</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Booking;