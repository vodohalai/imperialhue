import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Globe,
  Menu,
  MessageCircleMore,
  Search,
  Sparkles,
  Star,
  BedDouble,
  MapPin,
  Waves,
  Users,
  Phone,
  Home,
  Ticket,
  Images,
  HeartHandshake,
  Mail,
  MapPinned,
  Clock3,
  ShieldCheck,
  Wifi,
  UtensilsCrossed,
  CarFront,
} from "lucide-react";
import { Link } from "react-router-dom";

const rooms = [
  {
    name: "Phòng Superior",
    slug: "superior",
    price: "1.200.000 VND / đêm",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    meta: ["2 khách", "22 m²", "1 giường Queen"],
  },
  {
    name: "Phòng Deluxe",
    slug: "deluxe",
    price: "1.500.000 VND / đêm",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    meta: ["2 khách", "28 m²", "1 giường King"],
  },
  {
    name: "Phòng Deluxe Balcony",
    slug: "deluxe-balcony",
    price: "1.700.000 VND / đêm",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    meta: ["2 khách", "30 m²", "1 giường King"],
  },
  {
    name: "Phòng Premier",
    slug: "premier",
    price: "1.900.000 VND / đêm",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    meta: ["2 khách", "32 m²", "1 giường King"],
  },
  {
    name: "Phòng Junior Suite",
    slug: "junior-suite",
    price: "2.300.000 VND / đêm",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    meta: ["2 khách", "40 m²", "1 giường King"],
  },
  {
    name: "Phòng Imperial Suite",
    slug: "imperial-suite",
    price: "3.200.000 VND / đêm",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    meta: ["2 khách", "55 m²", "1 giường King"],
  },
];

const features = [
  { icon: MapPin, title: "Vị trí thuận tiện", desc: "Trung tâm thành phố Huế, gần các điểm tham quan nổi tiếng" },
  { icon: BedDouble, title: "Phòng nghỉ ấm cúng", desc: "Thiết kế hiện đại với nét duyên dáng xứ Huế" },
  { icon: Waves, title: "Trải nghiệm địa phương", desc: "Gợi ý hành trình, ẩm thực và văn hóa đặc sắc của Huế" },
  { icon: HeartHandshake, title: "Dịch vụ tận tâm", desc: "Đội ngũ thân thiện, luôn sẵn sàng đồng hành cùng bạn" },
];

const quickActions = [
  { icon: Search, label: "Tìm phòng" },
  { icon: Ticket, label: "Ưu đãi" },
  { icon: CircleHelp, label: "Hỗ trợ" },
  { icon: Images, label: "Thư viện" },
];

const bottomNav = [
  { icon: Home, label: "Home", active: true, href: "/" },
  { icon: BedDouble, label: "Rooms", href: "/rooms" },
  { icon: Ticket, label: "Offers", href: "/offers" },
  { icon: Images, label: "Gallery", href: "/explore" },
  { icon: Phone, label: "Contact", href: "/contact" },
];

