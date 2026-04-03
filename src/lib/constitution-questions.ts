import type { Locale } from "./i18n";

export interface Question {
  id: number;
  stage: 1 | 2 | 3;
  text: Record<Locale, string>;
  elementWeights: Partial<Record<"木" | "火" | "土" | "金" | "水", number>>;
  constitutionWeights: Partial<Record<string, number>>;
  reverse?: boolean;
}

export const QUESTIONS: Question[] = [
  // === Stage 1: Body Sensations (体感) ===
  {
    id: 1, stage: 1,
    text: {
      zh: "你是否经常感到手脚冰凉？",
      en: "Do you often feel cold in your hands and feet?",
      th: "คุณรู้สึกมือเท้าเย็นบ่อยไหม?",
      vi: "Bạn có thường xuyên cảm thấy tay chân lạnh không?",
      id: "Apakah Anda sering merasa tangan dan kaki dingin?",
    },
    elementWeights: { 火: -1, 水: 0.5 },
    constitutionWeights: { "阳虚": 1.2, "气虚": 0.5 },
  },
  {
    id: 2, stage: 1,
    text: {
      zh: "你是否容易出汗，即使不运动？",
      en: "Do you sweat easily, even without exercise?",
      th: "คุณเหงื่อออกง่ายไหม แม้ไม่ได้ออกกำลังกาย?",
      vi: "Bạn có dễ đổ mồ hôi ngay cả khi không tập thể dục không?",
      id: "Apakah Anda mudah berkeringat meski tanpa olahraga?",
    },
    elementWeights: { 金: -0.5, 水: -0.5 },
    constitutionWeights: { "气虚": 1.0, "阴虚": 0.8 },
  },
  {
    id: 3, stage: 1,
    text: {
      zh: "你是否经常感到精力不足、容易疲倦？",
      en: "Do you often feel low on energy or easily fatigued?",
      th: "คุณรู้สึกเหนื่อยล้าง่ายบ่อยไหม?",
      vi: "Bạn có thường xuyên cảm thấy thiếu năng lượng, dễ mệt mỏi không?",
      id: "Apakah Anda sering merasa kurang energi atau mudah lelah?",
    },
    elementWeights: { 土: -0.5, 火: -0.3 },
    constitutionWeights: { "气虚": 1.2, "阳虚": 0.6 },
  },
  {
    id: 4, stage: 1,
    text: {
      zh: "你是否经常感到口干、想喝水？",
      en: "Do you often feel thirsty or have a dry mouth?",
      th: "คุณรู้สึกปากแห้งหรือกระหายน้ำบ่อยไหม?",
      vi: "Bạn có thường xuyên cảm thấy khô miệng, muốn uống nước không?",
      id: "Apakah Anda sering merasa haus atau mulut kering?",
    },
    elementWeights: { 火: 0.5, 水: -1 },
    constitutionWeights: { "阴虚": 1.2, "湿热": 0.5 },
  },
  {
    id: 5, stage: 1,
    text: {
      zh: "你是否怕热、喜欢凉爽的环境？",
      en: "Do you dislike heat and prefer cool environments?",
      th: "คุณกลัวร้อนและชอบที่เย็นสบายไหม?",
      vi: "Bạn có sợ nóng và thích môi trường mát mẻ không?",
      id: "Apakah Anda tidak tahan panas dan lebih suka lingkungan sejuk?",
    },
    elementWeights: { 火: 0.8, 水: -0.3 },
    constitutionWeights: { "阴虚": 0.8, "湿热": 1.0 },
  },
  {
    id: 6, stage: 1,
    text: {
      zh: "你是否容易怕风、怕冷？",
      en: "Are you sensitive to wind and cold weather?",
      th: "คุณกลัวลมและอากาศหนาวไหม?",
      vi: "Bạn có sợ gió và thời tiết lạnh không?",
      id: "Apakah Anda sensitif terhadap angin dan cuaca dingin?",
    },
    elementWeights: { 金: -0.5, 木: -0.3 },
    constitutionWeights: { "阳虚": 1.0, "气虚": 0.8, "特禀": 0.3 },
  },

  // === Stage 2: Diet & Sleep (饮食睡眠) ===
  {
    id: 7, stage: 2,
    text: {
      zh: "你是否偏好热饮、热食？",
      en: "Do you prefer hot drinks and warm food?",
      th: "คุณชอบเครื่องดื่มร้อนและอาหารอุ่นไหม?",
      vi: "Bạn có thích đồ uống nóng và thức ăn ấm không?",
      id: "Apakah Anda lebih suka minuman panas dan makanan hangat?",
    },
    elementWeights: { 火: -0.5, 水: 0.3 },
    constitutionWeights: { "阳虚": 0.8, "痰湿": 0.3 },
  },
  {
    id: 8, stage: 2,
    text: {
      zh: "你是否容易腹胀、消化不良？",
      en: "Do you often experience bloating or indigestion?",
      th: "คุณมีอาการท้องอืดหรืออาหารไม่ย่อยบ่อยไหม?",
      vi: "Bạn có thường xuyên bị đầy bụng hoặc khó tiêu không?",
      id: "Apakah Anda sering mengalami kembung atau gangguan pencernaan?",
    },
    elementWeights: { 土: -1, 木: 0.3 },
    constitutionWeights: { "气虚": 0.6, "痰湿": 1.0, "湿热": 0.5 },
  },
  {
    id: 9, stage: 2,
    text: {
      zh: "你的食欲是否不稳定（时好时坏）？",
      en: "Is your appetite inconsistent (sometimes good, sometimes poor)?",
      th: "ความอยากอาหารของคุณไม่สม่ำเสมอไหม?",
      vi: "Sự thèm ăn của bạn có không ổn định không?",
      id: "Apakah nafsu makan Anda tidak stabil?",
    },
    elementWeights: { 土: -0.5, 木: 0.5 },
    constitutionWeights: { "气郁": 0.8, "气虚": 0.5 },
  },
  {
    id: 10, stage: 2,
    text: {
      zh: "你是否难以入睡或容易醒来？",
      en: "Do you have trouble falling asleep or wake up easily?",
      th: "คุณนอนหลับยากหรือตื่นง่ายไหม?",
      vi: "Bạn có khó ngủ hoặc dễ tỉnh giấc không?",
      id: "Apakah Anda sulit tidur atau mudah terbangun?",
    },
    elementWeights: { 火: 0.5, 水: -0.5 },
    constitutionWeights: { "阴虚": 1.0, "气郁": 0.6, "血瘀": 0.3 },
  },
  {
    id: 11, stage: 2,
    text: {
      zh: "你是否经常起夜（夜间排尿）？",
      en: "Do you frequently wake up at night to urinate?",
      th: "คุณตื่นขึ้นมาปัสสาวะตอนกลางคืนบ่อยไหม?",
      vi: "Bạn có thường thức dậy ban đêm để đi tiểu không?",
      id: "Apakah Anda sering bangun di malam hari untuk buang air kecil?",
    },
    elementWeights: { 水: -1, 金: -0.3 },
    constitutionWeights: { "阳虚": 1.0, "气虚": 0.5 },
  },
  {
    id: 12, stage: 2,
    text: {
      zh: "你的大便是否偏稀或不成形？",
      en: "Are your stools often loose or poorly formed?",
      th: "อุจจาระของคุณมักจะเหลวหรือไม่เป็นรูปร่างไหม?",
      vi: "Phân của bạn có thường lỏng hoặc không thành khuôn không?",
      id: "Apakah tinja Anda sering encer atau tidak berbentuk?",
    },
    elementWeights: { 土: -1, 水: 0.3 },
    constitutionWeights: { "阳虚": 0.8, "气虚": 0.8, "痰湿": 0.6 },
  },

  // === Stage 3: Emotions & Body (情绪身体) ===
  {
    id: 13, stage: 3,
    text: {
      zh: "你是否容易感到焦虑或烦躁？",
      en: "Do you easily feel anxious or irritable?",
      th: "คุณรู้สึกวิตกกังวลหรือหงุดหงิดง่ายไหม?",
      vi: "Bạn có dễ cảm thấy lo lắng hoặc cáu kỉnh không?",
      id: "Apakah Anda mudah merasa cemas atau mudah tersinggung?",
    },
    elementWeights: { 火: 0.8, 木: 0.5 },
    constitutionWeights: { "阴虚": 0.6, "气郁": 1.0 },
  },
  {
    id: 14, stage: 3,
    text: {
      zh: "你的皮肤是否偏干燥、容易起皮？",
      en: "Is your skin often dry or flaky?",
      th: "ผิวของคุณแห้งหรือเป็นขุยบ่อยไหม?",
      vi: "Da của bạn có thường khô hoặc bong tróc không?",
      id: "Apakah kulit Anda sering kering atau bersisik?",
    },
    elementWeights: { 金: -0.8, 水: -0.5 },
    constitutionWeights: { "阴虚": 0.8, "血瘀": 0.5 },
  },
  {
    id: 15, stage: 3,
    text: {
      zh: "你是否经常感到头晕或头重？",
      en: "Do you often feel dizzy or heavy-headed?",
      th: "คุณรู้สึกเวียนศีรษะหรือหัวหนักบ่อยไหม?",
      vi: "Bạn có thường xuyên cảm thấy chóng mặt hoặc nặng đầu không?",
      id: "Apakah Anda sering merasa pusing atau kepala berat?",
    },
    elementWeights: { 土: -0.3, 水: -0.3 },
    constitutionWeights: { "痰湿": 1.0, "血瘀": 0.6, "气虚": 0.3 },
  },
  {
    id: 16, stage: 3,
    text: {
      zh: "你是否经常感到胸闷或叹气？",
      en: "Do you often feel chest tightness or sigh frequently?",
      th: "คุณรู้สึกแน่นหน้าอกหรือถอนหายใจบ่อยไหม?",
      vi: "Bạn có thường xuyên cảm thấy tức ngực hoặc thở dài không?",
      id: "Apakah Anda sering merasa sesak di dada atau sering menghela nafas?",
    },
    elementWeights: { 木: -0.5, 金: -0.3 },
    constitutionWeights: { "气郁": 1.2, "血瘀": 0.5 },
  },
  {
    id: 17, stage: 3,
    text: {
      zh: "你运动后是否恢复很慢、容易受伤？",
      en: "Do you recover slowly after exercise or get injured easily?",
      th: "คุณฟื้นตัวช้าหลังออกกำลังกายหรือบาดเจ็บง่ายไหม?",
      vi: "Bạn có hồi phục chậm sau khi tập thể dục hoặc dễ bị chấn thương không?",
      id: "Apakah Anda lambat pulih setelah olahraga atau mudah cedera?",
    },
    elementWeights: { 木: -0.8, 金: -0.3 },
    constitutionWeights: { "气虚": 0.8, "血瘀": 0.8, "阳虚": 0.3 },
  },
  {
    id: 18, stage: 3,
    text: {
      zh: "你是否容易过敏（花粉、食物、药物等）？",
      en: "Do you have allergies (pollen, food, medication, etc.)?",
      th: "คุณมีอาการแพ้ (ละอองเกสร อาหาร ยา ฯลฯ) ไหม?",
      vi: "Bạn có bị dị ứng (phấn hoa, thực phẩm, thuốc, v.v.) không?",
      id: "Apakah Anda memiliki alergi (serbuk sari, makanan, obat, dll.)?",
    },
    elementWeights: { 金: -0.5, 木: -0.3 },
    constitutionWeights: { "特禀": 1.5, "气虚": 0.3 },
  },
];

/** Five-level scale labels per locale */
export const SCALE_LABELS: Record<Locale, string[]> = {
  zh: ["从不", "很少", "有时", "经常", "总是"],
  en: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  th: ["ไม่เคย", "นานๆ ครั้ง", "บางครั้ง", "บ่อย", "เสมอ"],
  vi: ["Không bao giờ", "Hiếm khi", "Đôi khi", "Thường xuyên", "Luôn luôn"],
  id: ["Tidak pernah", "Jarang", "Kadang", "Sering", "Selalu"],
};

/** Stage labels per locale */
export const STAGE_LABELS: Record<Locale, string[]> = {
  zh: ["基础体感", "饮食睡眠", "情绪身体"],
  en: ["Body Sensations", "Diet & Sleep", "Emotions & Body"],
  th: ["ความรู้สึกทางกาย", "อาหารและการนอน", "อารมณ์และร่างกาย"],
  vi: ["Cảm giác cơ thể", "Ăn uống & Giấc ngủ", "Cảm xúc & Cơ thể"],
  id: ["Sensasi Tubuh", "Diet & Tidur", "Emosi & Tubuh"],
};
