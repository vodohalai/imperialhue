import { Clock3, Mail, MapPinned, Phone } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";
import { useLanguage } from "@/i18n/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 pb-20 sm:px-6 sm:pb-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{t("contact.label")}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">{t("contact.title")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t("contact.desc")}</p>

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

          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formName")} />
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formEmail")} />
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formPhone")} />
              <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formDate")} />
            </div>
            <textarea className="mt-4 min-h-32 w-full rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder={t("contact.formMessage")} />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-[#0D9488] px-6 py-3 text-sm font-semibold text-white">{t("contact.send")}</button>
              <a href="tel:+842343821234" className="rounded-full border border-[#d9e7e5] px-6 py-3 text-center text-sm font-semibold text-[#0D9488]">{t("contact.callNow")}</a>
            </div>
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default Contact;