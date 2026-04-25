import { MapPin } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const places: { nameKey: TranslationKey; descKey: TranslationKey; image: string; distance: string }[] = [
  {
    nameKey: "explore.place1",
    descKey: "explore.place1Desc",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
    distance: "1.2 km",
  },
  {
    nameKey: "explore.place2",
    descKey: "explore.place2Desc",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
    distance: "0.8 km",
  },
  {
    nameKey: "explore.place3",
    descKey: "explore.place3Desc",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    distance: "0.5 km",
  },
  {
    nameKey: "explore.place4",
    descKey: "explore.place4Desc",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    distance: "5 km",
  },
  {
    nameKey: "explore.place5",
    descKey: "explore.place5Desc",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
    distance: "7 km",
  },
  {
    nameKey: "explore.place6",
    descKey: "explore.place6Desc",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    distance: "1.5 km",
  },
];

const Explore = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("explore.label")}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{t("explore.pageTitle")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("explore.pageDesc")}</p>
          </div>

          {/* Places grid */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <article key={place.nameKey} className="group overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-52 overflow-hidden">
                  <img src={place.image} alt={t(place.nameKey)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0D9488] shadow">
                    <MapPin className="h-3 w-3" />
                    {place.distance} {t("explore.fromHotel")}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">{t("explore.highlight")}</p>
                  <h2 className="mt-2 text-lg font-bold text-slate-900">{t(place.nameKey)}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t(place.descKey)}</p>
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

export default Explore;