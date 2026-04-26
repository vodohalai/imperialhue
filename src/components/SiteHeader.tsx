import { Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const navLinks: { key: TranslationKey; to: string }[] = [
  { key: "nav.home", to: "/" },
  { key: "nav.rooms", to: "/rooms" },
  { key: "nav.amenities", to: "/amenities" },
  { key: "nav.offers", to: "/offers" },
  { key: "nav.explore", to: "/explore" },
  { key: "nav.contact", to: "/contact" },
];

const SiteHeader = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-[#ece6dd] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0D9488]/20 bg-[#f2fbfa] text-[#0D9488] sm:h-12 sm:w-12">
            <span className="text-sm font-bold sm:text-lg">I</span>
          </div>
          <div>
            <p className="text-[9px] font-semibold tracking-[0.3em] text-[#0D9488] sm:text-[11px] sm:tracking-[0.35em]">THE</p>
            <h1 className="text-sm font-extrabold leading-none text-[#0f766e] sm:text-lg lg:text-2xl">IMPERIAL HUE</h1>
            <p className="text-[9px] font-semibold tracking-[0.25em] text-[#f97316] sm:text-[11px] sm:tracking-[0.3em]">BOUTIQUE HOTEL</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className={isActive ? "text-[#0D9488]" : "hover:text-[#0D9488]"}>
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            className="hidden items-center gap-2 rounded-full border border-[#e7e0d6] bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:flex sm:px-4 sm:py-2 sm:text-sm"
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {lang === "vi" ? "VI" : "EN"}
          </button>
          <Link to="/contact" className="rounded-full bg-[#f97316] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#ea6a0f] sm:px-5 sm:py-3 sm:text-sm">
            {t("nav.bookNow")}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;