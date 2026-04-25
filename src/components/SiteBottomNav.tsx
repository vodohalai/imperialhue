import { BedDouble, Home, Images, Phone, Ticket } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

const items: { icon: typeof Home; key: TranslationKey; to: string }[] = [
  { icon: Home, key: "bnav.home", to: "/" },
  { icon: BedDouble, key: "bnav.rooms", to: "/rooms" },
  { icon: Ticket, key: "bnav.offers", to: "/offers" },
  { icon: Images, key: "bnav.gallery", to: "/explore" },
  { icon: Phone, key: "bnav.contact", to: "/contact" },
];

const SiteBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e1d7] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium ${
                isActive ? "text-[#f97316]" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default SiteBottomNav;