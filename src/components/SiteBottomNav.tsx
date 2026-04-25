import { BedDouble, Home, Images, Phone, Ticket } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { icon: Home, label: "Home", to: "/" },
  { icon: BedDouble, label: "Rooms", to: "/rooms" },
  { icon: Ticket, label: "Offers", to: "/offers" },
  { icon: Images, label: "Gallery", to: "/explore" },
  { icon: Phone, label: "Contact", to: "/contact" },
];

const SiteBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e1d7] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium ${
                isActive ? "text-[#f97316]" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default SiteBottomNav;