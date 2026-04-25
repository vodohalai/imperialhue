export type Lang = "vi" | "en";

const t = {
  // Navigation
  "nav.home": { vi: "Trang chủ", en: "Home" },
  "nav.rooms": { vi: "Phòng nghỉ", en: "Rooms" },
  "nav.amenities": { vi: "Tiện nghi", en: "Amenities" },
  "nav.offers": { vi: "Ưu đãi", en: "Offers" },
  "nav.explore": { vi: "Khám phá Huế", en: "Explore Hue" },
  "nav.contact": { vi: "Liên hệ", en: "Contact" },
  "nav.bookNow": { vi: "Đặt phòng ngay", en: "Book Now" },

  // Bottom nav
  "bnav.home": { vi: "Trang chủ", en: "Home" },
  "bnav.rooms": { vi: "Phòng", en: "Rooms" },
  "bnav.offers": { vi: "Ưu đãi", en: "Offers" },
  "bnav.gallery": { vi: "Khám phá", en: "Gallery" },
  "bnav.contact": { vi: "Liên hệ", en: "Contact" },

  // Hero
  "hero.greeting": { vi: "Chào bạn, bạn đang tìm kiếm một kỳ nghỉ như thế nào?", en: "Hello, what kind of getaway are you looking for?" },
  "hero.desc": { vi: "Không gian nghỉ dưỡng tinh tế, ấm cúng và đậm chất Huế, nơi mỗi chi tiết đều được chăm chút để bạn có một kỳ nghỉ thật trọn vẹn.", en: "An elegant and cozy retreat infused with the spirit of Hue, where every detail is crafted for a truly memorable stay." },

  // Search
  "search.checkIn": { vi: "Nhận phòng", en: "Check-in" },
  "search.checkOut": { vi: "Trả phòng", en: "Check-out" },
  "search.guests": { vi: "Khách", en: "Guests" },
  "search.guestUnit": { vi: "khách", en: "guest(s)" },
  "search.checkAvail": { vi: "Kiểm tra phòng trống", en: "Check Availability" },
  "search.aiSearch": { vi: "Tìm bằng AI", en: "AI Search" },

  // Features
  "feat.location.title": { vi: "Vị trí thuận tiện", en: "Prime Location" },
  "feat.location.desc": { vi: "Trung tâm thành phố Huế, gần các điểm tham quan nổi tiếng", en: "Central Hue, near famous attractions" },
  "feat.rooms.title": { vi: "Phòng nghỉ ấm cúng", en: "Cozy Rooms" },
  "feat.rooms.desc": { vi: "Thiết kế hiện đại với nét duyên dáng xứ Huế", en: "Modern design with Hue's charming touch" },
  "feat.local.title": { vi: "Trải nghiệm địa phương", en: "Local Experience" },
  "feat.local.desc": { vi: "Gợi ý hành trình, ẩm thực và văn hóa đặc sắc của Huế", en: "Curated itineraries, cuisine & culture of Hue" },
  "feat.service.title": { vi: "Dịch vụ tận tâm", en: "Dedicated Service" },
  "feat.service.desc": { vi: "Đội ngũ thân thiện, luôn sẵn sàng đồng hành cùng bạn", en: "Friendly team always ready to assist you" },

  // Rooms section (Index + Rooms page)
  "rooms.label": { vi: "Phòng nghỉ", en: "Rooms" },
  "rooms.title": { vi: "Không gian lưu trú tinh tế", en: "Elegant Accommodations" },
  "rooms.viewAll": { vi: "Xem tất cả", en: "View All" },
  "rooms.viewDetail": { vi: "Xem chi tiết", en: "View Details" },
  "rooms.allTitle": { vi: "Tất cả phòng tại The Imperial Hue", en: "All Rooms at The Imperial Hue" },
  "rooms.allDesc": { vi: "Lọc theo tên phòng, sức chứa và giá để tìm lựa chọn phù hợp nhất cho kỳ nghỉ của bạn.", en: "Filter by name, capacity and price to find the best option for your stay." },
  "rooms.searchName": { vi: "Tìm theo tên phòng", en: "Search by room name" },
  "rooms.allCapacity": { vi: "Tất cả sức chứa", en: "All capacities" },
  "rooms.sortFeatured": { vi: "Sắp xếp nổi bật", en: "Featured" },
  "rooms.sortPriceAsc": { vi: "Giá tăng dần", en: "Price: Low to High" },
  "rooms.sortPriceDesc": { vi: "Giá giảm dần", en: "Price: High to Low" },
  "rooms.aiSuggest": { vi: "Gợi ý AI", en: "AI Pick" },
  "rooms.guest": { vi: "khách", en: "guest(s)" },
  "rooms.perNight": { vi: "/ đêm", en: "/ night" },

  // Room Detail
  "detail.label": { vi: "Chi tiết phòng", en: "Room Details" },
  "detail.backToList": { vi: "Quay lại danh sách phòng", en: "Back to Room List" },
  "detail.description": { vi: "Mô tả", en: "Description" },
  "detail.maxGuests": { vi: "Tối đa", en: "Up to" },
  "detail.support247": { vi: "Hỗ trợ 24/7", en: "24/7 Support" },
  "detail.amenities": { vi: "Tiện nghi", en: "Amenities" },
  "detail.policy": { vi: "Chính sách", en: "Policy" },
  "detail.priceFrom": { vi: "Giá từ", en: "From" },
  "detail.totalEst": { vi: "Tổng tạm tính", en: "Estimated Total" },
  "detail.forNights": { vi: "Cho", en: "For" },
  "detail.nights": { vi: "đêm", en: "night(s)" },
  "detail.notFound": { vi: "Không tìm thấy phòng", en: "Room Not Found" },

  // Booking
  "booking.label": { vi: "Đặt phòng", en: "Booking" },
  "booking.title": { vi: "Hoàn tất thông tin đặt phòng", en: "Complete Your Booking" },
  "booking.backToDetail": { vi: "Quay lại chi tiết phòng", en: "Back to Room Details" },
  "booking.name": { vi: "Họ và tên", en: "Full Name" },
  "booking.email": { vi: "Email", en: "Email" },
  "booking.phone": { vi: "Số điện thoại", en: "Phone Number" },
  "booking.notes": { vi: "Yêu cầu thêm (nếu có)", en: "Additional requests (optional)" },
  "booking.confirm": { vi: "Xác nhận đặt phòng", en: "Confirm Booking" },
  "booking.nightLabel": { vi: "Đêm", en: "Nights" },
  "booking.guestLabel": { vi: "Khách", en: "Guests" },
  "booking.pricePerNight": { vi: "Giá / đêm", en: "Price / night" },
  "booking.thankYou": { vi: "Cảm ơn bạn", en: "Thank you" },
  "booking.successMsg": { vi: "Đặt phòng thành công! Lễ tân sẽ liên hệ xác nhận.", en: "Booking confirmed! Our reception will contact you shortly." },
  "booking.confirmDesc": { vi: "đã được tiếp nhận. Đội ngũ lễ tân sẽ liên hệ trong vòng 1 giờ.", en: "has been received. Our team will contact you within 1 hour." },
  "booking.goHome": { vi: "Về trang chủ", en: "Go Home" },
  "booking.viewMore": { vi: "Xem thêm phòng", en: "View More Rooms" },
  "booking.viewRooms": { vi: "Xem danh sách phòng", en: "View Room List" },

  // Availability
  "avail.label": { vi: "Kết quả tìm kiếm", en: "Search Results" },
  "avail.title": { vi: "Phòng trống cho kỳ nghỉ của bạn", en: "Available Rooms for Your Stay" },
  "avail.available": { vi: "Còn phòng", en: "Available" },
  "avail.totalNights": { vi: "Tổng", en: "Total" },
  "avail.bookRoom": { vi: "Đặt phòng", en: "Book" },
  "avail.noRooms": { vi: "Không có phòng phù hợp với số lượng khách. Vui lòng thử lại với cấu hình khác.", en: "No rooms match your guest count. Please try a different configuration." },
  "avail.invalidDate": { vi: "Ngày trả phòng phải sau ngày nhận phòng. Vui lòng chọn lại.", en: "Check-out must be after check-in. Please select again." },

  // AI section & Behavioral Intelligence
  "ai.label": { vi: "AI Agent", en: "AI Agent" },
  "ai.title": { vi: "Imperial, trợ lý du lịch của bạn", en: "Imperial, your travel assistant" },
  "ai.welcome": { vi: "Chào mừng bạn đến với The Imperial Hue!", en: "Welcome to The Imperial Hue!" },
  "ai.desc": { vi: "Hãy hỏi tôi về phòng phù hợp, ưu đãi, lịch trình khám phá Huế hoặc hỗ trợ đặt phòng ngay.", en: "Ask me about rooms, offers, Hue itineraries, or booking assistance." },
  "ai.findRoom": { vi: "Tìm phòng", en: "Find Room" },
  "ai.offers": { vi: "Ưu đãi", en: "Offers" },
  "ai.support": { vi: "Hỗ trợ", en: "Support" },
  "ai.gallery": { vi: "Thư viện", en: "Gallery" },
  
  "pop.waitTitle": { vi: "Đợi chút! Chúng tôi có", en: "Wait! We have a" },
  "pop.specialOffer": { vi: "ưu đãi đặc biệt", en: "special offer" },
  "pop.forYou": { vi: "cho bạn", en: "for you" },
  "pop.limited": { vi: "Ưu đãi có hạn", en: "Limited Offer" },
  "pop.todayOffer": { vi: "Ưu đãi đặc biệt hôm nay", en: "Today's special offer" },
  "pop.discount": { vi: "Giảm 15% tất cả các phòng", en: "15% off all rooms" },
  "pop.valid": { vi: "Áp dụng khi đặt phòng ngay hôm nay", en: "Valid when booking today" },
  "pop.expires": { vi: "Ưu đãi hết hạn sau:", en: "Offer expires in:" },
  "pop.claim": { vi: "Nhận ưu đãi ngay", en: "Claim offer now" },
  "pop.noThanks": { vi: "Không, tôi không cần", en: "No, I don't need this" },

  // Offers
  "offers.label": { vi: "Ưu đãi", en: "Offers" },
  "offers.title": { vi: "Ưu đãi nổi bật tại The Imperial Hue", en: "Featured Offers at The Imperial Hue" },
  "offers.desc": { vi: "Chọn ưu đãi phù hợp để tối ưu chi phí và nâng cấp trải nghiệm lưu trú của bạn.", en: "Choose the right offer to optimize costs and upgrade your stay." },
  "offers.highlight": { vi: "Ưu đãi nổi bật", en: "Featured Offers" },
  "offers.earlyBird": { vi: "Đặt sớm, nhận giá tốt", en: "Book Early, Save More" },
  "offers.earlyTitle": { vi: "Đặt sớm tiết kiệm", en: "Early Bird Savings" },
  "offers.earlyDesc": { vi: "Giảm giá cho khách đặt trước 14 ngày.", en: "Discount for bookings made 14 days in advance." },
  "offers.longTitle": { vi: "Kỳ nghỉ dài ngày", en: "Extended Stay" },
  "offers.longDesc": { vi: "Ưu đãi đặc biệt cho lưu trú từ 3 đêm.", en: "Special offer for stays of 3 nights or more." },
  "offers.breakfastTitle": { vi: "Combo bữa sáng", en: "Breakfast Combo" },
  "offers.breakfastDesc": { vi: "Tặng bữa sáng cho một số hạng phòng.", en: "Complimentary breakfast for selected room types." },
  "offers.applyNow": { vi: "Áp dụng ngay khi đặt phòng", en: "Applied automatically when booking" },
  "offers.action": { vi: "Hành động", en: "Take Action" },
  "offers.readyBook": { vi: "Sẵn sàng đặt phòng với ưu đãi tốt nhất", en: "Ready to book with the best offer" },
  "offers.freeBreakfast": { vi: "Miễn phí bữa sáng", en: "Free Breakfast" },
  "offers.freeBreakfastDesc": { vi: "Áp dụng cho các hạng phòng chọn lọc.", en: "For selected room types." },
  "offers.longStay": { vi: "Ưu đãi dài ngày", en: "Long Stay Offer" },
  "offers.longStayDesc": { vi: "Giảm giá hấp dẫn cho kỳ nghỉ từ 3 đêm trở lên.", en: "Great discount for stays of 3+ nights." },
  "offers.dedicated": { vi: "Hỗ trợ tận tâm", en: "Dedicated Support" },
  "offers.dedicatedDesc": { vi: "Đội ngũ luôn sẵn sàng tư vấn lịch trình tại Huế.", en: "Our team is always ready to help plan your Hue trip." },
  "offers.discover": { vi: "Khám phá ưu đãi", en: "Discover Offers" },

  // Explore
  "explore.label": { vi: "Khám phá Huế", en: "Explore Hue" },
  "explore.title": { vi: "Gợi ý trải nghiệm quanh khách sạn", en: "Experiences Around the Hotel" },
  "explore.pageTitle": { vi: "Điểm đến và ẩm thực quanh khách sạn", en: "Destinations & Cuisine Near the Hotel" },
  "explore.pageDesc": { vi: "Gợi ý những trải nghiệm nổi bật để bạn kết hợp nghỉ dưỡng và khám phá văn hóa Huế.", en: "Top experiences to combine relaxation with Hue's cultural exploration." },
  "explore.highlight": { vi: "Điểm đến nổi bật", en: "Top Destination" },
  "explore.place1": { vi: "Đại Nội Huế", en: "Hue Imperial Citadel" },
  "explore.place1Desc": { vi: "Di sản thế giới UNESCO, nơi lưu giữ lịch sử triều Nguyễn với kiến trúc cung đình tráng lệ.", en: "A UNESCO World Heritage Site preserving Nguyen Dynasty history with magnificent palace architecture." },
  "explore.place2": { vi: "Sông Hương - Cầu Trường Tiền", en: "Perfume River - Truong Tien Bridge" },
  "explore.place2Desc": { vi: "Biểu tượng lãng mạn của Huế, lý tưởng cho du thuyền buổi tối và ngắm hoàng hôn.", en: "Hue's romantic symbol, ideal for evening boat cruises and sunset watching." },
  "explore.place3": { vi: "Ẩm thực cung đình và món Huế", en: "Royal Cuisine & Hue Specialties" },
  "explore.place3Desc": { vi: "Thưởng thức bún bò Huế, bánh bèo, cơm hến và các món ăn cung đình tinh tế.", en: "Savor Bun Bo Hue, Banh Beo, Com Hen and exquisite royal court dishes." },
  "explore.place4": { vi: "Chùa Thiên Mụ", en: "Thien Mu Pagoda" },
  "explore.place4Desc": { vi: "Ngôi chùa cổ kính bên bờ sông Hương, biểu tượng tâm linh của cố đô.", en: "An ancient pagoda on the Perfume River bank, a spiritual symbol of the ancient capital." },
  "explore.place5": { vi: "Lăng Tự Đức", en: "Tu Duc Royal Tomb" },
  "explore.place5Desc": { vi: "Lăng tẩm đẹp nhất Huế với kiến trúc hài hòa giữa thiên nhiên và nghệ thuật.", en: "Hue's most beautiful tomb with architecture harmonizing nature and art." },
  "explore.place6": { vi: "Chợ Đông Ba", en: "Dong Ba Market" },
  "explore.place6Desc": { vi: "Chợ truyền thống lớn nhất Huế, nơi mua sắm đặc sản và trải nghiệm đời sống địa phương.", en: "Hue's largest traditional market for local specialties and authentic local life." },
  "explore.placeDesc": { vi: "Lý tưởng để kết hợp nghỉ dưỡng, khám phá văn hóa và thưởng thức ẩm thực địa phương.", en: "Perfect for combining relaxation, cultural discovery and local cuisine." },
  "explore.more": { vi: "Xem thêm gợi ý", en: "See More Suggestions" },
  "explore.distance": { vi: "Khoảng cách", en: "Distance" },
  "explore.fromHotel": { vi: "từ khách sạn", en: "from hotel" },

  // Contact
  "contact.label": { vi: "Liên hệ", en: "Contact" },
  "contact.title": { vi: "Kết nối với The Imperial Hue", en: "Connect with The Imperial Hue" },
  "contact.desc": { vi: "Gọi ngay hoặc gửi yêu cầu để đội ngũ lễ tân hỗ trợ bạn nhanh nhất.", en: "Call or send a request and our reception will assist you promptly." },
  "contact.address": { vi: "Địa chỉ", en: "Address" },
  "contact.phone": { vi: "Điện thoại", en: "Phone" },
  "contact.email": { vi: "Email", en: "Email" },
  "contact.hours": { vi: "Giờ hỗ trợ", en: "Support Hours" },
  "contact.hoursValue": { vi: "24/7 cho đặt phòng và tư vấn", en: "24/7 for bookings & inquiries" },
  "contact.formName": { vi: "Họ và tên", en: "Full Name" },
  "contact.formEmail": { vi: "Email", en: "Email" },
  "contact.formPhone": { vi: "Số điện thoại", en: "Phone Number" },
  "contact.formDate": { vi: "Ngày nhận phòng", en: "Check-in Date" },
  "contact.formMessage": { vi: "Nội dung yêu cầu của bạn", en: "Your message" },
  "contact.send": { vi: "Gửi yêu cầu", en: "Send Request" },
  "contact.callNow": { vi: "Gọi ngay", en: "Call Now" },

  // About
  "about.label": { vi: "Giới thiệu", en: "About" },
  "about.title": { vi: "Về The Imperial Hue", en: "About The Imperial Hue" },
  "about.desc": { vi: "Khách sạn boutique mang tinh thần Huế, kết hợp sự tinh tế hiện đại với trải nghiệm lưu trú ấm áp và thân thiện.", en: "A boutique hotel embodying the spirit of Hue, blending modern elegance with warm and friendly hospitality." },
  "about.storyTitle": { vi: "Câu chuyện của chúng tôi", en: "Our Story" },
  "about.storyDesc": { vi: "The Imperial Hue ra đời từ tình yêu với cố đô Huế — nơi mỗi con đường, mỗi mái nhà đều mang trong mình câu chuyện lịch sử. Chúng tôi mong muốn mang đến cho du khách một không gian nghỉ dưỡng vừa hiện đại, vừa đậm chất văn hóa xứ Huế.", en: "The Imperial Hue was born from a love for the ancient capital — where every street and rooftop carries a story of history. We aim to offer travelers a retreat that is both modern and deeply rooted in Hue's cultural heritage." },
  "about.missionTitle": { vi: "Sứ mệnh", en: "Our Mission" },
  "about.missionDesc": { vi: "Tạo nên trải nghiệm lưu trú trọn vẹn, nơi khách hàng cảm nhận được sự chăm sóc tận tâm, không gian tinh tế và tinh thần hiếu khách đặc trưng của Huế.", en: "To create a complete hospitality experience where guests feel genuine care, refined spaces, and the distinctive spirit of Hue's hospitality." },
  "about.valuesTitle": { vi: "Giá trị cốt lõi", en: "Core Values" },
  "about.value1": { vi: "Chân thành & Tận tâm", en: "Sincerity & Dedication" },
  "about.value1Desc": { vi: "Mỗi dịch vụ đều xuất phát từ sự chân thành và mong muốn mang lại trải nghiệm tốt nhất.", en: "Every service stems from sincerity and the desire to deliver the best experience." },
  "about.value2": { vi: "Bản sắc văn hóa", en: "Cultural Identity" },
  "about.value2Desc": { vi: "Gìn giữ và lan tỏa nét đẹp văn hóa Huế trong từng chi tiết thiết kế và dịch vụ.", en: "Preserving and sharing Hue's cultural beauty in every design detail and service." },
  "about.value3": { vi: "Trải nghiệm cá nhân hóa", en: "Personalized Experience" },
  "about.value3Desc": { vi: "Lắng nghe và đáp ứng nhu cầu riêng của từng vị khách để tạo nên kỳ nghỉ đáng nhớ.", en: "Listening and responding to each guest's unique needs to create memorable stays." },

  // Amenities
  "amenities.label": { vi: "Tiện nghi", en: "Amenities" },
  "amenities.title": { vi: "Tiện ích khách sạn", en: "Hotel Facilities" },
  "amenities.desc": { vi: "Wi-Fi, bữa sáng, hỗ trợ lễ tân, đỗ xe và các dịch vụ hỗ trợ khác cho kỳ nghỉ của bạn.", en: "Wi-Fi, breakfast, reception support, parking and other services for your stay." },
  "amenities.wifi": { vi: "Wi-Fi tốc độ cao", en: "High-speed Wi-Fi" },
  "amenities.wifiDesc": { vi: "Kết nối internet miễn phí tốc độ cao trong toàn bộ khuôn viên khách sạn.", en: "Free high-speed internet throughout the entire hotel premises." },
  "amenities.breakfast": { vi: "Bữa sáng đặc sắc", en: "Signature Breakfast" },
  "amenities.breakfastDesc": { vi: "Bữa sáng phong cách Huế với các món ăn truyền thống và quốc tế.", en: "Hue-style breakfast with traditional and international dishes." },
  "amenities.reception": { vi: "Lễ tân 24/7", en: "24/7 Reception" },
  "amenities.receptionDesc": { vi: "Đội ngũ lễ tân thân thiện, sẵn sàng hỗ trợ bạn mọi lúc.", en: "Friendly reception team ready to assist you anytime." },
  "amenities.parking": { vi: "Bãi đỗ xe", en: "Parking" },
  "amenities.parkingDesc": { vi: "Bãi đỗ xe an toàn, miễn phí cho khách lưu trú.", en: "Safe, free parking for hotel guests." },
  "amenities.laundry": { vi: "Giặt ủi", en: "Laundry Service" },
  "amenities.laundryDesc": { vi: "Dịch vụ giặt ủi nhanh chóng, tiện lợi.", en: "Quick and convenient laundry service." },
  "amenities.transfer": { vi: "Đưa đón sân bay", en: "Airport Transfer" },
  "amenities.transferDesc": { vi: "Dịch vụ đưa đón sân bay Phú Bài theo yêu cầu.", en: "Phu Bai airport transfer service on request." },
  "amenities.tour": { vi: "Tư vấn lịch trình", en: "Tour Planning" },
  "amenities.tourDesc": { vi: "Hỗ trợ lên kế hoạch khám phá Huế và các vùng lân cận.", en: "Help planning your exploration of Hue and surrounding areas." },
  "amenities.minibar": { vi: "Minibar trong phòng", en: "In-room Minibar" },
  "amenities.minibarDesc": { vi: "Đồ uống và snack được bổ sung hàng ngày.", en: "Beverages and snacks replenished daily." },

  // Room names (bilingual)
  "room.superior": { vi: "Phòng Superior", en: "Superior Room" },
  "room.deluxe": { vi: "Phòng Deluxe", en: "Deluxe Room" },
  "room.deluxeBalcony": { vi: "Phòng Deluxe Balcony", en: "Deluxe Balcony Room" },
  "room.premier": { vi: "Phòng Premier", en: "Premier Room" },
  "room.juniorSuite": { vi: "Phòng Junior Suite", en: "Junior Suite" },
  "room.imperialSuite": { vi: "Phòng Imperial Suite", en: "Imperial Suite" },

  // Room short descriptions
  "room.superior.short": { vi: "Không gian ấm cúng, phù hợp cho cặp đôi hoặc khách công tác.", en: "Cozy space, perfect for couples or business travelers." },
  "room.deluxe.short": { vi: "Không gian rộng rãi, thiết kế thanh lịch.", en: "Spacious room with elegant design." },
  "room.deluxeBalcony.short": { vi: "Có ban công riêng, view thành phố.", en: "Private balcony with city views." },
  "room.premier.short": { vi: "Trải nghiệm cao cấp với không gian thoáng đãng.", en: "Premium experience with airy space." },
  "room.juniorSuite.short": { vi: "Không gian rộng, sang trọng và riêng tư.", en: "Spacious, luxurious and private." },
  "room.imperialSuite.short": { vi: "Lựa chọn cao cấp nhất cho kỳ nghỉ đặc biệt.", en: "The finest choice for a special getaway." },

  // Room long descriptions
  "room.superior.long": { vi: "Phòng Superior mang đến trải nghiệm nghỉ ngơi tinh tế với thiết kế hiện đại, ánh sáng tự nhiên và đầy đủ tiện nghi cho kỳ nghỉ thoải mái tại Huế.", en: "The Superior Room offers a refined resting experience with modern design, natural light and full amenities for a comfortable stay in Hue." },
  "room.deluxe.long": { vi: "Phòng Deluxe mở rộng diện tích và nâng cao tiện nghi, lý tưởng cho kỳ nghỉ dưỡng thư giãn ngay trung tâm thành phố Huế.", en: "The Deluxe Room expands space and elevates comfort, ideal for a relaxing retreat in the heart of Hue." },
  "room.deluxeBalcony.long": { vi: "Phòng Deluxe Balcony có ban công riêng, phù hợp để tận hưởng không gian thoáng đãng và quan sát nhịp sống Huế.", en: "The Deluxe Balcony Room features a private balcony, perfect for enjoying open air and watching Hue's daily life." },
  "room.premier.long": { vi: "Phòng Premier kết hợp tinh thần Huế và sự tiện nghi hiện đại, mang đến không gian sang trọng cho kỳ nghỉ trọn vẹn.", en: "The Premier Room blends Hue's spirit with modern comfort, delivering a luxurious space for a complete getaway." },
  "room.juniorSuite.long": { vi: "Junior Suite có khu tiếp khách riêng và phòng tắm cao cấp, dành cho khách yêu thích sự sang trọng.", en: "The Junior Suite features a private lounge and premium bathroom, designed for guests who appreciate luxury." },
  "room.imperialSuite.long": { vi: "Imperial Suite mang đến không gian sang trọng bậc nhất với phòng khách rộng, ban công riêng và dịch vụ chăm sóc cao cấp.", en: "The Imperial Suite offers the finest luxury with a spacious living room, private balcony and premium care services." },

  // Room bed types
  "room.bedQueen": { vi: "1 giường Queen", en: "1 Queen Bed" },
  "room.bedKing": { vi: "1 giường King", en: "1 King Bed" },

  // 404
  "notFound.title": { vi: "Trang bạn tìm không tồn tại.", en: "The page you're looking for doesn't exist." },
  "notFound.goHome": { vi: "Về trang chủ", en: "Go Home" },

  // Footer
  "footer.text": { vi: "The Imperial Hue Boutique Hotel", en: "The Imperial Hue Boutique Hotel" },
} as const;

export type TranslationKey = keyof typeof t;

export const translate = (key: TranslationKey, lang: Lang): string => {
  return t[key]?.[lang] || t[key]?.vi || key;
};

export default t;