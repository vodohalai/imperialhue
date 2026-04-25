import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="max-w-md rounded-[2rem] border border-[#ece6dd] bg-white p-8 text-center shadow-sm">
        <h1 className="text-4xl font-black text-slate-900">404</h1>
        <p className="mt-3 text-sm text-slate-600">{t("notFound.title")}</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
          {t("notFound.goHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;