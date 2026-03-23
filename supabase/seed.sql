-- ============================================
-- TrustMaster Seed Data
-- ============================================

INSERT INTO masters (id, name, name_th, avatar_emoji, specialty, specialty_th, description, description_th, experience, rating, review_count, satisfaction_score, verified, price_min, price_max, line_id, location, location_th, languages, availability) VALUES
('ajahn-somchai', 'Ajahn Somchai', 'อาจารย์สมชาย', '🔮',
 ARRAY['Astrology', 'Thai Numerology'], ARRAY['โหราศาสตร์', 'เลขศาสตร์ไทย'],
 'Ajahn Somchai has been practicing Thai astrology for over 15 years. Known for his precise birth chart readings and life direction guidance. Former monk who studied under the renowned Luang Phor Koon lineage.',
 'อาจารย์สมชายมีประสบการณ์ด้านโหราศาสตร์ไทยมากกว่า 15 ปี เป็นที่รู้จักในเรื่องการดูดวงชะตาที่แม่นยำและการให้คำแนะนำทิศทางชีวิต เคยบวชเรียนศึกษาในสายหลวงพ่อคูณ',
 15, 4.9, 328, 92, TRUE, 500, 900, 'ajahn.somchai', 'Bangkok, Silom', 'กรุงเทพฯ สีลม', ARRAY['Thai', 'English'], 'Mon-Sat 10:00-18:00'),

('kruba-wan', 'Kruba Wan', 'ครูบาวรรณ', '🃏',
 ARRAY['Tarot', 'Love & Relationships'], ARRAY['ไพ่ทาโรต์', 'ความรัก & ความสัมพันธ์'],
 'Kruba Wan specializes in tarot readings focused on love and relationships. Her warm and empathetic approach has helped thousands of clients navigate their emotional lives. She combines Western tarot with Thai spiritual insights.',
 'ครูบาวรรณเชี่ยวชาญการดูไพ่ทาโรต์โดยเฉพาะเรื่องความรักและความสัมพันธ์ ด้วยความอบอุ่นและเข้าใจ ช่วยเหลือลูกค้านับพันในการนำทางชีวิตทางอารมณ์ ผสมผสานไพ่ทาโรต์ตะวันตกกับภูมิปัญญาทางจิตวิญญาณไทย',
 8, 4.7, 156, 88, TRUE, 350, 700, 'kruba.wan', 'Bangkok, Chatuchak', 'กรุงเทพฯ จตุจักร', ARRAY['Thai'], 'Tue-Sun 09:00-17:00'),

('mae-chi-ploy', 'Mae Chi Ploy', 'แม่ชีพลอย', '🌚',
 ARRAY['Feng Shui', 'Business Fortune'], ARRAY['ฮวงจุ้ย', 'ดวงธุรกิจ'],
 'Mae Chi Ploy is a former Buddhist nun turned feng shui master. She specializes in business fortune readings and office/home feng shui consultations. Her clients include several successful Thai entrepreneurs.',
 'แม่ชีพลอยเป็นอดีตแม่ชีที่ผันตัวมาเป็นอาจารย์ฮวงจุ้ย เชี่ยวชาญการดูดวงธุรกิจและฮวงจุ้ยสำนักงาน/บ้าน ลูกค้ารวมถึงผู้ประกอบการไทยที่ประสบความสำเร็จหลายคน',
 20, 4.8, 214, 95, TRUE, 800, 1500, 'maechi.ploy', 'Bangkok, Sukhumvit', 'กรุงเทพฯ สุขุมวิท', ARRAY['Thai', 'Chinese', 'English'], 'Mon-Fri 10:00-16:00'),

('phra-kru-nattapong', 'Phra Kru Nattapong', 'พระครูณัฐพงษ์', '☸',
 ARRAY['Palmistry', 'Life Direction'], ARRAY['ดูลายมือ', 'ทิศทางชีวิต'],
 'Phra Kru Nattapong combines traditional palmistry with Buddhist philosophy. His readings focus on understanding one''s life path and making wise decisions. Known for his calming presence and thoughtful guidance.',
 'พระครูณัฐพงษ์ผสมผสานการดูลายมือแบบดั้งเดิมกับปรัชญาพุทธ การดูดวงเน้นการเข้าใจเส้นทางชีวิตและการตัดสินใจอย่างชาญฉลาด เป็นที่รู้จักในเรื่องความสงบและการให้คำแนะนำอย่างรอบคอบ',
 12, 4.6, 89, 85, TRUE, 450, 800, 'phrakru.nattapong', 'Bangkok, Thonburi', 'กรุงเทพฯ ธนบุรี', ARRAY['Thai'], 'Wed-Sun 08:00-15:00'),

('arjan-lek', 'Arjan Lek', 'อาจารย์เล็ก', '⭐',
 ARRAY['Numerology', 'Name Analysis'], ARRAY['เลขศาสตร์', 'วิเคราะห์ชื่อ'],
 'Arjan Lek is a numerology expert who specializes in name analysis and lucky number consultations. Many clients credit her with helping them choose auspicious names for businesses and children.',
 'อาจารย์เล็กเป็นผู้เชี่ยวชาญด้านเลขศาสตร์ เชี่ยวชาญการวิเคราะห์ชื่อและให้คำปรึกษาเลขมงคล ลูกค้าหลายคนให้เครดิตในการช่วยเลือกชื่อมงคลสำหรับธุรกิจและบุตร',
 10, 4.5, 67, 82, TRUE, 300, 600, 'arjan.lek', 'Bangkok, Ratchada', 'กรุงเทพฯ รัชดา', ARRAY['Thai', 'English'], 'Mon-Sat 11:00-19:00'),

