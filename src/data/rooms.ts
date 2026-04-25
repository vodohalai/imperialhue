import type { TranslationKey } from "@/i18n/translations";

export type Room = {
  slug: string;
  name: string;
  nameKey: TranslationKey;
  shortDescKey: TranslationKey;
  longDescKey: TranslationKey;
  bedKey: TranslationKey;
  price: number;
  capacity: number;
  size: string;
  bed: string;
  shortDescription: string;
  longDescription: string;
  images: string[];
  amenities: TranslationKey[];
  policy: TranslationKey[];
};

export const rooms: Room[] = [
  {
    slug: "superior",
    name: "Phòng Superior",
    nameKey: "room.superior",
    shortDescKey: "room.superior.short",
    longDescKey: "room.superior.long",
    bedKey: "room.bedQueen",
    price: 1200000,
    capacity: 2,
    size: "22 m²",
    bed: "1 giường Queen",
    shortDescription: "Không gian ấm cúng, phù hợp cho cặp đôi hoặc khách công tác.",
    longDescription:
      "Phòng Superior mang đến trải nghiệm nghỉ ngơi tinh tế với thiết kế hiện đại, ánh sáng tự nhiên và đầy đủ tiện nghi cho kỳ nghỉ thoải mái tại Huế.",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["amen.wifi", "amen.breakfast", "amen.bath", "amen.premiumBed", "amen.parking", "amen.security"],
    policy: ["pol.checkIn", "pol.checkOut", "pol.cancel48"],
  },
  {
    slug: "deluxe",
    name: "Phòng Deluxe",
    nameKey: "room.deluxe",
    shortDescKey: "room.deluxe.short",
    longDescKey: "room.deluxe.long",
    bedKey: "room.bedKing",
    price: 1500000,
    capacity: 2,
    size: "28 m²",
    bed: "1 giường King",
    shortDescription: "Không gian rộng rãi, thiết kế thanh lịch.",
    longDescription:
      "Phòng Deluxe mở rộng diện tích và nâng cao tiện nghi, lý tưởng cho kỳ nghỉ dưỡng thư giãn ngay trung tâm thành phố Huế.",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["amen.wifi", "amen.breakfast", "amen.bath", "amen.kingBed", "amen.parking", "amen.reception"],
    policy: ["pol.checkIn", "pol.checkOut", "pol.cancel48"],
  },
  {
    slug: "deluxe-balcony",
    name: "Phòng Deluxe Balcony",
    nameKey: "room.deluxeBalcony",
    shortDescKey: "room.deluxeBalcony.short",
    longDescKey: "room.deluxeBalcony.long",
    bedKey: "room.bedKing",
    price: 1700000,
    capacity: 2,
    size: "30 m²",
    bed: "1 giường King",
    shortDescription: "Có ban công riêng, view thành phố.",
    longDescription:
      "Phòng Deluxe Balcony có ban công riêng, phù hợp để tận hưởng không gian thoáng đãng và quan sát nhịp sống Huế.",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["amen.wifi", "amen.breakfast", "amen.balcony", "amen.kingBed", "amen.parking", "amen.reception"],
    policy: ["pol.checkIn", "pol.checkOut", "pol.cancel48"],
  },
  {
    slug: "premier",
    name: "Phòng Premier",
    nameKey: "room.premier",
    shortDescKey: "room.premier.short",
    longDescKey: "room.premier.long",
    bedKey: "room.bedKing",
    price: 1900000,
    capacity: 2,
    size: "32 m²",
    bed: "1 giường King",
    shortDescription: "Trải nghiệm cao cấp với không gian thoáng đãng.",
    longDescription:
      "Phòng Premier kết hợp tinh thần Huế và sự tiện nghi hiện đại, mang đến không gian sang trọng cho kỳ nghỉ trọn vẹn.",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["amen.wifi", "amen.breakfast", "amen.premiumBath", "amen.kingBed", "amen.minibar", "amen.reception"],
    policy: ["pol.checkIn", "pol.checkOut", "pol.cancel48"],
  },
  {
    slug: "junior-suite",
    name: "Phòng Junior Suite",
    nameKey: "room.juniorSuite",
    shortDescKey: "room.juniorSuite.short",
    longDescKey: "room.juniorSuite.long",
    bedKey: "room.bedKing",
    price: 2300000,
    capacity: 2,
    size: "40 m²",
    bed: "1 giường King",
    shortDescription: "Không gian rộng, sang trọng và riêng tư.",
    longDescription:
      "Junior Suite có khu tiếp khách riêng và phòng tắm cao cấp, dành cho khách yêu thích sự sang trọng.",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["amen.wifi", "amen.breakfast", "amen.lounge", "amen.bathtub", "amen.minibar", "amen.reception"],
    policy: ["pol.checkIn", "pol.checkOut", "pol.cancel72"],
  },
  {
    slug: "imperial-suite",
    name: "Phòng Imperial Suite",
    nameKey: "room.imperialSuite",
    shortDescKey: "room.imperialSuite.short",
    longDescKey: "room.imperialSuite.long",
    bedKey: "room.bedKing",
    price: 3200000,
    capacity: 2,
    size: "55 m²",
    bed: "1 giường King",
    shortDescription: "Lựa chọn cao cấp nhất cho kỳ nghỉ đặc biệt.",
    longDescription:
      "Imperial Suite mang đến không gian sang trọng bậc nhất với phòng khách rộng, ban công riêng và dịch vụ chăm sóc cao cấp.",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: ["amen.wifi", "amen.breakfast", "amen.livingRoom", "amen.balcony", "amen.minibar", "amen.shuttle"],
    policy: ["pol.checkIn", "pol.checkOut", "pol.cancel72"],
  },
];

export const getRoomBySlug = (slug?: string) => rooms.find((r) => r.slug === slug);

export const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} VND`;