import {
  ArrowRight,
  CircleHelp,
  MessageCircleMore,
  Search,
  Sparkles,
  Star,
  BedDouble,
  MapPin,
  Waves,
  Phone,
  Ticket,
  Images,
  HeartHandshake,
  Mail,
  MapPinned,
  Clock3,
} from "lucide-react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import HeroSearch from "@/components/HeroSearch";
import { rooms } from "@/data/rooms";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const featureKeys: { icon: typeof MapPin; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: MapPin, titleKey: "feat.location.title", descKey: "feat.location.desc" },
  { icon: BedDouble, titleKey: "feat.rooms.title", descKey: "feat.rooms.desc" },
  { icon: Waves, titleKey: "feat.local.title", descKey: "feat.local.desc" },
  { icon: HeartHandshake, titleKey: "feat.service.title", descKey: "feat.service.desc" },
];

const quickActionKeys: { icon: typeof Search; labelKey: TranslationKey; to: string }[] = [
  { icon: Search, labelKey: "ai.findRoom", to: "/rooms" },
  { icon: Ticket, labelKey: "ai.offers", to: "/offers" },
  { icon: CircleHelp, labelKey: "ai.support", to: "/contact" },
  { icon: Images, labelKey: "ai.gallery", to: "/explore" },
];

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <SiteHeader />

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80" alt="The Imperial Hue room" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/10 to-[#fbfaf7]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pb-16 lg:pt-24">
            <div className="max-w-3xl rounded-[2rem] bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-semibold text-[#0D9488]">
                <Sparkles className="h-4 w-4" />
                {t("hero.greeting")}
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">The Imperial Hue</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {t("hero.desc")}
              </p>

              <div className="mt-6">
                <HeroSearch />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="amenities" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featureKeys.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.titleKey} className="rounded-[1.5rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{t(feature.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t(feature.descKey)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rooms */}
        <section id="rooms" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("rooms.label")}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{t("rooms.title")}</h3>
            </div>
            <Link to="/rooms" className="hidden text-sm font-semibold text-[#0D9488] sm:inline-flex">
              {t("rooms.viewAll")}
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.slug} className="group overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden">
                  <img src={room.images[0]} alt={t(room.nameKey)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0D9488] shadow">
                    {t("rooms.viewDetail")}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-bold text-slate-900">{t(room.nameKey)}</h4>
                    <p className="text-sm font-bold text-[#f97316]">{room.price.toLocaleString("vi-VN")} VND {t("rooms.perNight")}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{room.capacity} {t("rooms.guest")}</span>
                    <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{room.size}</span>
                    <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{t(room.bedKey)}</span>
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
        </section>

        {/* AI Agent + Offers */}
        <section id="offers" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                  <MessageCircleMore className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">{t("ai.label")}</p>
                  <h3 className="text-2xl font-black text-slate-900">{t("ai.title")}</h3>
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] bg-[#f7fbfa] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-900">{t("ai.welcome")}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {t("ai.desc")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {quickActionKeys.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.labelKey} to={action.to} className="flex items-center gap-3 rounded-2xl border border-[#e4eeec] bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                          <Icon className="h-5 w-5" />
                        </span>
                        {t(action.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#ece6dd] bg-[#0D9488] p-6 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{t("offers.highlight")}</p>
                  <h3 className="mt-2 text-2xl font-black">{t("offers.earlyBird")}</h3>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                  <Star className="h-7 w-7 text-[#f97316]" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-sm font-semibold">{t("offers.freeBreakfast")}</p>
                  <p className="mt-1 text-sm text-white/80">{t("offers.freeBreakfastDesc")}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-sm font-semibold">{t("offers.longStay")}</p>
                  <p className="mt-1 text-sm text-white/80">{t("offers.longStayDesc")}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-sm font-semibold">{t("offers.dedicated")}</p>
                  <p className="mt-1 text-sm text-white/80">{t("offers.dedicatedDesc")}</p>
                </div>
              </div>

              <Link to="/offers" className="mt-6 block w-full rounded-full bg-white px-5 py-4 text-center text-sm font-bold text-[#0D9488]">
                {t("offers.discover")}
              </Link>
            </div>
          </div>
        </section>

        {/* Explore */}
        <section id="explore" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                <Images className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">{t("explore.label")}</p>
                <h3 className="text-2xl font-black text-slate-900">{t("explore.title")}</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(["explore.place1", "explore.place2", "explore.place3"] as const).map((key) => (
                <div key={key} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                  <p className="text-sm font-semibold text-slate-500">{t("explore.highlight")}</p>
                  <h4 className="mt-2 text-lg font-bold text-slate-900">{t(key)}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t("explore.placeDesc")}
                  </p>
                </div>
              ))}
            </div>

            <Link to="/explore" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D9488]">
              {t("explore.more")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("contact.label")}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">{t("contact.title")}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t("contact.desc")}
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <MapPinned className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">{t("contact.address")}</p>
                    <p className="text-sm text-slate-600">8 Hùng Vương, Phú Nhuận, TP. Huế</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <Phone className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">{t("contact.phone")}</p>
                    <p className="text-sm text-slate-600">+84 234 382 1234</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">{t("contact.email")}</p>
                    <p className="text-sm text-slate-600">reservations@imperialhue.vn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">{t("contact.hours")}</p>
                    <p className="text-sm text-slate-600">{t("contact.hoursValue")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formName")} />
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formEmail")} />
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formPhone")} />
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formDate")} />
              </div>
              <textarea className="mt-4 min-h-32 w-full rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formMessage")} />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-full bg-[#0D9488] px-6 py-3 text-sm font-semibold text-white">
                  {t("contact.send")}
                </button>
                <a href="tel:+842343821234" className="rounded-full border border-[#d9e7e5] px-6 py-3 text-center text-sm font-semibold text-[#0D9488]">
                  {t("contact.callNow")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ece6dd] bg-white px-4 py-8 text-center text-sm text-slate-500">
        {t("footer.text")}
      </footer>

      <SiteBottomNav />
    </div>
  );
};

export default Index;