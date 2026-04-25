import { useMemo, useState } from "react";
import { ArrowRight, Filter, Search, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import StyledSelect from "@/components/StyledSelect";
import { rooms } from "@/data/rooms";
import { useLanguage } from "@/i18n/LanguageContext";

const Rooms = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState("all");
  const [sort, setSort] = useState("featured");

  const capacityOptions = [
    { value: "all", label: t("rooms.allCapacity") },
    { value: "2", label: `2 ${t("rooms.guest")}` },
  ];

  const sortOptions = [
    { value: "featured", label: t("rooms.sortFeatured") },
    { value: "price-asc", label: t("rooms.sortPriceAsc") },
    { value: "price-desc", label: t("rooms.sortPriceDesc") },
  ];

  const filteredRooms = useMemo(() => {
    const result = rooms.filter((room) => {
      const matchesQuery =
        room.name.toLowerCase().includes(query.toLowerCase()) ||
        t(room.nameKey).toLowerCase().includes(query.toLowerCase());
      const matchesCapacity = capacity === "all" || room.capacity.toString() === capacity;
      return matchesQuery && matchesCapacity;
    });

    if (sort === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [query, capacity, sort, t]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("rooms.label")}</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{t("rooms.allTitle")}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t("rooms.allDesc")}
              </p>
            </div>
            <Link to="/availability" className="rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
              {t("search.checkAvail")}
            </Link>
          </div>

          <div className="mb-6 grid gap-3 rounded-[1.5rem] border border-[#ece6dd] bg-white p-4 shadow-sm md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-[#0D9488]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={t("rooms.searchName")} />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] px-4 py-3">
              <Users className="h-4 w-4 shrink-0 text-[#0D9488]" />
              <StyledSelect
                value={capacity}
                onChange={setCapacity}
                options={capacityOptions}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] px-4 py-3">
              <Filter className="h-4 w-4 shrink-0 text-[#0D9488]" />
              <StyledSelect
                value={sort}
                onChange={setSort}
                options={sortOptions}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((room) => (
              <article key={room.slug} className="overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-white shadow-sm">
                <div className="relative h-64">
                  <img src={room.images[0]} alt={t(room.nameKey)} className="h-full w-full object-cover" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0D9488] shadow">
                    <Star className="mr-1 inline h-3 w-3" />
                    {t("rooms.aiSuggest")}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900">{t(room.nameKey)}</h2>
                    <p className="text-sm font-bold text-[#f97316]">{room.price.toLocaleString("vi-VN")} VND</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{room.size}</span>
                    <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{t(room.bedKey)}</span>
                    <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{room.capacity} {t("rooms.guest")}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <Link to={`/rooms/${room.slug}`} className="text-sm font-semibold text-[#f97316]">
                      {t("rooms.viewDetail")}
                    </Link>
                    <ArrowRight className="h-5 w-5 text-[#f97316]" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Rooms;