('luang-phi-tham', 'Luang Phi Tham', 'หลวงพี่ธรรม', '🪷',
 ARRAY['Astrology', 'Feng Shui'], ARRAY['โหราศาสตร์', 'ฮวงจุ้ย'],
 'Luang Phi Tham combines Thai astrology with feng shui to provide holistic life guidance. His unique approach integrates birth chart analysis with spatial energy readings for homes and businesses.',
 'หลวงพี่ธรรมผสมผสานโหราศาสตร์ไทยกับฮวงจุ้ยเพื่อให้คำแนะนำชีวิตแบบองค์รวม แนวทางเฉพาะตัวผสมผสานการวิเคราะห์ดวงชะตากับการอ่านพลังงานเชิงพื้นที่สำหรับบ้านและธุรกิจ',
 18, 4.8, 195, 91, TRUE, 600, 1200, 'luangphi.tham', 'Bangkok, Bangna', 'กรุงเทพฯ บางนา', ARRAY['Thai', 'English'], 'Tue-Sat 09:00-17:00')

ON CONFLICT (id) DO NOTHING;

-- Seed reviews (user_id is NULL for seed data)
INSERT INTO reviews (id, master_id, user_name, rating, comment, comment_th, created_at) VALUES
('r1', 'ajahn-somchai', 'Nong Pim', 5,
 'Ajahn predicted my promotion exactly. He said March would bring career changes and it happened! Very accurate and kind.',
 'อาจารย์ทำนายเรื่องเลื่อนตำแหน่งได้แม่นเป๊ะ บอกว่าเดือนมีนาจะมีการเปลี่ยนแปลงในอาชีพ และมันเกิดขึ้นจริง! แม่นมากและใจดี',
 '2026-03-07'),

('r2', 'ajahn-somchai', 'Krit T.', 5,
 'My 3rd consultation. Every time Ajahn gives me clarity when I feel lost. Worth every baht.',
 'ปรึกษาครั้งที่ 3 แล้ว ทุกครั้งอาจารย์ให้ความชัดเจนเมื่อรู้สึกหลงทาง คุ้มค่าทุกบาท',
 '2026-02-20'),

('r3', 'ajahn-somchai', 'Som O.', 4,
 'Good reading but session felt rushed. Would prefer a 45 min option.',
 'ดูดวงดี แต่รู้สึกเร่งรีบ อยากให้มีตัวเลือก 45 นาที',
 '2026-02-15'),

('r4', 'kruba-wan', 'Ploy K.', 5,
 'Kruba Wan helped me understand my relationship patterns. Her tarot reading was spot on about my ex. I finally feel at peace.',
 'ครูบาวรรณช่วยให้เข้าใจรูปแบบความสัมพันธ์ของตัวเอง ไพ่ทาโรต์ที่เปิดตรงเป๊ะเรื่องแฟนเก่า ในที่สุดก็รู้สึกสงบ',
 '2026-03-10'),

('r5', 'kruba-wan', 'Bam S.', 5,
 'So warm and understanding. She doesn''t just read cards — she truly listens. I cried and felt so much better after.',
 'อบอุ่นและเข้าใจมาก ไม่ใช่แค่ดูไพ่ แต่ตั้งใจฟังจริงๆ ร้องไห้ออกมาและรู้สึกดีขึ้นมากหลังจากนั้น',
 '2026-02-28'),

('r6', 'mae-chi-ploy', 'Khun Chai', 5,
 'After Mae Chi Ploy rearranged my office feng shui, my business revenue increased 30% in 2 months. Not kidding.',
 'หลังจากแม่ชีพลอยจัดฮวงจุ้ยสำนักงานใหม่ รายได้ธุรกิจเพิ่มขึ้น 30% ใน 2 เดือน ไม่ได้พูดเล่น',
 '2026-03-05'),

('r7', 'mae-chi-ploy', 'Dao W.', 4,
 'Very knowledgeable but expensive. The consultation was worth it for my new house though.',
 'มีความรู้มากแต่แพง อย่างไรก็ตาม การปรึกษาคุ้มค่าสำหรับบ้านใหม่',
 '2026-02-10'),

('r8', 'phra-kru-nattapong', 'Ton A.', 5,
 'Phra Kru read my palm and told me things about myself that no one else knows. His Buddhist wisdom brought me peace during a very difficult time.',
 'พระครูดูลายมือแล้วบอกเรื่องที่ไม่มีใครรู้เกี่ยวกับตัวเอง ภูมิปัญญาพุทธของท่านนำความสงบมาให้ในช่วงเวลาที่ยากลำบาก',
 '2026-03-12'),

('r9', 'arjan-lek', 'Mint P.', 5,
 'Changed my business name based on Arjan Lek''s analysis. Business has been booming since! She really knows her numbers.',
 'เปลี่ยนชื่อธุรกิจตามการวิเคราะห์ของอาจารย์เล็ก ธุรกิจเฟื่องฟูตั้งแต่นั้นมา! เธอเข้าใจเรื่องตัวเลขจริงๆ',
 '2026-03-01'),

('r10', 'luang-phi-tham', 'Jiew N.', 5,
 'Luang Phi Tham''s combined astrology and feng shui reading was the most comprehensive I''ve ever had. He spent extra time explaining everything.',
 'การดูดวงผสมฮวงจุ้ยของหลวงพี่ธรรมครอบคลุมที่สุดที่เคยมี ท่านใช้เวลาเพิ่มเติมอธิบายทุกอย่าง',
 '2026-03-08')

ON CONFLICT (id) DO NOTHING;
