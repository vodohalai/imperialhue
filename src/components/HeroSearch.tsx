import { useState } from "react";
import { CalendarDays, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSearch = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`/availability?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 rounded-[1.5rem] border border-[#ece6dd] bg-white p-3 shadow-sm sm:grid-cols-3">
        <label className="rounded-2xl bg-[#fbfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.checkIn")}</p>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarDays className="h-4 w-4 text-[#0D9488]" />
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent outline-none" />
          </div>
        </label>
        <label className="rounded-2xl bg-[#fbfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.checkOut")}</p>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarDays className="h-4 w-4 text-[#0D9488]" />
            <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent outline-none" />
          </div>
        </label>
        <label className="rounded-2xl bg-[#fbfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t("search.guests")}</p>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4 text-[#0D9488]" />
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent outline-none">
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} {t("search.guestUnit")}</option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="flex-1 rounded-full bg-[#f97316] px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#ea6a0f]">
          {t("search.checkAvail")}
        </button>
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9e7e5] bg-white px-6 py-4 text-base font-semibold text-[#0D9488]"
        >
          <Search className="h-4 w-4" />
          {t("search.aiSearch")}
        </button>
      </div>
    </form>
  );
};

export default HeroSearch;