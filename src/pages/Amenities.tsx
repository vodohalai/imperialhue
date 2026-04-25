import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { useLanguage } from "@/i18n/LanguageContext";

const Amenities = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("amenities.label")}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{t("amenities.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("amenities.desc")}</p>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Amenities;