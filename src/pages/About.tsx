import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";

const About = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Giới thiệu</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Về The Imperial Hue</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Khách sạn boutique mang tinh thần Huế, kết hợp sự tinh tế hiện đại với trải nghiệm lưu trú ấm áp và thân thiện.
          </p>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default About;