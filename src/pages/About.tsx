import { Heart, Landmark, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { useLanguage } from "@/i18n/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const values = [
    { icon: Heart, titleKey: "about.value1" as const, descKey: "about.value1Desc" as const },
    { icon: Landmark, titleKey: "about.value2" as const, descKey: "about.value2Desc" as const },
    { icon: Sparkles, titleKey: "about.value3" as const, descKey: "about.value3Desc" as const },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("about.label")}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{t("about.title")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("about.desc")}</p>
          </div>

          {/* Story + Image */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                alt="The Imperial Hue"
                className="h-full min-h-[280px] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-center rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">{t("about.storyTitle")}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{t("about.storyDesc")}</p>
            </div>
          </div>

          {/* Mission */}
          <div className="rounded-[2rem] bg-[#0D9488] p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{t("about.missionTitle")}</p>
            <h2 className="mt-2 text-2xl font-black">{t("about.missionTitle")}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/90">{t("about.missionDesc")}</p>
          </div>

          {/* Values */}
          <div>
            <h2 className="mb-4 text-2xl font-black text-slate-900">{t("about.valuesTitle")}</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.titleKey} className="rounded-[1.75rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{t(v.titleKey)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{t(v.descKey)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default About;