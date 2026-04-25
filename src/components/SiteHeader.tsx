import { ChevronDown, Globe, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Trang chủ", to: "/" },
  { label: "Phòng nghỉ", to: "/rooms" },
  { label: "Tiện nghi", to: "/amenities" },
  { label: "Ưu đãi", to: "/offers" },
  { label: "Khám phá Huế", to: "/explore" },
  { label: "Liên hệ", to: "/contact" },
];

const SiteHeader = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[#ece6dd] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#0D9488]/20 bg-[#f2fbfa] text-[#0D9488]">
            <span className="text-lg font-bold">I</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.35em] text-[#0D9488]">THE</p>
            <h1 className="text-lg font-extrabold leading-none text-[#0f766e] sm:text-2xl">IMPERIAL HUE</h1>
            <p className="text-[11px] font-semibold tracking-[0.3em] text-[#f97316]">BOUTIQUE HOTEL</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className={isActive ? "text-[#0D9488]" : "hover:text-[#0D9488]"}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-full border border-[#e7e0d6] bg-white px-4 py-2 text-sm font-medium text-slate-600 sm:flex">
            <Globe className="h-4 w-4" />
            VI
            <ChevronDown className="h-4 w-4" />
          </button>
          <Link to="/contact" className="rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#ea6a0f]">
            Đặt phòng ngay
          </Link>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316] text-white lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;