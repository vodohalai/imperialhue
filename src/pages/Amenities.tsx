import { Car, Coffee, Headphones, MapPinned, Plane, Shirt, Wifi, Wine } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const amenities: { icon: typeof Wifi; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Wifi, titleKey: "amenities.wifi", descKey: "amenities.wifiDesc" },
  { icon: Coffee, titleKey: "amenities.breakfast", descKey: "amenities.breakfastDesc" },
  { icon: Headphones, titleKey: "amenities.reception", descKey: "amenities.receptionDesc" },
  { icon: Car, titleKey: "amenities.parking", descKey: "amenities.parkingDesc" },
  { icon: Shirt, titleKey: "amenities.laundry", descKey: "amenities.laundryDesc" },
  { icon: Plane, titleKey: "amenities.transfer", descKey: "amenities.transferDesc" },
  { icon: MapPinned, titleKey: "amenities.tour", descKey: "amenities.tourDesc" },
  { icon: Wine, titleKey: "amenities.minibar", descKey: "amenities.minibarDesc" },
];

const Amenities = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("amenities.label")}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{t("amenities.title")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("amenities.desc")}</p>
          </div>

          {/* Amenities grid */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {amenities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titleKey} className="rounded-[1.75rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{t(item.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t(item.descKey)}</p>
                </div>
              );
            })}
          </div>

          {/* Image banner */}
          <div className="overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80"
              alt="Hotel amenities"
              className="h-64 w-full object-cover sm:h-80"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Amenities;