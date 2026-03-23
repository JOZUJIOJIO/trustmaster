export interface Master {
  id: string;
  name: string;
  nameTh: string;
  avatar: string;
  specialty: string[];
  specialtyTh: string[];
  description: string;
  descriptionTh: string;
  experience: number;
  rating: number;
  reviewCount: number;
  satisfactionScore: number;
  verified: boolean;
  priceRange: { min: number; max: number };
  lineId: string;
  location: string;
  locationTh: string;
  languages: string[];
  availability: string;
}

export interface Review {
  id: string;
  masterId: string;
  userName: string;
  rating: number;
  comment: string;
  commentTh: string;
  helpful: boolean;
  createdAt: string;
}

export const categories = [
  { id: "all", label: "ทั้งหมด", labelEn: "All" },
  { id: "tarot", label: "ไพ่ทาโรต์", labelEn: "Tarot" },
  { id: "astrology", label: "โหราศาสตร์", labelEn: "Astrology" },
  { id: "fengshui", label: "ฮวงจุ้ย", labelEn: "Feng Shui" },
  { id: "palmistry", label: "ดูลายมือ", labelEn: "Palmistry" },
  { id: "numerology", label: "เลขศาสตร์", labelEn: "Numerology" },
];

export const masters: Master[] = [
  {
    id: "ajahn-somchai",
    name: "Ajahn Somchai",
    nameTh: "อาจารย์สมชาย",
    avatar: "🔮",
    specialty: ["Astrology", "Thai Numerology"],
    specialtyTh: ["โหราศาสตร์", "เลขศาสตร์ไทย"],
    description:
      "Ajahn Somchai has been practicing Thai astrology for over 15 years. Known for his precise birth chart readings and life direction guidance. Former monk who studied under the renowned Luang Phor Koon lineage.",
    descriptionTh:
      "อาจารย์สมชายมีประสบการณ์ด้านโหราศาสตร์ไทยมากกว่า 15 ปี เป็นที่รู้จักในเรื่องการดูดวงชะตาที่แม่นยำและการให้คำแนะนำทิศทางชีวิต เคยบวชเรียนศึกษาในสายหลวงพ่อคูณ",
    experience: 15,
    rating: 4.9,
    reviewCount: 328,
    satisfactionScore: 92,
    verified: true,
    priceRange: { min: 500, max: 900 },
    lineId: "ajahn.somchai",
    location: "Bangkok, Silom",
    locationTh: "กรุงเทพฯ สีลม",
    languages: ["Thai", "English"],
    availability: "Mon-Sat 10:00-18:00",
  },
  {
    id: "kruba-wan",
    name: "Kruba Wan",
    nameTh: "ครูบาวรรณ",
    avatar: "🃏",
    specialty: ["Tarot", "Love & Relationships"],
    specialtyTh: ["ไพ่ทาโรต์", "ความรัก & ความสัมพันธ์"],
    description:
      "Kruba Wan specializes in tarot readings focused on love and relationships. Her warm and empathetic approach has helped thousands of clients navigate their emotional lives. She combines Western tarot with Thai spiritual insights.",
    descriptionTh:
      "ครูบาวรรณเชี่ยวชาญการดูไพ่ทาโรต์โดยเฉพาะเรื่องความรักและความสัมพันธ์ ด้วยความอบอุ่นและเข้าใจ ช่วยเหลือลูกค้านับพันในการนำทางชีวิตทางอารมณ์ ผสมผสานไพ่ทาโรต์ตะวันตกกับภูมิปัญญาทางจิตวิญญาณไทย",
    experience: 8,
    rating: 4.7,
    reviewCount: 156,
    satisfactionScore: 88,
    verified: true,
    priceRange: { min: 350, max: 700 },
    lineId: "kruba.wan",
    location: "Bangkok, Chatuchak",
    locationTh: "กรุงเทพฯ จตุจักร",
    languages: ["Thai"],
    availability: "Tue-Sun 09:00-17:00",
  },
  {
    id: "mae-chi-ploy",
    name: "Mae Chi Ploy",
    nameTh: "แม่ชีพลอย",
    avatar: "🌚",
    specialty: ["Feng Shui", "Business Fortune"],
    specialtyTh: ["ฮวงจุ้ย", "ดวงธุรกิจ"],
    description:
      "Mae Chi Ploy is a former Buddhist nun turned feng shui master. She specializes in business fortune readings and office/home feng shui consultations. Her clients include several successful Thai entrepreneurs.",
    descriptionTh:
      "แม่ชีพลอยเป็นอดีตแม่ชีที่ผันตัวมาเป็นอาจารย์ฮวงจุ้ย เชี่ยวชาญการดูดวงธุรกิจและฮวงจุ้ยสำนักงาน/บ้าน ลูกค้ารวมถึงผู้ประกอบการไทยที่ประสบความสำเร็จหลายคน",
    experience: 20,
    rating: 4.8,
    reviewCount: 214,
    satisfactionScore: 95,
    verified: true,
    priceRange: { min: 800, max: 1500 },
    lineId: "maechi.ploy",
    location: "Bangkok, Sukhumvit",
    locationTh: "กรุงเทพฯ สุขุมวิท",
    languages: ["Thai", "Chinese", "English"],
    availability: "Mon-Fri 10:00-16:00",
  },
  {
    id: "phra-kru-nattapong",
    name: "Phra Kru Nattapong",
    nameTh: "พระครูณัฐพงษ์",
    avatar: "☸",
    specialty: ["Palmistry", "Life Direction"],
    specialtyTh: ["ดูลายมือ", "ทิศทางชีวิต"],
    description:
      "Phra Kru Nattapong combines traditional palmistry with Buddhist philosophy. His readings focus on understanding one's life path and making wise decisions. Known for his calming presence and thoughtful guidance.",
    descriptionTh:
      "พระครูณัฐพงษ์ผสมผสานการดูลายมือแบบดั้งเดิมกับปรัชญาพุทธ การดูดวงเน้นการเข้าใจเส้นทางชีวิตและการตัดสินใจอย่างชาญฉลาด เป็นที่รู้จักในเรื่องความสงบและการให้คำแนะนำอย่างรอบคอบ",
    experience: 12,
    rating: 4.6,
    reviewCount: 89,
    satisfactionScore: 85,
    verified: true,
    priceRange: { min: 450, max: 800 },
    lineId: "phrakru.nattapong",
    location: "Bangkok, Thonburi",
    locationTh: "กรุงเทพฯ ธนบุรี",
    languages: ["Thai"],
    availability: "Wed-Sun 08:00-15:00",
  },
  {
    id: "arjan-lek",
    name: "Arjan Lek",
    nameTh: "อาจารย์เล็ก",
    avatar: "⭐",
    specialty: ["Numerology", "Name Analysis"],
    specialtyTh: ["เลขศาสตร์", "วิเคราะห์ชื่อ"],
    description:
      "Arjan Lek is a numerology expert who specializes in name analysis and lucky number consultations. Many clients credit her with helping them choose auspicious names for businesses and children.",
    descriptionTh:
      "อาจารย์เล็กเป็นผู้เชี่ยวชาญด้านเลขศาสตร์ เชี่ยวชาญการวิเคราะห์ชื่อและให้คำปรึกษาเลขมงคล ลูกค้าหลายคนให้เครดิตในการช่วยเลือกชื่อมงคลสำหรับธุรกิจและบุตร",
    experience: 10,
    rating: 4.5,
    reviewCount: 67,
    satisfactionScore: 82,
    verified: true,
    priceRange: { min: 300, max: 600 },
    lineId: "arjan.lek",
    location: "Bangkok, Ratchada",
    locationTh: "กรุงเทพฯ รัชดา",
    languages: ["Thai", "English"],
    availability: "Mon-Sat 11:00-19:00",
  },
  {
    id: "luang-phi-tham",
    name: "Luang Phi Tham",
    nameTh: "หลวงพี่ธรรม",
    avatar: "🪷",
    specialty: ["Astrology", "Feng Shui"],
    specialtyTh: ["โหราศาสตร์", "ฮวงจุ้ย"],
    description:
      "Luang Phi Tham combines Thai astrology with feng shui to provide holistic life guidance. His unique approach integrates birth chart analysis with spatial energy readings for homes and businesses.",
    descriptionTh:
      "หลวงพี่ธรรมผสมผสานโหราศาสตร์ไทยกับฮวงจุ้ยเพื่อให้คำแนะนำชีวิตแบบองค์รวม แนวทางเฉพาะตัวผสมผสานการวิเคราะห์ดวงชะตากับการอ่านพลังงานเชิงพื้นที่สำหรับบ้านและธุรกิจ",
    experience: 18,
    rating: 4.8,
    reviewCount: 195,
    satisfactionScore: 91,
    verified: true,
    priceRange: { min: 600, max: 1200 },
    lineId: "luangphi.tham",
    location: "Bangkok, Bangna",
    locationTh: "กรุงเทพฯ บางนา",
    languages: ["Thai", "English"],
    availability: "Tue-Sat 09:00-17:00",
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    masterId: "ajahn-somchai",
    userName: "Nong Pim",
    rating: 5,
    comment:
      "Ajahn predicted my promotion exactly. He said March would bring career changes and it happened! Very accurate and kind.",
    commentTh:
      "อาจารย์ทำนายเรื่องเลื่อนตำแหน่งได้แม่นเป๊ะ บอกว่าเดือนมีนาจะมีการเปลี่ยนแปลงในอาชีพ และมันเกิดขึ้นจริง! แม่นมากและใจดี",
    helpful: true,
    createdAt: "2026-03-07",
  },
  {
    id: "r2",
    masterId: "ajahn-somchai",
    userName: "Krit T.",
    rating: 5,
    comment:
      "My 3rd consultation. Every time Ajahn gives me clarity when I feel lost. Worth every baht.",
    commentTh:
      "ปรึกษาครั้งที่ 3 แล้ว ทุกครั้งอาจารย์ให้ความชัดเจนเมื่อรู้สึกหลงทาง คุ้มค่าทุกบาท",
    helpful: true,
    createdAt: "2026-02-20",
  },
  {
    id: "r3",
    masterId: "ajahn-somchai",
    userName: "Som O.",
    rating: 4,
    comment:
      "Good reading but session felt rushed. Would prefer a 45 min option.",
    commentTh:
      "ดูดวงดี แต่รู้สึกเร่งรีบ อยากให้มีตัวเลือก 45 นาที",
    helpful: false,
    createdAt: "2026-02-15",
  },
  {
    id: "r4",
    masterId: "kruba-wan",
    userName: "Ploy K.",
    rating: 5,
    comment:
      "Kruba Wan helped me understand my relationship patterns. Her tarot reading was spot on about my ex. I finally feel at peace.",
    commentTh:
      "ครูบาวรรณช่วยให้เข้าใจรูปแบบความสัมพันธ์ของตัวเอง ไพ่ทาโรต์ที่เปิดตรงเป๊ะเรื่องแฟนเก่า ในที่สุดก็รู้สึกสงบ",
    helpful: true,
    createdAt: "2026-03-10",
  },
  {
    id: "r5",
    masterId: "kruba-wan",
    userName: "Bam S.",
    rating: 5,
    comment:
      "So warm and understanding. She doesn't just read cards — she truly listens. I cried and felt so much better after.",
    commentTh:
      "อบอุ่นและเข้าใจมาก ไม่ใช่แค่ดูไพ่ แต่ตั้งใจฟังจริงๆ ร้องไห้ออกมาและรู้สึกดีขึ้นมากหลังจากนั้น",
    helpful: true,
    createdAt: "2026-02-28",
  },
  {
    id: "r6",
    masterId: "mae-chi-ploy",
    userName: "Khun Chai",
    rating: 5,
    comment:
      "After Mae Chi Ploy rearranged my office feng shui, my business revenue increased 30% in 2 months. Not kidding.",
    commentTh:
      "หลังจากแม่ชีพลอยจัดฮวงจุ้ยสำนักงานใหม่ รายได้ธุรกิจเพิ่มขึ้น 30% ใน 2 เดือน ไม่ได้พูดเล่น",
    helpful: true,
    createdAt: "2026-03-05",
  },
  {
    id: "r7",
    masterId: "mae-chi-ploy",
    userName: "Dao W.",
    rating: 4,
    comment:
      "Very knowledgeable but expensive. The consultation was worth it for my new house though.",
    commentTh:
      "มีความรู้มากแต่แพง อย่างไรก็ตาม การปรึกษาคุ้มค่าสำหรับบ้านใหม่",
    helpful: true,
    createdAt: "2026-02-10",
  },
  {
    id: "r8",
    masterId: "phra-kru-nattapong",
    userName: "Ton A.",
    rating: 5,
    comment:
      "Phra Kru read my palm and told me things about myself that no one else knows. His Buddhist wisdom brought me peace during a very difficult time.",
    commentTh:
      "พระครูดูลายมือแล้วบอกเรื่องที่ไม่มีใครรู้เกี่ยวกับตัวเอง ภูมิปัญญาพุทธของท่านนำความสงบมาให้ในช่วงเวลาที่ยากลำบาก",
    helpful: true,
    createdAt: "2026-03-12",
  },
  {
    id: "r9",
    masterId: "arjan-lek",
    userName: "Mint P.",
    rating: 5,
    comment:
      "Changed my business name based on Arjan Lek's analysis. Business has been booming since! She really knows her numbers.",
    commentTh:
      "เปลี่ยนชื่อธุรกิจตามการวิเคราะห์ของอาจารย์เล็ก ธุรกิจเฟื่องฟูตั้งแต่นั้นมา! เธอเข้าใจเรื่องตัวเลขจริงๆ",
    helpful: true,
    createdAt: "2026-03-01",
  },
  {
    id: "r10",
    masterId: "luang-phi-tham",
    userName: "Jiew N.",
    rating: 5,
    comment:
      "Luang Phi Tham's combined astrology and feng shui reading was the most comprehensive I've ever had. He spent extra time explaining everything.",
    commentTh:
      "การดูดวงผสมฮวงจุ้ยของหลวงพี่ธรรมครอบคลุมที่สุดที่เคยมี ท่านใช้เวลาเพิ่มเติมอธิบายทุกอย่าง",
    helpful: true,
    createdAt: "2026-03-08",
  },
];

export function getMasterById(id: string): Master | undefined {
  return masters.find((m) => m.id === id);
}

export function getReviewsByMasterId(masterId: string): Review[] {
  return reviews.filter((r) => r.masterId === masterId);
}

export function filterMasters(category: string, search: string): Master[] {
  let filtered = masters;

  if (category && category !== "all") {
    filtered = filtered.filter((m) =>
      m.specialty.some((s) => s.toLowerCase().includes(category.toLowerCase()))
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nameTh.includes(q) ||
        m.specialty.some((s) => s.toLowerCase().includes(q)) ||
        m.specialtyTh.some((s) => s.includes(q))
    );
  }

  return filtered;
}
