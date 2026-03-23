export interface ZodiacSign {
  id: string;
  symbol: string;
  name: Record<string, string>;
  dateRange: string;
  element: string;
}

export const zodiacSigns: ZodiacSign[] = [
  { id: "aries", symbol: "♈", name: { en: "Aries", zh: "白羊座", th: "ราศีเมษ", vi: "Bạch Dương", id: "Aries" }, dateRange: "03/21 - 04/19", element: "fire" },
  { id: "taurus", symbol: "♉", name: { en: "Taurus", zh: "金牛座", th: "ราศีพฤษภ", vi: "Kim Ngưu", id: "Taurus" }, dateRange: "04/20 - 05/20", element: "earth" },
  { id: "gemini", symbol: "♊", name: { en: "Gemini", zh: "双子座", th: "ราศีเมถุน", vi: "Song Tử", id: "Gemini" }, dateRange: "05/21 - 06/20", element: "air" },
  { id: "cancer", symbol: "♋", name: { en: "Cancer", zh: "巨蟹座", th: "ราศีกรกฎ", vi: "Cự Giải", id: "Cancer" }, dateRange: "06/21 - 07/22", element: "water" },
  { id: "leo", symbol: "♌", name: { en: "Leo", zh: "狮子座", th: "ราศีสิงห์", vi: "Sư Tử", id: "Leo" }, dateRange: "07/23 - 08/22", element: "fire" },
  { id: "virgo", symbol: "♍", name: { en: "Virgo", zh: "处女座", th: "ราศีกันย์", vi: "Xử Nữ", id: "Virgo" }, dateRange: "08/23 - 09/22", element: "earth" },
  { id: "libra", symbol: "♎", name: { en: "Libra", zh: "天秤座", th: "ราศีตุลย์", vi: "Thiên Bình", id: "Libra" }, dateRange: "09/23 - 10/22", element: "air" },
  { id: "scorpio", symbol: "♏", name: { en: "Scorpio", zh: "天蝎座", th: "ราศีพิจิก", vi: "Bọ Cạp", id: "Scorpio" }, dateRange: "10/23 - 11/21", element: "water" },
  { id: "sagittarius", symbol: "♐", name: { en: "Sagittarius", zh: "射手座", th: "ราศีธนู", vi: "Nhân Mã", id: "Sagitarius" }, dateRange: "11/22 - 12/21", element: "fire" },
  { id: "capricorn", symbol: "♑", name: { en: "Capricorn", zh: "摩羯座", th: "ราศีมังกร", vi: "Ma Kết", id: "Capricorn" }, dateRange: "12/22 - 01/19", element: "earth" },
  { id: "aquarius", symbol: "♒", name: { en: "Aquarius", zh: "水瓶座", th: "ราศีกุมภ์", vi: "Bảo Bình", id: "Aquarius" }, dateRange: "01/20 - 02/18", element: "air" },
  { id: "pisces", symbol: "♓", name: { en: "Pisces", zh: "双鱼座", th: "ราศีมีน", vi: "Song Ngư", id: "Pisces" }, dateRange: "02/19 - 03/20", element: "water" },
];

export function getZodiacByDate(month: number, day: number): ZodiacSign | undefined {
  const dateNum = month * 100 + day;
  if (dateNum >= 321 && dateNum <= 419) return zodiacSigns[0];   // Aries
  if (dateNum >= 420 && dateNum <= 520) return zodiacSigns[1];   // Taurus
  if (dateNum >= 521 && dateNum <= 620) return zodiacSigns[2];   // Gemini
  if (dateNum >= 621 && dateNum <= 722) return zodiacSigns[3];   // Cancer
  if (dateNum >= 723 && dateNum <= 822) return zodiacSigns[4];   // Leo
  if (dateNum >= 823 && dateNum <= 922) return zodiacSigns[5];   // Virgo
  if (dateNum >= 923 && dateNum <= 1022) return zodiacSigns[6];  // Libra
  if (dateNum >= 1023 && dateNum <= 1121) return zodiacSigns[7]; // Scorpio
  if (dateNum >= 1122 && dateNum <= 1221) return zodiacSigns[8]; // Sagittarius
  if (dateNum >= 1222 || dateNum <= 119) return zodiacSigns[9];  // Capricorn
  if (dateNum >= 120 && dateNum <= 218) return zodiacSigns[10];  // Aquarius
  if (dateNum >= 219 && dateNum <= 320) return zodiacSigns[11];  // Pisces
  return undefined;
}

const elementColors: Record<string, string> = {
  fire: "from-red-500/10 to-orange-500/10",
  earth: "from-amber-500/10 to-green-500/10",
  air: "from-sky-500/10 to-indigo-500/10",
  water: "from-blue-500/10 to-cyan-500/10",
};

export function getElementGradient(element: string): string {
  return elementColors[element] || "from-gray-100 to-gray-50";
}
