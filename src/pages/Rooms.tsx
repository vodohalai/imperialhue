import { useMemo, useState } from "react";
import { ArrowRight, BedDouble, Filter, Search, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

const rooms = [
  { name: "Phòng Superior", slug: "superior", price: 1200000, capacity: 2, size: "22 m²", bed: "1 giường Queen", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80" },
  { name: "Phòng Deluxe", slug: "deluxe", price: 1500000, capacity: 2, size: "28 m²", bed: "1 giường King", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80" },
  { name: "Phòng Deluxe Balcony", slug: "deluxe-balcony", price: 1700000, capacity: 2, size: "30 m²", bed: "1 giường King", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80" },
  { name: "Phòng Premier", slug: "premier", price: 1900000, capacity: 2, size: "32 m²", bed: "1 giường King", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80" },
  { name: "Phòng Junior Suite", slug: "junior-suite", price: 2300000, capacity: 2, size: "40 m²", bed: "1 giường King", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80" },
  { name: "Phòng Imperial Suite", slug: "imperial-suite", price: 3200000, capacity: 2, size: "55 m²", bed: "1 giường King", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80" },
];

const Rooms = () => {
  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState("all");
  const [sort, setSort] = useState("featured");

  const filteredRooms = useMemo(() => {
    const result = rooms.filter((room) => {
      const matchesQuery = room.name.toLowerCase().includes(query.toLowerCase());
      const matchesCapacity = capacity === "all" || room.capacity.toString() === capacity;
      return matchesQuery && matchesCapacity;
    });

    if (sort === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [query, capacity, sort]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[#ece6dd] bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">Phòng nghỉ</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Tất cả phòng tại The Imperial Hue</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Lọc theo tên phòng, sức chứa và giá để tìm lựa chọn phù hợp nhất cho kỳ nghỉ của bạn.
            </p>
          </div>
          <Link to="/" className="rounded-full bg-[#0D9488] px-5 py-3 text-sm font-semibold text-white">
            Về trang chủ
          </Link>
        </div>

        <div className="mb-6 grid gap-3 rounded-[1.5rem] border border-[#ece6dd] bg-white p-4 shadow-sm md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] px-4 py-3">
            <Search className="h-4 w-4 text-[#0D9488]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Tìm theo tên phòng" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] px-4 py-3">
            <Users className="h-4 w-4 text-[#0D9488]" />
            <select value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-transparent text-sm outline-none">
              <option value="all">Tất cả sức chứa</option>
              <option value="2">2 khách</option>
            </select>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#fbfaf7] px-4 py-3">
            <Filter className="h-4 w-4 text-[#0D9488]" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-transparent text-sm outline-none">
              <option value="featured">Sắp xếp nổi bật</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <article key={room.slug} className="overflow-hidden rounded-[1.75rem] border border-[#ece6dd] bg-white shadow-sm">
              <div className="relative h-64">
                <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0D9488] shadow">
                  <Star className="mr-1 inline h-3 w-3" />
                  Gợi ý AI
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-900">{room.name}</h2>
                  <p className="text-sm font-bold text-[#f97316]">{room.price.toLocaleString("vi-VN")} VND</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{room.size}</span>
                  <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{room.bed}</span>
                  <span className="rounded-full bg-[#fbfaf7] px-3 py-1">{room.capacity} khách</span>
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
      </div>
    </div>
  );
};

export default Rooms;