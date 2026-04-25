import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bath, BedDouble, CarFront, Coffee, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteBottomNav from "@/components/SiteBottomNav";

const roomData = {
  superior: {
    name: "Phòng Superior",
    price: "1.200.000 VND / đêm",
    description: "Phòng Superior mang đến không gian nghỉ ngơi ấm cúng, phù hợp cho cặp đôi hoặc khách công tác cần sự tiện nghi và yên tĩnh.",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  deluxe: {
    name: "Phòng Deluxe",
    price: "1.500.000 VND / đêm",
    description: "Phòng Deluxe rộng rãi hơn với thiết kế thanh lịch, thích hợp cho kỳ nghỉ thư giãn tại trung tâm Huế.",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  "deluxe-balcony": {
    name: "Phòng Deluxe Balcony",
    price: "1.700.000 VND / đêm",
    description: "Phòng Deluxe Balcony có ban công riêng, lý tưởng để ngắm nhìn thành phố và tận hưởng không khí Huế.",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  premier: {
    name: "Phòng Premier",
    price: "1.900.000 VND / đêm",
    description: "Phòng Premier mang đến trải nghiệm cao cấp hơn với không gian thoáng đãng và tiện nghi đầy đủ.",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  "junior-suite": {
    name: "Phòng Junior Suite",
    price: "2.300.000 VND / đêm",
    description: "Junior Suite phù hợp cho khách muốn không gian rộng rãi, sang trọng và riêng tư hơn.",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  "imperial-suite": {
    name: "Phòng Imperial Suite",
    price: "3.200.000 VND / đêm",
    description: "Imperial Suite là lựa chọn cao cấp nhất với không gian sang trọng, phù hợp cho kỳ nghỉ đặc biệt.",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

const amenities = [
  { icon: Wifi, label: "Wi-Fi tốc độ cao" },
  { icon: Coffee, label: "Bữa sáng" },
  { icon: Bath, label: "Phòng tắm riêng" },
  { icon: BedDouble, label: "Giường cao cấp" },
  { icon: CarFront, label: "Đỗ xe" },
  { icon: ShieldCheck, label: "An toàn 24/7" },
];

const RoomDetail = () => {
  const { slug } = useParams();
  const room = roomData[slug as keyof typeof roomData];

  if (!room) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <SiteHeader />
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-sm m-6">
          <h1 className="text-2xl font-black text-slate-900">Không tìm thấy phòng</h1>
          <Link to="/rooms" className="mt-4 inline-flex rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
            Quay lại danh sách phòng
          </Link>
        </div>
        <SiteBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/rooms" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0D9488]">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách phòng
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[2rem]">
                <img src={room.images[0]} alt={room.name} className="h-[420px] w-full object-cover" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {room.images.slice(1).map((image) => (
                  <img key={image} src={image} alt={room.name} className="h-56 w-full rounded-[1.5rem] object-cover" />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Chi tiết phòng</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{room.name}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">{room.description}</p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#0D9488]">
                <Sparkles className="h-4 w-4" />
                Giá từ {room.price}
              </div>

              <div className="mt-6 grid gap-3">
                {amenities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] px-4 py-3">
                      <Icon className="h-5 w-5 text-[#0D9488]" />
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-[#0D9488] p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Đặt phòng</p>
                <p className="mt-2 text-lg font-bold">Sẵn sàng giữ phòng cho bạn ngay hôm nay</p>
                <Link to="/contact" className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0D9488]">
                  Đặt phòng ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteBottomNav />
    </div>
  );
};

export default RoomDetail;