const Index = () => {
  const [guests, setGuests] = useState("2 khách, 1 phòng");
  const guestOptions = useMemo(() => ["1 khách, 1 phòng", "2 khách, 1 phòng", "3 khách, 1 phòng", "4 khách, 2 phòng"], []);

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-[#ece6dd] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#0D9488]/20 bg-[#f2fbfa] text-[#0D9488]">
              <span className="text-lg font-bold">I</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.35em] text-[#0D9488]">THE</p>
              <h1 className="text-lg font-extrabold leading-none text-[#0f766e] sm:text-2xl">IMPERIAL HUE</h1>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-[#f97316]">BOUTIQUE HOTEL</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <a className="text-[#0D9488]" href="#top">Trang chủ</a>
            <a href="#rooms">Phòng nghỉ</a>
            <a href="#amenities">Tiện nghi</a>
            <a href="#offers">Ưu đãi</a>
            <a href="/explore">Khám phá Huế</a>
            <a href="/contact">Liên hệ</a>
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

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
              alt="The Imperial Hue room"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/10 to-[#fbfaf7]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pb-16 lg:pt-24">
            <div className="max-w-3xl rounded-[2rem] bg-white/90 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0D9488]/10 px-4 py-2 text-sm font-semibold text-[#0D9488]">
                <Sparkles className="h-4 w-4" />
                Chào bạn, bạn đang tìm kiếm một kỳ nghỉ như thế nào?
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">The Imperial Hue</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Không gian nghỉ dưỡng tinh tế, ấm cúng và đậm chất Huế, nơi mỗi chi tiết đều được chăm chút để bạn có một kỳ nghỉ thật trọn vẹn.
              </p>

              <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-[#ece6dd] bg-white p-3 shadow-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-[#fbfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nhận phòng</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CalendarDays className="h-4 w-4 text-[#0D9488]" />
                    Chọn ngày
                  </div>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Trả phòng</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CalendarDays className="h-4 w-4 text-[#0D9488]" />
                    Chọn ngày
                  </div>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Khách</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#0D9488]" />
                      {guests}
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="flex-1 rounded-full bg-[#f97316] px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#ea6a0f]">
                  Kiểm tra phòng trống
                </Link>
                <Link to="/rooms" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9e7e5] bg-white px-6 py-4 text-base font-semibold text-[#0D9488]">
                  <Search className="h-4 w-4" />
                  Tìm bằng AI
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {guestOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setGuests(option)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      guests === option ? "bg-[#0D9488] text-white" : "bg-[#f3f7f6] text-slate-600 hover:bg-[#e8f3f1]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="amenities" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-[1.5rem] border border-[#ece6dd] bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="rooms" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Phòng nghỉ</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Không gian lưu trú tinh tế</h3>
            </div>
            <Link to="/rooms" className="hidden text-sm font-semibold text-[#0D9488] sm:inline-flex">
              Xem tất cả
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.name} className="group overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden">
                  <img src={room.image} alt={room.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0D9488] shadow">
                    Xem chi tiết
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-bold text-slate-900">{room.name}</h4>
                    <p className="text-sm font-bold text-[#f97316]">{room.price}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    {room.meta.map((item) => (
                      <span key={item} className="rounded-full bg-[#fbfaf7] px-3 py-1">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <Link to={`/rooms/${room.slug}`} className="text-sm font-semibold text-[#f97316]">
                      Xem chi tiết
                    </Link>
                    <ArrowRight className="h-5 w-5 text-[#f97316]" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="offers" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                  <MessageCircleMore className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">AI Agent</p>
                  <h3 className="text-2xl font-black text-slate-900">Imperial, trợ lý du lịch của bạn</h3>
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] bg-[#f7fbfa] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-900">Chào mừng bạn đến với The Imperial Hue!</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Hãy hỏi tôi về phòng phù hợp, ưu đãi, lịch trình khám phá Huế hoặc hỗ trợ đặt phòng ngay.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button key={action.label} className="flex items-center gap-3 rounded-2xl border border-[#e4eeec] bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                          <Icon className="h-5 w-5" />
                        </span>
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-full border border-[#e4eeec] bg-white px-4 py-3">
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Bạn cần hỗ trợ gì?"
                  />
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D9488] text-white">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#ece6dd] bg-[#0D9488] p-6 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Ưu đãi nổi bật</p>
                  <h3 className="mt-2 text-2xl font-black">Đặt sớm, nhận giá tốt</h3>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                  <Star className="h-7 w-7 text-[#f97316]" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-sm font-semibold">Miễn phí bữa sáng</p>
                  <p className="mt-1 text-sm text-white/80">Áp dụng cho các hạng phòng chọn lọc.</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-sm font-semibold">Ưu đãi dài ngày</p>
                  <p className="mt-1 text-sm text-white/80">Giảm giá hấp dẫn cho kỳ nghỉ từ 3 đêm trở lên.</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/10 p-4">
                  <p className="text-sm font-semibold">Hỗ trợ tận tâm</p>
                  <p className="mt-1 text-sm text-white/80">Đội ngũ luôn sẵn sàng tư vấn lịch trình tại Huế.</p>
                </div>
              </div>

              <Link to="/offers" className="mt-6 block w-full rounded-full bg-white px-5 py-4 text-center text-sm font-bold text-[#0D9488]">
                Khám phá ưu đãi
              </Link>
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                <Images className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">Khám phá Huế</p>
                <h3 className="text-2xl font-black text-slate-900">Gợi ý trải nghiệm quanh khách sạn</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {["Đại Nội Huế", "Sông Hương - Cầu Trường Tiền", "Ẩm thực cung đình và món Huế"].map((item) => (
                <div key={item} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                  <p className="text-sm font-semibold text-slate-500">Điểm đến nổi bật</p>
                  <h4 className="mt-2 text-lg font-bold text-slate-900">{item}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Lý tưởng để kết hợp nghỉ dưỡng, khám phá văn hóa và thưởng thức ẩm thực địa phương.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Liên hệ</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Kết nối với The Imperial Hue</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Gọi ngay hoặc gửi yêu cầu để đội ngũ lễ tân hỗ trợ bạn nhanh nhất.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <MapPinned className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">Địa chỉ</p>
                    <p className="text-sm text-slate-600">8 Hùng Vương, Phú Nhuận, TP. Huế</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <Phone className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">Điện thoại</p>
                    <p className="text-sm text-slate-600">+84 234 382 1234</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-sm text-slate-600">reservations@imperialhue.vn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-[#fbfaf7] p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 text-[#0D9488]" />
                  <div>
                    <p className="font-semibold text-slate-900">Giờ hỗ trợ</p>
                    <p className="text-sm text-slate-600">24/7 cho đặt phòng và tư vấn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Họ và tên" />
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Email" />
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Số điện thoại" />
                <input className="rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Ngày nhận phòng" />
              </div>
              <textarea className="mt-4 min-h-32 w-full rounded-2xl border border-[#e7e0d6] bg-[#fbfaf7] px-4 py-3 text-sm outline-none" placeholder="Nội dung yêu cầu của bạn" />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-full bg-[#0D9488] px-6 py-3 text-sm font-semibold text-white">
                  Gửi yêu cầu
                </button>
                <a href="tel:+842343821234" className="rounded-full border border-[#d9e7e5] px-6 py-3 text-center text-sm font-semibold text-[#0D9488]">
                  Gọi ngay
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ece6dd] bg-white px-4 py-8 text-center text-sm text-slate-500">
        The Imperial Hue Boutique Hotel
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e1d7] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium ${
                  item.active ? "text-[#f97316]" : "text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;