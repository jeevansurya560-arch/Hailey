-- ============================================================
-- 0017_seed_festivals.sql
-- Seeds the festivals and festival_occurrences tables with
-- verified global festival data matching the VERIFIED_FESTIVALS
-- static fallback dataset in shared/data/culturalDatasets.js
--
-- Total unique festivals: 45
-- Covers all 11 years (2025–2035) with normalized occurrence models.
-- ============================================================

BEGIN;

DO $$
DECLARE
  v_id uuid;
BEGIN

  -- ── 1. Chinese New Year (Spring Festival) ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'chinese-new-year-spring-festival',
    'Chinese New Year (Spring Festival)',
    '{"Chūnjié","Lunar New Year","Tết Nguyên Đán","Seollal","Losar"}',
    'China — Shang Dynasty (circa 1600–1046 BCE)',
    '{"China","Taiwan","Singapore","Malaysia","Vietnam","South Korea","Indonesia","Thailand","Global Diaspora"}',
    '{"East Asia","Southeast Asia","Global Chinese Diaspora"}',
    1, 'lunisolar_chinese',
    'The most important festival in Chinese culture, marking the new agricultural year with family reunion, ancestral veneration, and the expulsion of the mythical beast Nian. The 15-day celebration is centered on renewal, luck, and intergenerational bonds.',
    'Rooted in Shang Dynasty sacrificial rites honoring ancestors and heavenly deities at the turn of the farming season. The word "Nian" (year) derives from an ancient monster legend that was warded off with red color and loud noise — the origin of firecrackers and red decorations.',
    '{"Thorough pre-festival home cleaning (sweeping away misfortune)","Affixing red spring couplets (chunlian) and paper-cut art to entryways","Reunion dinner (Nian Ye Fan) on New Year''s Eve with symbolic dishes","Lighting firecrackers at midnight to ward off evil spirits","Presenting red envelopes (hongbao) to children and unmarried relatives","Lion and dragon dance performances through communities"}',
    '{"Jiaozi dumplings (shaped like silver ingots)","Niangao glutinous rice cake","Whole steamed fish (abundance)","Tangyuan sweet rice balls"}',
    '{"Qipao / Cheongsam","Tangzhuang silk jacket","Hanbok (Korea)","Áo Dài (Vietnam)"}',
    '{"Lion dance drum cadence","Guzheng melodies","Erhu fiddle","Festive brass cymbals"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-01-29', '2025-02-12', 'Year of the Wood Snake; 15-day festival', true),
      (v_id, 2026, '2026-02-17', '2026-03-03', 'Year of the Fire Horse', true),
      (v_id, 2027, '2027-02-06', '2027-02-20', 'Year of the Fire Goat', true),
      (v_id, 2028, '2028-01-26', '2028-02-09', 'Year of the Earth Monkey (approximate)', false),
      (v_id, 2029, '2029-02-13', '2029-02-27', 'Year of the Earth Rooster (approximate)', false),
      (v_id, 2030, '2030-02-03', '2030-02-17', 'Year of the Metal Dog (approximate)', false),
      (v_id, 2031, '2031-01-23', '2031-02-06', 'Year of the Metal Pig (approximate)', false),
      (v_id, 2032, '2032-02-11', '2032-02-25', 'Year of the Water Rat (approximate)', false),
      (v_id, 2033, '2033-01-31', '2033-02-14', 'Year of the Water Ox (approximate)', false),
      (v_id, 2034, '2034-02-19', '2034-03-05', 'Year of the Wood Tiger (approximate)', false),
      (v_id, 2035, '2035-02-08', '2035-02-22', 'Year of the Wood Rabbit (approximate)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 2. Lantern Festival ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'lantern-festival-yuanxiao',
    'Lantern Festival',
    '{"Yuánxiāo Jié","Shang Yuan Festival","Yuan Xiao"}',
    'China — Han Dynasty (206 BCE – 220 CE)',
    '{"China","Taiwan","Singapore","Malaysia","Vietnam"}',
    '{"East Asia","Southeast Asia"}',
    2, 'lunisolar_chinese',
    'Marks the end of Chinese New Year celebrations on the 15th day of the first lunar month, when the first full moon of the new year rises. Celebrated with lantern displays, riddle-solving, and tangyuan sweet rice balls.',
    'Originated during the Han Dynasty with Taoist and Buddhist influences. Emperor Ming of Han ordered palace lanterns lit in honor of the Buddha on this night. Folk traditions added riddle-solving contests attached to lanterns.',
    '{"Lantern displays and parades","Solving lantern riddles (cai deng mi)","Eating tangyuan rice balls","Dragon and lion dance performances"}',
    '{"Tangyuan (glutinous rice balls with sesame or sweet filling)","Yuanxiao (northern-style rolled rice balls)"}',
    '{"Traditional Chinese garments","Festival costumes"}',
    '{"Guqin","Erhu","Percussion ensemble"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-02-12', '2025-02-12', '15th day of 1st lunar month', true),
      (v_id, 2026, '2026-03-03', '2026-03-03', '15th day of 1st lunar month', true),
      (v_id, 2027, '2027-02-20', '2027-02-20', '15th day of 1st lunar month', true),
      (v_id, 2028, '2028-02-09', '2028-02-09', 'Approximate — 15th of 1st lunar month', false),
      (v_id, 2029, '2029-02-27', '2029-02-27', 'Approximate', false),
      (v_id, 2030, '2030-02-17', '2030-02-17', 'Approximate', false),
      (v_id, 2031, '2031-02-06', '2031-02-06', '15th day of 1st lunar month (calculated)', false),
      (v_id, 2032, '2032-02-25', '2032-02-25', '15th day of 1st lunar month (calculated)', false),
      (v_id, 2033, '2033-02-14', '2033-02-14', '15th day of 1st lunar month (calculated)', false),
      (v_id, 2034, '2034-03-05', '2034-03-05', '15th day of 1st lunar month (calculated)', false),
      (v_id, 2035, '2035-02-22', '2035-02-22', '15th day of 1st lunar month (calculated)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 3. Qingming Festival ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'qingming-festival',
    'Qingming Festival',
    '{"Clear and Bright Festival","Tomb Sweeping Day","Ching Ming"}',
    'China — Tang Dynasty (618–907 CE)',
    '{"China","Taiwan","Singapore","Malaysia","Hong Kong"}',
    '{"East Asia","Southeast Asia"}',
    4, 'solar_term',
    'A day of ancestral veneration when families visit and tend to the graves of their deceased relatives. Also a spring celebration of new life, featuring outdoor activities and flying kites.',
    'Combines elements of the ancient Hanshi Festival (Cold Food Festival) with the solar term Qingming. Institutionalized during the Tang Dynasty when Emperor Xuanzong declared it a national holiday for tomb-visiting.',
    '{"Grave sweeping (sǎomù) and cleaning","Burning paper money and offerings","Leaving food, flowers, and incense at graves","Flying kites (releasing the spirit)","Spring outings and picnics"}',
    '{"Qingtuan (green glutinous rice cakes with red bean paste)","Cold foods (honoring the Hanshi tradition)","Spring greens"}',
    '{"Mourning-appropriate attire; informal spring clothing for outdoor activities"}',
    '{"Solemn folk melodies","Traditional spring songs"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-04-04', '2025-04-04', 'Solar term: 15° of the Sun; public holiday in China/Taiwan/Hong Kong', true),
      (v_id, 2026, '2026-04-05', '2026-04-05', 'Solar term (typically April 4–6)', true),
      (v_id, 2027, '2027-04-05', '2027-04-05', 'Solar term (typically April 4–6)', true),
      (v_id, 2028, '2028-04-04', '2028-04-04', 'Solar term', true),
      (v_id, 2029, '2029-04-04', '2029-04-04', 'Solar term', true),
      (v_id, 2030, '2030-04-05', '2030-04-05', 'Solar term', true),
      (v_id, 2031, '2031-04-05', '2031-04-05', 'Solar term', false),
      (v_id, 2032, '2032-04-04', '2032-04-04', 'Solar term', false),
      (v_id, 2033, '2033-04-04', '2033-04-04', 'Solar term', false),
      (v_id, 2034, '2034-04-05', '2034-04-05', 'Solar term', false),
      (v_id, 2035, '2035-04-05', '2035-04-05', 'Solar term', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 4. Dragon Boat Festival ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'dragon-boat-festival',
    'Dragon Boat Festival',
    '{"Duānwǔ Jié","Tuen Ng Festival","Che-yok (Korea)"}',
    'China — Warring States Period (475–221 BCE)',
    '{"China","Taiwan","Hong Kong","Singapore","Malaysia","South Korea"}',
    '{"East Asia","Southeast Asia"}',
    6, 'lunisolar_chinese',
    'Commemorates the patriotic poet Qu Yuan who drowned himself in the Miluo River in 278 BCE upon his country''s fall to invaders. Dragon boat races and eating zongzi rice dumplings are the central traditions.',
    'The festival''s link to Qu Yuan is the most widely accepted origin story. Villagers raced boats to find his body and threw rice dumplings into the river to prevent fish from consuming him. The festival is inscribed on UNESCO''s Representative List of Intangible Cultural Heritage (2009).',
    '{"Dragon boat racing","Eating zongzi","Hanging mugwort and calamus","Wearing colorful silk sachets (xiangbao)","Drinking realgar wine (historical)"}',
    '{"Zongzi (sticky rice with fillings wrapped in bamboo or reed leaves)","Salted duck eggs","Realgar wine (historical)"}',
    '{"Traditional festival wear; dragon boat teams wear matching racing gear"}',
    '{"Dragon boat drumming","Traditional gong and cymbal ensemble"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-05-31', '2025-05-31', '5th day of 5th lunar month; UNESCO ICH inscribed', true),
      (v_id, 2026, '2026-06-19', '2026-06-19', '5th day of 5th lunar month', true),
      (v_id, 2027, '2027-06-09', '2027-06-09', '5th day of 5th lunar month', true),
      (v_id, 2028, '2028-06-26', '2028-06-26', 'Approximate — 5th of 5th lunar month', false),
      (v_id, 2029, '2029-06-16', '2029-06-16', 'Approximate', false),
      (v_id, 2030, '2030-06-05', '2030-06-05', 'Approximate', false),
      (v_id, 2031, '2031-06-24', '2031-06-24', '5th day of 5th lunar month (calculated)', false),
      (v_id, 2032, '2032-06-12', '2032-06-12', '5th day of 5th lunar month (calculated)', false),
      (v_id, 2033, '2033-06-01', '2033-06-01', '5th day of 5th lunar month (calculated)', false),
      (v_id, 2034, '2034-06-20', '2034-06-20', '5th day of 5th lunar month (calculated)', false),
      (v_id, 2035, '2035-06-10', '2035-06-10', '5th day of 5th lunar month (calculated)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 5. Mid-Autumn Festival ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'mid-autumn-festival',
    'Mid-Autumn Festival',
    '{"Zhōngqiū Jié","Moon Festival","Chuseok (Korea)","Tết Trung Thu (Vietnam)"}',
    'China — Tang Dynasty (618–907 CE)',
    '{"China","Taiwan","Singapore","Malaysia","Vietnam","South Korea","Japan"}',
    '{"East Asia","Southeast Asia"}',
    9, 'lunisolar_chinese',
    'A harvest festival celebrated on the 15th day of the 8th lunar month when the full moon is brightest. Families gather to admire the moon, eat mooncakes, and give thanks for the harvest. Associated with the myth of Chang''e, the Moon Goddess.',
    'Celebrated since the Zhou Dynasty as a moon worship ceremony. Formalized as a festival during the Tang Dynasty. The mooncake tradition is connected to a legend of hiding revolutionary messages inside cakes during Yuan Dynasty resistance.',
    '{"Family moon-gazing (赏月)","Eating mooncakes","Lantern displays","Offering food to the Moon Goddess","In Korea: ancestral rite (charye) and folk games (ganggangsullae)"}',
    '{"Mooncakes (lotus seed paste, red bean, or egg yolk filling)","Pomelos","Taro","Persimmons"}',
    '{"Traditional Chinese garments","Hanbok (Korea)","Áo Dài (Vietnam)"}',
    '{"Traditional guqin and guzheng","Folk songs about the moon"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-10-06', '2025-10-06', '15th day of 8th lunar month; Chuseok: Oct 5–7', true),
      (v_id, 2026, '2026-09-25', '2026-09-25', '15th day of 8th lunar month', true),
      (v_id, 2027, '2027-09-15', '2027-09-15', '15th day of 8th lunar month', true),
      (v_id, 2028, '2028-10-03', '2028-10-03', 'Approximate', false),
      (v_id, 2029, '2029-09-22', '2029-09-22', 'Approximate', false),
      (v_id, 2030, '2030-09-12', '2030-09-12', 'Approximate', false),
      (v_id, 2031, '2031-10-01', '2031-10-01', '15th day of 8th lunar month (calculated)', false),
      (v_id, 2032, '2032-09-19', '2032-09-19', '15th day of 8th lunar month (calculated)', false),
      (v_id, 2033, '2033-10-08', '2033-10-08', '15th day of 8th lunar month (calculated)', false),
      (v_id, 2034, '2034-09-27', '2034-09-27', '15th day of 8th lunar month (calculated)', false),
      (v_id, 2035, '2035-09-16', '2035-09-16', '15th day of 8th lunar month (calculated)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 6. Hungry Ghost Festival ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'hungry-ghost-festival',
    'Hungry Ghost Festival',
    '{"Zhōngyuán Jié","Ghost Month","Ullambana (Buddhist)","Obon (Japan)"}',
    'China — Blending of Taoist and Buddhist traditions',
    '{"China","Taiwan","Singapore","Malaysia","Hong Kong"}',
    '{"East Asia","Southeast Asia"}',
    8, 'lunisolar_chinese',
    'During the seventh lunar month, the gates of the spirit realm are believed to open, allowing deceased ancestors and wandering spirits to visit the living. The living offer food, paper goods, and prayers to appease the hungry ghosts.',
    'Combines the Taoist Zhongyuan Festival (honoring the Earth Official and deceased souls) with the Buddhist Ullambana ceremony commemorating Mulian rescuing his mother from hell. Both traditions merged into a distinctly Chinese folk practice.',
    '{"Burning joss paper and paper offerings","Setting food offerings on altars","Floating river lanterns to guide spirits","Getai (outdoor stage performances for spirits and living)","Chanting sutras and releasing birds"}',
    '{"Prepared dishes set on outdoor altars","Rice, fruits, meats as offerings"}',
    '{"Mourning white or subdued colors near grave sites"}',
    '{"Getai popular music (live concerts for the departed)","Buddhist chanting (sutra recitation)"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-08-02', '2025-08-31', 'Full 7th lunar month; Ghost Festival peak on 15th (Aug 16)', true),
      (v_id, 2026, '2026-08-21', '2026-09-19', 'Full 7th lunar month; peak on Sept 4 (15th of month)', true),
      (v_id, 2027, '2027-08-11', '2027-09-08', 'Full 7th lunar month', true),
      (v_id, 2028, '2028-08-29', '2028-09-26', 'Approximate', false),
      (v_id, 2029, '2029-08-24', '2029-08-24', '15th day of 7th lunar month (calculated)', false),
      (v_id, 2030, '2030-08-13', '2030-08-13', '15th day of 7th lunar month (calculated)', false),
      (v_id, 2031, '2031-09-02', '2031-09-02', '15th day of 7th lunar month (calculated)', false),
      (v_id, 2032, '2032-08-20', '2032-08-20', '15th day of 7th lunar month (calculated)', false),
      (v_id, 2033, '2033-08-10', '2033-08-10', '15th day of 7th lunar month (calculated)', false),
      (v_id, 2034, '2034-08-29', '2034-08-29', '15th day of 7th lunar month (calculated)', false),
      (v_id, 2035, '2035-08-18', '2035-08-18', '15th day of 7th lunar month (calculated)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 7. Diwali (Deepavali) ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'diwali-deepavali',
    'Diwali (Deepavali)',
    '{"Festival of Lights","Deepavali"}',
    'Ancient Indian Subcontinent',
    '{"India","Nepal","Fiji","Mauritius","Guyana","Trinidad & Tobago","Singapore","Malaysia","Sri Lanka"}',
    '{"South Asia","Southeast Asia","Global Indian Diaspora"}',
    10, 'lunar_hindu',
    'The spiritual victory of light over darkness, good over evil, and knowledge over ignorance. For Hindus, associated with Lakshmi''s blessing; for Sikhs, Guru Hargobind''s release from prison; for Jains, Mahavira''s nirvana.',
    'Recorded in Sanskrit texts including the Skanda Purana and Padma Purana dating back over two millennia. The celebration varies significantly by region and religion, but unifies millions through the lighting of diyas.',
    '{"Lighting clay diya lamps with sesame or mustard oil","Elaborate floor Rangoli using colored powders and flower petals","Lakshmi and Ganesha evening Puja with sacred chanting","Exchange of homemade mithai sweets and festive gifts","Fireworks and sparklers (regional)"}',
    '{"Kaju Katli","Gulab Jamun","Chivda savory mix","Besan Ladoo","Barfi"}',
    '{"Embroidered silk Kurta-pyjama","Kanjeevaram and Banarasi sarees with zari borders"}',
    '{"Devotional Bhajans","Carnatic and Hindustani Ragas","Folk Dhol rhythms"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-10-20', '2025-10-24', 'Kartik Amavasya main night Oct 20', true),
      (v_id, 2026, '2026-11-08', '2026-11-12', 'Main Deepavali night Nov 08', true),
      (v_id, 2027, '2027-10-29', '2027-11-02', 'Main Deepavali night Oct 29', true),
      (v_id, 2028, '2028-10-17', '2028-10-21', 'Approximate — Kartik Amavasya', false),
      (v_id, 2029, '2029-11-05', '2029-11-09', 'Approximate', false),
      (v_id, 2030, '2030-10-26', '2030-10-30', 'Approximate', false),
      (v_id, 2031, '2031-11-14', '2031-11-18', 'Kartika Amavasya (calculated lunisolar)', false),
      (v_id, 2032, '2032-11-02', '2032-11-06', 'Kartika Amavasya (calculated lunisolar)', false),
      (v_id, 2033, '2033-10-22', '2033-10-26', 'Kartika Amavasya (calculated lunisolar)', false),
      (v_id, 2034, '2034-11-10', '2034-11-14', 'Kartika Amavasya (calculated lunisolar)', false),
      (v_id, 2035, '2035-10-30', '2035-11-03', 'Kartika Amavasya (calculated lunisolar)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 8. Holi ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'holi-festival-of-colors',
    'Holi',
    '{"Festival of Colors","Festival of Spring","Festival of Love"}',
    'Ancient Indian Subcontinent',
    '{"India","Nepal","Bangladesh","Pakistan","Fiji","Mauritius","Trinidad","Suriname"}',
    '{"South Asia","Global Hindu Diaspora"}',
    3, 'lunar_hindu',
    'Celebrates the victory of devotion over evil (Prahlada over Holika), the arrival of spring, and the playful divine love of Krishna and Radha. The throwing of colored powders (gulal) represents joy and equality.',
    'Ancient texts including the Narada Purana and Bhavishya Purana describe an early form of Holi. The bonfire night (Holika Dahan) commemorates the demon Holika''s defeat. Regional variations across India reflect diverse mythological associations.',
    '{"Holika Dahan bonfire on the eve of Holi","Throwing colored powder (gulal) at revelers","Water gun and water balloon fights","Singing and dancing in the streets","Applying color to elders'' feet as blessing"}',
    '{"Gujiya sweet dumplings","Thandai spiced milk drink","Dahi Bhalla","Puran Poli"}',
    '{"White clothes (to show off colors)","Old clothes that can be stained"}',
    '{"Folk Holi songs (Phag)","Dhol drums and folk singing","Bollywood festival songs"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-03-14', '2025-03-14', 'Phalguna Purnima; Holika Dahan March 13', true),
      (v_id, 2026, '2026-03-03', '2026-03-03', 'Phalguna Purnima; Holika Dahan March 02', true),
      (v_id, 2027, '2027-03-22', '2027-03-22', 'Phalguna Purnima', true),
      (v_id, 2028, '2028-03-11', '2028-03-11', 'Approximate', false),
      (v_id, 2029, '2029-03-30', '2029-03-30', 'Approximate', false),
      (v_id, 2030, '2030-03-19', '2030-03-19', 'Approximate', false),
      (v_id, 2031, '2031-03-08', '2031-03-09', 'Phalguna Purnima (calculated lunisolar)', false),
      (v_id, 2032, '2032-03-27', '2032-03-28', 'Phalguna Purnima (calculated lunisolar)', false),
      (v_id, 2033, '2033-03-16', '2033-03-17', 'Phalguna Purnima (calculated lunisolar)', false),
      (v_id, 2034, '2034-03-05', '2034-03-06', 'Phalguna Purnima (calculated lunisolar)', false),
      (v_id, 2035, '2035-03-24', '2035-03-25', 'Phalguna Purnima (calculated lunisolar)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 9. Navratri ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'navratri',
    'Navratri',
    '{"Sharad Navratri","Shardiya Navratri","Nine Nights","Navaratri","Durga Puja (Eastern India)"}',
    'Ancient Indian Subcontinent',
    '{"India","Nepal","Bangladesh","Fiji","Mauritius","Guyana","Trinidad and Tobago"}',
    '{"South Asia","Global Hindu Diaspora"}',
    10, 'lunar_hindu',
    'Nine sacred nights dedicated to worshipping Goddess Durga (Shakti) in her nine manifestations (Navadurga), celebrating cosmic victory over the buffalo demon Mahishasura. Culminates on the tenth day as Vijayadashami / Dussehra.',
    'Rooted in ancient Vedic and Puranic traditions, detailed in the Devi Mahatmya of the Markandeya Purana. Celebrated during the bright fortnight (Shukla Paksha) of the lunar month of Ashvin. Regional observances include Garba and Dandiya Raas in Western India, Kolu doll displays in Southern India, and grand community pandals across Bengal.',
    '{"Ghatasthapana / Kalash Sthapana (sacred pot invocation on Day 1)","Daily worship of the nine Navadurga manifestations","Community Garba and Dandiya Raas folk circle dances","Kanya Puja / Kumari Puja (worship of young girls as manifestations of the divine feminine)","Vijayadashami / Dussehra culmination and immersion ceremonies"}',
    '{"Sabudana Khichdi (vrat fasting food)","Rajgira Ladoo","Singhara flour puris","Makhana Kheer","Prasadam fruits and sweets"}',
    '{"Traditional Chaniya Choli with mirrorwork (Gujarat)","Garad and Dhakai Jamdani saris (Bengal)","Nine auspicious colors designated for each day"}',
    '{"Garba folk songs and dhol percussion","Dandiya rhythms","Bengali Dhak drumming","Devotional Mahishasura Mardini Stotram hymns"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-09-22', '2025-10-02', 'Shardiya Navratri; Ghatasthapana Sep 22; Dussehra Oct 2', true),
      (v_id, 2026, '2026-10-11', '2026-10-20', 'Shardiya Navratri; Ghatasthapana Oct 11; Vijayadashami Oct 20 (verified by Drik Panchang, Times of India, Indian Express)', true),
      (v_id, 2027, '2027-09-30', '2027-10-09', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2028, '2028-10-19', '2028-10-27', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2029, '2029-10-08', '2029-10-17', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2030, '2030-09-27', '2030-10-06', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2031, '2031-10-16', '2031-10-25', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2032, '2032-10-04', '2032-10-13', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2033, '2033-09-24', '2033-10-03', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2034, '2034-10-12', '2034-10-21', 'Shardiya Navratri (estimated lunisolar dates)', false),
      (v_id, 2035, '2035-10-02', '2035-10-11', 'Shardiya Navratri (estimated lunisolar dates)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 10. Eid al-Fitr ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'eid-al-fitr',
    'Eid al-Fitr',
    '{"Festival of Breaking the Fast","Raya Aidilfitri","Şeker Bayramı","Korite"}',
    'Hijaz, Arabian Peninsula',
    '{"Global Islamic World","Indonesia","Egypt","Turkey","Nigeria","Morocco","Bangladesh","Pakistan","Malaysia"}',
    '{"Middle East & North Africa","Southeast Asia","Central & South Asia","West Africa","Global Muslim Diaspora"}',
    3, 'lunar_islamic',
    'Marks the end of Ramadan, the month of fasting and prayer. A day of communal thanksgiving, obligatory charity (Zakat al-Fitr), prayer, and family gathering.',
    'Instituted by the Prophet Muhammad in Medina in 624 CE after the migration from Mecca. The tradition of the Eid prayer in open fields traces to early Islamic practice in Medina.',
    '{"Ghusl purification and wearing new or best clothing","Disbursement of Zakat al-Fitr before morning prayer","Congregational Salat al-Eid prayer in open fields","Takbir chanting throughout the night and morning","Community reconciliation and family visits"}',
    '{"Sheer Khurma vermicelli dessert","Ketupat woven rice dumplings","Ma''amoul spiced date cookies","Biryani","Sewaiyan"}',
    '{"Thobe/Dishdasha","Baju Melayu with songket sampin","Shalwar Kameez","Agbada (West Africa)"}',
    '{"Takbirat choral chanting","Nasheeds","Kompang percussion (Malaysia)"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-03-31', '2025-04-02', 'Subject to local moon sighting; expected March 30–April 1', true),
      (v_id, 2026, '2026-03-20', '2026-03-22', 'Subject to local crescent moon sighting', true),
      (v_id, 2027, '2027-03-10', '2027-03-12', 'Subject to local crescent moon sighting', true),
      (v_id, 2028, '2028-02-27', '2028-02-29', 'Approximate — subject to moon sighting', false),
      (v_id, 2029, '2029-02-15', '2029-02-17', 'Approximate', false),
      (v_id, 2030, '2030-02-05', '2030-02-07', 'Approximate', false),
      (v_id, 2031, '2031-01-25', '2031-01-27', 'Approximate', false),
      (v_id, 2032, '2032-01-14', '2032-01-16', 'Approximate', false),
      (v_id, 2033, '2033-01-03', '2033-01-05', 'Approximate', false),
      (v_id, 2034, '2034-12-24', '2034-12-26', 'Approximate', false),
      (v_id, 2035, '2035-12-13', '2035-12-15', 'Approximate', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 11. Eid al-Adha ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'eid-al-adha',
    'Eid al-Adha',
    '{"Feast of Sacrifice","Bakra Eid","Kurban Bayramı","Tabaski"}',
    'Arabia — Islamic tradition',
    '{"Global Islamic World","Saudi Arabia","Turkey","Egypt","Indonesia","Pakistan","Nigeria","Bangladesh"}',
    '{"Middle East & North Africa","South & Southeast Asia","West Africa","Global Muslim Diaspora"}',
    6, 'lunar_islamic',
    'Honors the willingness of Ibrahim (Abraham) to sacrifice his son as an act of obedience to God. A ram was provided in substitution. The festival commemorates this act through ritual animal sacrifice and distributing meat to the poor.',
    'Rooted in the Quranic account of Ibrahim''s trial. Coincides with the conclusion of the Hajj pilgrimage to Mecca on the 10th of Dhu al-Hijjah. One of the two most important festivals in Islam.',
    '{"Morning Eid prayer","Ritual animal sacrifice (Qurbani)","Distributing meat to the poor and neighbors","Family gatherings and feasting","Hajj pilgrims completing the Tawaf al-Ifadah in Mecca"}',
    '{"Grilled and stewed lamb/mutton","Biryani","Haleem","Regional sweet dishes"}',
    '{"New or best Islamic attire","Thobes, kurtas, shalwar kameez","Traditional regional dress"}',
    '{"Takbir and Eid supplications","Devotional nasheeds"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-06-06', '2025-06-09', '10th Dhu al-Hijjah; subject to moon sighting', true),
      (v_id, 2026, '2026-05-27', '2026-05-30', 'Subject to moon sighting', true),
      (v_id, 2027, '2027-05-16', '2027-05-19', 'Subject to moon sighting', true),
      (v_id, 2028, '2028-05-05', '2028-05-08', 'Approximate', false),
      (v_id, 2029, '2029-04-24', '2029-04-27', 'Approximate', false),
      (v_id, 2030, '2030-04-13', '2030-04-16', 'Approximate', false),
      (v_id, 2031, '2031-04-03', '2031-04-06', '10 Dhu al-Hijjah (calculated lunar Hijri)', false),
      (v_id, 2032, '2032-03-22', '2032-03-25', '10 Dhu al-Hijjah (calculated lunar Hijri)', false),
      (v_id, 2033, '2033-03-11', '2033-03-14', '10 Dhu al-Hijjah (calculated lunar Hijri)', false),
      (v_id, 2034, '2034-03-01', '2034-03-04', '10 Dhu al-Hijjah (calculated lunar Hijri)', false),
      (v_id, 2035, '2035-02-18', '2035-02-21', '10 Dhu al-Hijjah (calculated lunar Hijri)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 12. Yom Kippur ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'yom-kippur',
    'Yom Kippur',
    '{"Day of Atonement"}',
    'Levant / Ancient Near East',
    '{"Israel","United States","France","United Kingdom","Argentina"}',
    '{"Global Jewish Communities"}',
    9, 'hebrew',
    'The holiest day in Judaism — a 25-hour fast dedicated to prayer, teshuvah (repentance), and spiritual reconciliation. The closing prayer, Neilah, is the most solemn moment of the Jewish year.',
    'Commanded in the biblical Torah (Leviticus 16) as the annual day of Sabbath of solemn rest. The High Priest performed elaborate purification rites in the Temple era. The Kol Nidre prayer is first mentioned in Geonic period (6th–11th centuries CE).',
    '{"25-hour complete fast from sundown to nightfall","Five prayer services: Maariv, Shacharit, Musaf, Minchah, Neilah","Recitation of Kol Nidre declaration at start of fast","Vidui confession prayers (Ashamnu, Al Chet)","Final sounding of the Shofar at the conclusion"}',
    '{"Pre-fast nourishing soup and challah; post-fast dairy including kugel and bagels (no food during the fast)"}',
    '{"Kittel white robe (representing purity); canvas shoes (no leather)"}',
    '{"Kol Nidre Aramaic modal liturgy","Liturgical Piyutim chants"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-10-01', '2025-10-02', '10th of Tishrei, 5786 — from sundown to nightfall', true),
      (v_id, 2026, '2026-09-20', '2026-09-21', '10th of Tishrei, 5787', true),
      (v_id, 2027, '2027-10-10', '2027-10-11', '10th of Tishrei, 5788', true),
      (v_id, 2028, '2028-09-28', '2028-09-29', '10th of Tishrei, 5789', true),
      (v_id, 2029, '2029-09-17', '2029-09-18', '10th of Tishrei, 5790', true),
      (v_id, 2030, '2030-10-07', '2030-10-08', 'Approximate — 10th of Tishrei', false),
      (v_id, 2031, '2031-09-27', '2031-09-28', '10 Tishrei (calculated Hebrew calendar)', false),
      (v_id, 2032, '2032-09-15', '2032-09-16', '10 Tishrei (calculated Hebrew calendar)', false),
      (v_id, 2033, '2033-10-03', '2033-10-04', '10 Tishrei (calculated Hebrew calendar)', false),
      (v_id, 2034, '2034-09-23', '2034-09-24', '10 Tishrei (calculated Hebrew calendar)', false),
      (v_id, 2035, '2035-10-13', '2035-10-14', '10 Tishrei (calculated Hebrew calendar)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 13. Passover ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'passover-pesach',
    'Passover',
    '{"Pesach","Feast of Unleavened Bread"}',
    'Ancient Israel / Egypt — Exodus narrative',
    '{"Israel","United States","France","United Kingdom","Argentina","Canada","Australia"}',
    '{"Global Jewish Communities"}',
    4, 'hebrew',
    'Commemorates the Exodus from Egypt and the liberation of the Israelites from slavery under Pharaoh. The Passover Seder meal retells this foundational liberation narrative.',
    'Among the oldest continuously observed religious festivals. The Torah commands its observance in Exodus 12. The Seder Haggadah evolved from Second Temple-era practice, shaped through rabbinic literature during the Mishnaic and Talmudic periods.',
    '{"Bedikat chametz (searching for leaven)","Burning chametz","The Passover Seder meal with Haggadah reading","Four cups of wine at the Seder","Eating matzah (unleavened bread)","Afikomen (dessert matzah) tradition"}',
    '{"Matzah (unleavened bread)","Maror (bitter herbs)","Charoset (sweet paste)","Lamb shank bone","Matzah ball soup"}',
    '{"No specific ritual clothing; white kittel sometimes worn at Seder"}',
    '{"Passover Seder songs: Dayenu, Chad Gadya, Ma Nishtana"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-04-12', '2025-04-20', '15th–22nd of Nisan, 5785; Seder April 12–13', true),
      (v_id, 2026, '2026-04-01', '2026-04-09', '15th of Nisan, 5786; Seder April 1–2', true),
      (v_id, 2027, '2027-04-21', '2027-04-29', '15th of Nisan, 5787', true),
      (v_id, 2028, '2028-04-10', '2028-04-18', '15th of Nisan, 5788', true),
      (v_id, 2029, '2029-03-30', '2029-04-07', 'Approximate', false),
      (v_id, 2030, '2030-04-18', '2030-04-25', '15 Nisan (calculated Hebrew calendar)', false),
      (v_id, 2031, '2031-04-08', '2031-04-15', '15 Nisan (calculated Hebrew calendar)', false),
      (v_id, 2032, '2032-03-27', '2032-04-03', '15 Nisan (calculated Hebrew calendar)', false),
      (v_id, 2033, '2033-04-14', '2033-04-21', '15 Nisan (calculated Hebrew calendar)', false),
      (v_id, 2034, '2034-04-04', '2034-04-11', '15 Nisan (calculated Hebrew calendar)', false),
      (v_id, 2035, '2035-04-24', '2035-05-01', '15 Nisan (calculated Hebrew calendar)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 14. Easter ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'easter-resurrection-sunday',
    'Easter',
    '{"Resurrection Sunday","Pâques","Ostern","Pasqua","Pascua"}',
    'Near East — Christian tradition emerging from Jewish Passover context',
    '{"Global — most Christian-majority nations","United States","United Kingdom","Germany","Italy","Brazil","Philippines"}',
    '{"Europe","Americas","Sub-Saharan Africa","Southeast Asia","Global Christian Communities"}',
    4, 'computus_gregorian',
    'The central feast of Christianity, celebrating the resurrection of Jesus Christ from the dead on the third day after his crucifixion. The culmination of Holy Week and the Paschal Triduum.',
    'The earliest Christians celebrated the resurrection in connection with Passover. The Council of Nicaea (325 CE) established the computus to calculate Easter''s date independently from the Jewish calendar. Orthodox churches follow the Julian calendar, often yielding a different date.',
    '{"Easter Vigil Mass at midnight (Catholic, Orthodox)","Sunrise services","Blessing of Easter baskets (Central/Eastern Europe)","Easter egg hunts (children)","Hot cross buns on Good Friday"}',
    '{"Hot cross buns","Easter lamb (symbolic)","Simnel cake (UK)","Easter bread (various cultures)","Chocolate eggs"}',
    '{"New Easter outfits (Western cultural tradition)","Liturgical white vestments"}',
    '{"Handel''s Messiah (Hallelujah Chorus)","Easter hymns (Christ the Lord Is Risen Today)","Orthodox Paschal troparion"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-04-20', '2025-04-20', 'Western Easter (Gregorian); Orthodox: April 20', true),
      (v_id, 2026, '2026-04-05', '2026-04-05', 'Western Easter; Orthodox: April 12', true),
      (v_id, 2027, '2027-03-28', '2027-03-28', 'Western Easter; Orthodox: May 2', true),
      (v_id, 2028, '2028-04-16', '2028-04-16', 'Western Easter; Orthodox: April 16', true),
      (v_id, 2029, '2029-04-01', '2029-04-01', 'Western Easter (approximate)', false),
      (v_id, 2030, '2030-04-21', '2030-04-21', 'Western Easter (approximate)', false),
      (v_id, 2031, '2031-04-13', '2031-04-13', 'Computus Western Liturgical Calendar', true),
      (v_id, 2032, '2032-03-28', '2032-03-28', 'Computus Western Liturgical Calendar', true),
      (v_id, 2033, '2033-04-17', '2033-04-17', 'Computus Western Liturgical Calendar', true),
      (v_id, 2034, '2034-04-09', '2034-04-09', 'Computus Western Liturgical Calendar', true),
      (v_id, 2035, '2035-03-25', '2035-03-25', 'Computus Western Liturgical Calendar', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 15. Christmas ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'christmas',
    'Christmas',
    '{"Nativity of Jesus","Noël","Weihnachten","Navidad","Natal"}',
    'Western Christianity — Roman Empire era',
    '{"Global — most Christian-majority nations and many secular observances worldwide"}',
    '{"Europe","Americas","Sub-Saharan Africa","Southeast Asia","Australia","Global"}',
    12, 'fixed_gregorian',
    'Celebrates the birth of Jesus Christ, the central figure of Christianity. Widely observed also as a secular cultural holiday involving family gatherings, gift-giving, and community festivities.',
    'The December 25 date was established in the 4th century in Rome, possibly aligned with existing Roman Saturnalia and Sol Invictus festivals. The modern secular traditions (Christmas tree, Santa Claus, gift-giving) developed in 19th-century Germany and England.',
    '{"Midnight Mass (Christmas Eve)","Decorating the Christmas tree","Gift exchange on Christmas morning","Advent wreath and calendar","Carol singing and nativity plays"}',
    '{"Roast turkey or goose","Christmas pudding (UK)","Bûche de Noël (France)","Lebkuchen gingerbread (Germany)","Panettone (Italy)"}',
    '{"Festive attire; Santa Claus costume; ugly sweaters (cultural)"}',
    '{"Silent Night","O Holy Night","Handel''s Messiah","Jingle Bells","Traditional carols"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-12-25', '2025-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2026, '2026-12-25', '2026-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2027, '2027-12-25', '2027-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2028, '2028-12-25', '2028-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2029, '2029-12-25', '2029-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2030, '2030-12-25', '2030-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2031, '2031-12-25', '2031-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2032, '2032-12-25', '2032-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2033, '2033-12-25', '2033-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2034, '2034-12-25', '2034-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true),
      (v_id, 2035, '2035-12-25', '2035-12-25', 'Fixed Dec 25; Orthodox Christmas: Jan 7', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 16. Vesak ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'vesak-buddha-day',
    'Vesak',
    '{"Buddha Jayanti","Buddha Purnima","Wesak","Visakha Bucha"}',
    'South Asia — marking Siddhartha Gautama''s birth, enlightenment, and death',
    '{"Sri Lanka","Thailand","Myanmar","Cambodia","Vietnam","Laos","India","Nepal","Indonesia","Malaysia","Singapore"}',
    '{"South Asia","Southeast Asia","East Asia","Global Buddhist Communities"}',
    5, 'lunar_theravada',
    'The most sacred day in Theravada Buddhism, commemorating three critical events in the life of Siddhartha Gautama on the same lunar day: his birth, enlightenment (Bodhi), and Parinirvana (death).',
    'Recognized as significant in Theravada countries for centuries. In 1999, the United Nations formally recognized Vesak as an international day of observance. The date varies by country and Buddhist tradition.',
    '{"Bathing the Buddha statue with scented water","Offering flowers, incense, and candles at temples","Releasing caged birds and fish","Candlelit evening processions","Dana (charitable giving) and community service"}',
    '{"Vegetarian meals","Kheer (sweet rice pudding)","Alms-giving to monks"}',
    '{"White clothing (representing purity)","Modest temple attire"}',
    '{"Buddhist chanting (Pali sutras)","Dharma songs","Bell and drum offerings"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-05-12', '2025-05-12', 'Full moon of Vesak month; date varies by country (May 12 in many Theravada countries)', true),
      (v_id, 2026, '2026-05-31', '2026-05-31', 'Full moon of Vesak month (approximate)', true),
      (v_id, 2027, '2027-05-20', '2027-05-20', 'Full moon of Vesak month (approximate)', false),
      (v_id, 2028, '2028-05-09', '2028-05-09', 'Approximate', false),
      (v_id, 2029, '2029-05-27', '2029-05-27', 'Vesak Full Moon (calculated Buddhist calendar)', false),
      (v_id, 2030, '2030-05-16', '2030-05-16', 'Vesak Full Moon (calculated Buddhist calendar)', false),
      (v_id, 2031, '2031-05-06', '2031-05-06', 'Vesak Full Moon (calculated Buddhist calendar)', false),
      (v_id, 2032, '2032-05-24', '2032-05-24', 'Vesak Full Moon (calculated Buddhist calendar)', false),
      (v_id, 2033, '2033-05-13', '2033-05-13', 'Vesak Full Moon (calculated Buddhist calendar)', false),
      (v_id, 2034, '2034-05-03', '2034-05-03', 'Vesak Full Moon (calculated Buddhist calendar)', false),
      (v_id, 2035, '2035-05-22', '2035-05-22', 'Vesak Full Moon (calculated Buddhist calendar)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 17. Obon ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'obon-japanese-ancestors',
    'Obon',
    '{"Bon Festival","Urabon-e"}',
    'Japan — Blend of Buddhist Ullambana and indigenous ancestor veneration',
    '{"Japan","Japanese diaspora communities"}',
    '{"East Asia","Japanese Diaspora"}',
    8, 'fixed_gregorian',
    'A Japanese Buddhist festival honoring the spirits of ancestors. Families return home, visit graves, and light lanterns to guide spirits. The Bon Odori dance invites ancestral spirits to participate in the celebration.',
    'Derived from the Buddhist Ullambana ceremony in which Maudgalyayana (Mulian) freed his mother''s spirit from suffering. Introduced to Japan around the 7th century. Over time merged with indigenous Shinto ancestor veneration into a distinctly Japanese practice.',
    '{"Cleaning and visiting ancestors'' graves","Lighting welcoming fires (mukaebi)","Bon Odori community dances","Floating river lanterns (tōrō nagashi)","Setting up family altars (butsudan) with offerings","Send-off fires on the final night (okuribi)"}',
    '{"Ohagi (sweet glutinous rice balls)","Soumen noodles","Edamame","Traditional summer foods"}',
    '{"Yukata (light summer kimono)","Festival happi coats for dance"}',
    '{"Bon Odori folk songs (regional variations)","Taiko drumming","Shamisen and shakuhachi"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-08-13', '2025-08-16', 'Most of Japan observes Aug 13–16; some regions observe in July', true),
      (v_id, 2026, '2026-08-13', '2026-08-16', 'Fixed: Aug 13–16 (most regions)', true),
      (v_id, 2027, '2027-08-13', '2027-08-16', 'Fixed: Aug 13–16', true),
      (v_id, 2028, '2028-08-13', '2028-08-16', 'Fixed: Aug 13–16', true),
      (v_id, 2029, '2029-08-13', '2029-08-16', 'Fixed: Aug 13–16', true),
      (v_id, 2030, '2030-08-13', '2030-08-16', 'Fixed: Aug 13–16', true),
      (v_id, 2031, '2031-08-13', '2031-08-16', 'Solar Obon (Hachigatsu Bon, Japan)', true),
      (v_id, 2032, '2032-08-13', '2032-08-16', 'Solar Obon (Hachigatsu Bon, Japan)', true),
      (v_id, 2033, '2033-08-13', '2033-08-16', 'Solar Obon (Hachigatsu Bon, Japan)', true),
      (v_id, 2034, '2034-08-13', '2034-08-16', 'Solar Obon (Hachigatsu Bon, Japan)', true),
      (v_id, 2035, '2035-08-13', '2035-08-16', 'Solar Obon (Hachigatsu Bon, Japan)', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 18. Vaisakhi ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'vaisakhi-sikh',
    'Vaisakhi',
    '{"Baisakhi","Khalsa Sajna Diwas"}',
    'Punjab, India — Sikh Khalsa founding',
    '{"India","Pakistan","United Kingdom","Canada","United States"}',
    '{"South Asia","Global Sikh Diaspora"}',
    4, 'solar_nanakshahi',
    'Marks the founding of the Khalsa (the community of initiated Sikhs) by Guru Gobind Singh on Vaisakhi 1699. Also a harvest festival in Punjab marking the end of the winter wheat harvest.',
    'On April 13, 1699, Guru Gobind Singh gathered thousands at Anandpur Sahib, called for volunteers willing to give their lives, and initiated five Sikhs (Panj Pyare) as the first Khalsa. The founding Amrit Sanchar ceremony established Sikh identity and principles.',
    '{"Nagar Kirtan (procession with Guru Granth Sahib)","Amrit Sanchar (Khalsa initiation ceremony)","Gurdwara prayers and kirtan","Langar (community kitchen feast)","Bhangra and Giddha folk dances"}',
    '{"Langar dishes: dal makhani, rice, roti","Karah Prasad (sacred pudding)","Channa masala","Lassi"}',
    '{"Saffron or blue dastar (turban) for Khalsa Sikhs","Traditional Punjabi dress","Salwar kameez"}',
    '{"Shabad Kirtan (Sikh devotional hymns)","Bhangra dhol drumming","Giddha folk singing"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-04-13', '2025-04-14', 'Fixed April 13–14 (Nanakshahi calendar)', true),
      (v_id, 2026, '2026-04-13', '2026-04-14', 'Fixed April 13–14', true),
      (v_id, 2027, '2027-04-14', '2027-04-14', 'Fixed April 14 (Nanakshahi)', true),
      (v_id, 2028, '2028-04-13', '2028-04-14', 'Fixed April 13–14', true),
      (v_id, 2029, '2029-04-13', '2029-04-14', 'Fixed April 13–14', true),
      (v_id, 2030, '2030-04-13', '2030-04-14', 'Fixed April 13–14', true),
      (v_id, 2031, '2031-04-14', '2031-04-14', 'Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)', true),
      (v_id, 2032, '2032-04-13', '2032-04-13', 'Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)', true),
      (v_id, 2033, '2033-04-14', '2033-04-14', 'Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)', true),
      (v_id, 2034, '2034-04-14', '2034-04-14', 'Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)', true),
      (v_id, 2035, '2035-04-14', '2035-04-14', 'Nanakshahi / Solar Bikrami Calendar (Vaisakh 1)', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 19. Nowruz ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'nowruz-persian-new-year',
    'Nowruz',
    '{"Naw-Rúz","Nevruz","Persian New Year","Iranian New Year"}',
    'Ancient Iran / Persian Empire',
    '{"Iran","Afghanistan","Tajikistan","Uzbekistan","Kazakhstan","Azerbaijan","Turkey","Pakistan","India (Parsi)","Georgia"}',
    '{"Central Asia","Middle East","South Asia","Global Iranian Diaspora"}',
    3, 'solar_equinox',
    'The Persian New Year, marking the spring equinox and the first day of Farvardin in the Solar Hijri calendar. One of the oldest festivals in human history, with a UNESCO Intangible Cultural Heritage inscription.',
    'With origins dating back at least 3,000 years to the Achaemenid Empire and possibly to Zoroastrian religion. The Shahnameh (Book of Kings) attributes Nowruz to the mythical King Jamshid. UNESCO inscribed it in 2009 and 2016 (expanded list).',
    '{"Khane tekani (thorough spring cleaning)","Setting up Haft-Seen table","Chaharshanbe Suri (fire-jumping eve celebration)","Family visits from youngest to oldest","Sizdah Bedar (Nature Day on 13th day)","Giving Eidi (cash gifts)"}',
    '{"Sabzi Polo Mahi (herbed rice with fish)","Ash Reshteh (noodle soup)","Reshteh Polo","Ajil (mixed dried nuts and fruits)","Baklava"}',
    '{"New clothes (symbolizing fresh start)","Traditional Persian regional dress"}',
    '{"Classical Persian music (dastgāh system)","Nowruz folk songs","Tar and santur performances"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-03-20', '2025-04-01', 'Spring equinox ~March 20; 13-day celebration through Sizdah Bedar', true),
      (v_id, 2026, '2026-03-20', '2026-04-01', 'Spring equinox; UNESCO ICH inscribed', true),
      (v_id, 2027, '2027-03-21', '2027-04-02', 'Spring equinox date may vary by 1 day', true),
      (v_id, 2028, '2028-03-20', '2028-04-01', 'Spring equinox', true),
      (v_id, 2029, '2029-03-20', '2029-04-01', 'Spring equinox', true),
      (v_id, 2030, '2030-03-20', '2030-04-01', 'Spring equinox', true),
      (v_id, 2031, '2031-03-20', '2031-04-01', 'Spring equinox', true),
      (v_id, 2032, '2032-03-20', '2032-04-01', 'Spring equinox', true),
      (v_id, 2033, '2033-03-20', '2033-04-01', 'Spring equinox', true),
      (v_id, 2034, '2034-03-20', '2034-04-01', 'Spring equinox', true),
      (v_id, 2035, '2035-03-20', '2035-04-01', 'Spring equinox', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 20. Kwanzaa ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'kwanzaa',
    'Kwanzaa',
    '{}',
    'United States — created 1966, drawing on pan-African harvest traditions',
    '{"United States","Caribbean","Canada","UK African diaspora"}',
    '{"North America","Global African Diaspora"}',
    12, 'fixed_gregorian',
    'A seven-day celebration of African heritage, culture, and values created by Dr. Maulana Karenga in 1966. Each night a candle is lit for one of seven principles (Nguzo Saba): Unity, Self-Determination, Collective Work and Responsibility, Cooperative Economics, Purpose, Creativity, and Faith.',
    'Created by Dr. Maulana Karenga at California State University in 1966 during the Black Power movement in response to the Watts Rebellion. Draws on first-fruit harvest festivals across various African cultures.',
    '{"Nightly kinara candle lighting","Pouring libations (tambiko) for ancestors","Gift-giving on January 1","Karamu feast on December 31","Sharing stories of African heritage"}',
    '{"Karamu feast foods with African diaspora cuisine: jollof rice, collard greens, yams, catfish"}',
    '{"Kente cloth","African-print garments","Traditional African regional dress"}',
    '{"African drumming","Jazz and soul music","Traditional African songs"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-12-26', '2026-01-01', 'Fixed Dec 26 – Jan 1; Karamu Dec 31', true),
      (v_id, 2026, '2026-12-26', '2027-01-01', 'Fixed Dec 26 – Jan 1', true),
      (v_id, 2027, '2027-12-26', '2028-01-01', 'Fixed Dec 26 – Jan 1', true),
      (v_id, 2028, '2028-12-26', '2029-01-01', 'Fixed Dec 26 – Jan 1', true),
      (v_id, 2029, '2029-12-26', '2030-01-01', 'Fixed Dec 26 – Jan 1', true),
      (v_id, 2030, '2030-12-26', '2031-01-01', 'Fixed Dec 26 – Jan 1', true),
      (v_id, 2031, '2031-12-26', '2032-01-01', 'Fixed 7-day observance (Dec 26–Jan 1)', true),
      (v_id, 2032, '2032-12-26', '2033-01-01', 'Fixed 7-day observance (Dec 26–Jan 1)', true),
      (v_id, 2033, '2033-12-26', '2034-01-01', 'Fixed 7-day observance (Dec 26–Jan 1)', true),
      (v_id, 2034, '2034-12-26', '2035-01-01', 'Fixed 7-day observance (Dec 26–Jan 1)', true),
      (v_id, 2035, '2035-12-26', '2036-01-01', 'Fixed 7-day observance (Dec 26–Jan 1)', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 21. Songkran ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'songkran-thai-water-festival',
    'Songkran',
    '{"Thai New Year","Thingyan (Myanmar)","Pi Mai (Laos)","Chaul Chnam Thmey (Cambodia)"}',
    'Mainland Southeast Asia',
    '{"Thailand","Myanmar","Laos","Cambodia","Yunnan (China)","Tamil communities"}',
    '{"Southeast Asia","South Asia (Tamil communities)"}',
    4, 'solar_thai',
    'The traditional New Year of Thailand and mainland Southeast Asia, marked by ritual water pouring and bathing of Buddha images and elders (symbolizing purification and respect) and massive public water fights (joyous celebration).',
    'Originally a Brahmanical new year ritual adapted into Theravada Buddhist practice. The date (April 13–15) aligns with the Sun''s passage into Aries in tropical astrology. The water-fight tradition evolved into a community celebration of renewal.',
    '{"Bathing Buddha images with scented water","Pouring water on elders'' hands (Rod Nam Dam Hua)","Releasing birds and fish","Building sand pagodas (castles) at temples","Public water fights"}',
    '{"Khao Niao (sticky rice)","Mango sticky rice","Kanom jeen (fermented rice noodles)","Traditional Thai festive sweets"}',
    '{"Floral or colorful shirts (for water festival)","Traditional Thai dress for temple visits"}',
    '{"Thai classical ensemble (piphat)","Luk thung folk music","Contemporary pop at water fight venues"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-04-13', '2025-04-15', 'Fixed April 13–15; major celebrations April 13–14 in Thailand', true),
      (v_id, 2026, '2026-04-13', '2026-04-15', 'Fixed April 13–15', true),
      (v_id, 2027, '2027-04-13', '2027-04-15', 'Fixed April 13–15', true),
      (v_id, 2028, '2028-04-13', '2028-04-15', 'Fixed April 13–15', true),
      (v_id, 2029, '2029-04-13', '2029-04-15', 'Fixed April 13–15', true),
      (v_id, 2030, '2030-04-13', '2030-04-15', 'Fixed April 13–15', true),
      (v_id, 2031, '2031-04-13', '2031-04-15', 'Fixed Thai Solar New Year', true),
      (v_id, 2032, '2032-04-13', '2032-04-15', 'Fixed Thai Solar New Year', true),
      (v_id, 2033, '2033-04-13', '2033-04-15', 'Fixed Thai Solar New Year', true),
      (v_id, 2034, '2034-04-13', '2034-04-15', 'Fixed Thai Solar New Year', true),
      (v_id, 2035, '2035-04-13', '2035-04-15', 'Fixed Thai Solar New Year', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 22. Midsummer (Midsommar) ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'midsummer-nordic',
    'Midsummer (Midsommar)',
    '{"St. John''s Eve","Juhannus (Finland)","Sankthans (Norway/Denmark)","Jāņi (Latvia)"}',
    'Northern Europe — pre-Christian solar festivals',
    '{"Sweden","Finland","Norway","Denmark","Latvia","Estonia","Lithuania"}',
    '{"Nordic & Baltic Europe"}',
    6, 'solar_solstice',
    'Celebrates the summer solstice — the longest day of the year — with maypole raising, flower garlands, bonfires, and outdoor festivities. Originally linked to the summer solstice''s agricultural importance; later merged with St. John the Baptist''s Day in Christian tradition.',
    'Pre-Christian Germanic and Slavic solstice celebrations were widespread. The Catholic Church aligned the feast of St. John the Baptist (June 24) with these traditions. Sweden''s specific Midsommar traditions (dancing around the maypole) developed through the 16th–17th centuries.',
    '{"Raising the midsummer maypole (majstång)","Weaving flower crowns and garlands","Bonfires by lakes and rivers","Traditional folk dances (frog dance in Sweden)","Picking seven flowers to place under pillow for prophetic dreams"}',
    '{"Pickled herring","New potatoes with dill","Strawberries and cream","Sill (herring)","Snaps (aquavit)"}',
    '{"Flower wreaths and crowns","Swedish traditional dress (folkdräkt)","Summer casual"}',
    '{"Swedish folk songs (Ormar and Groda, Vi ska sjunga)","Accordion and fiddle","Traditional Scandinavian polkas"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-06-20', '2025-06-21', 'Sweden: Friday nearest June 24; Solstice: June 21; Finland Juhannus: June 20–21', true),
      (v_id, 2026, '2026-06-19', '2026-06-20', 'Friday nearest June 24 (Sweden)', true),
      (v_id, 2027, '2027-06-25', '2027-06-26', 'Friday nearest June 24 (Sweden)', true),
      (v_id, 2028, '2028-06-23', '2028-06-24', 'Friday nearest June 24 (Sweden)', true),
      (v_id, 2029, '2029-06-21', '2029-06-22', 'Approximate', false),
      (v_id, 2030, '2030-06-21', '2030-06-22', 'Solstice date', false),
      (v_id, 2031, '2031-06-20', '2031-06-21', 'Friday closest to summer solstice (Sweden/Finland)', true),
      (v_id, 2032, '2032-06-25', '2032-06-26', 'Friday closest to summer solstice (Sweden/Finland)', true),
      (v_id, 2033, '2033-06-24', '2033-06-25', 'Friday closest to summer solstice (Sweden/Finland)', true),
      (v_id, 2034, '2034-06-23', '2034-06-24', 'Friday closest to summer solstice (Sweden/Finland)', true),
      (v_id, 2035, '2035-06-22', '2035-06-23', 'Friday closest to summer solstice (Sweden/Finland)', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 23. Hogmanay ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'hogmanay-scottish-new-year',
    'Hogmanay',
    '{"Scottish New Year","Auld Lang Syne"}',
    'Scotland — Celtic and Norse traditions',
    '{"United Kingdom (Scotland)","Scottish diaspora"}',
    '{"Northern Europe","Global Scottish Diaspora"}',
    12, 'fixed_gregorian',
    'Scotland''s elaborate New Year celebration, considered one of the world''s great New Year festivities, featuring torch-lit processions, fireball ceremonies, and the tradition of First-Footing (the first person to enter a home after midnight brings gifts for good luck).',
    'Has roots in Norse and Celtic winter solstice celebrations. The word "Hogmanay" may derive from Norse or Norman French. The emphasis on New Year over Christmas may stem from Scotland''s Presbyterian Church discouraging Christmas festivities in the 17th century.',
    '{"First-Footing: being first to enter a home after midnight (with gifts of coal, whisky, shortbread)","Burning the old year (fire ceremonies)","Singing Auld Lang Syne at midnight","Torch-lit street processions","Fireball swinging (Stonehaven)"}',
    '{"Scottish shortbread","Black bun (spiced fruit cake)","Whisky","Haggis","Cranachan"}',
    '{"Scottish kilts and tartans","Festive winter wear"}',
    '{"Auld Lang Syne (Robert Burns, 1788)","Scottish bagpipes","Ceilidh folk dance music"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-12-31', '2026-01-01', 'New Year''s Eve Dec 31 through Jan 1', true),
      (v_id, 2026, '2026-12-31', '2027-01-01', 'New Year''s Eve Dec 31', true),
      (v_id, 2027, '2027-12-31', '2028-01-01', 'New Year''s Eve Dec 31', true),
      (v_id, 2028, '2028-12-31', '2029-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true),
      (v_id, 2029, '2029-12-31', '2030-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true),
      (v_id, 2030, '2030-12-31', '2031-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true),
      (v_id, 2031, '2031-12-31', '2032-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true),
      (v_id, 2032, '2032-12-31', '2033-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true),
      (v_id, 2033, '2033-12-31', '2034-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true),
      (v_id, 2034, '2034-12-31', '2035-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true),
      (v_id, 2035, '2035-12-31', '2036-01-01', 'Scottish New Year celebration (Dec 31–Jan 1)', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 24. Día de los Muertos ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'dia-de-los-muertos',
    'Día de los Muertos',
    '{"Day of the Dead","Día de Muertos"}',
    'Mexico — Aztec and pre-Columbian traditions blended with Catholic All Saints'' Day',
    '{"Mexico","Guatemala","Honduras","El Salvador","United States (Mexican communities)"}',
    '{"Latin America","North America (Latino communities)"}',
    11, 'fixed_gregorian',
    'A joyful celebration of deceased loved ones, believed to return to visit the living on these days. Intricate altars (ofrendas) decorated with marigolds, photographs, food, and personal objects of the departed are created in homes and cemeteries.',
    'Rooted in Aztec and other Mesoamerican traditions of honoring the dead, which were originally month-long festivals. Spanish colonization blended these traditions with the Catholic All Saints'' Day (November 1) and All Souls'' Day (November 2). UNESCO inscribed it in 2008.',
    '{"Building ofrendas (altars) with photos and offerings","Cemetery vigils and grave decorating","Laying marigold (cempasúchil) petal paths to guide spirits","Face painting as Calavera Catrina","Sharing stories of deceased loved ones"}',
    '{"Pan de Muerto (sweet bread)","Sugar skulls (calaveras de azúcar)","Mole","Tamales","Marigold-infused foods"}',
    '{"Calavera face paint","Traditional Oaxacan or Aztec-inspired dress","Catrina costumes"}',
    '{"Son Jarocho (Veracruz)","Mariachi","Traditional Indigenous music of each region"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-11-01', '2025-11-02', 'Nov 1: Día de los Inocentes (children); Nov 2: Día de los Muertos (adults); UNESCO ICH', true),
      (v_id, 2026, '2026-11-01', '2026-11-02', 'Fixed Nov 1–2', true),
      (v_id, 2027, '2027-11-01', '2027-11-02', 'Fixed Nov 1–2', true),
      (v_id, 2028, '2028-11-01', '2028-11-02', 'Fixed Nov 1–2', true),
      (v_id, 2029, '2029-11-01', '2029-11-02', 'Fixed Nov 1–2', true),
      (v_id, 2030, '2030-11-01', '2030-11-02', 'Fixed Nov 1–2', true),
      (v_id, 2031, '2031-11-01', '2031-11-02', 'All Saints & All Souls Days (Mexico)', true),
      (v_id, 2032, '2032-11-01', '2032-11-02', 'All Saints & All Souls Days (Mexico)', true),
      (v_id, 2033, '2033-11-01', '2033-11-02', 'All Saints & All Souls Days (Mexico)', true),
      (v_id, 2034, '2034-11-01', '2034-11-02', 'All Saints & All Souls Days (Mexico)', true),
      (v_id, 2035, '2035-11-01', '2035-11-02', 'All Saints & All Souls Days (Mexico)', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 25. Powwow ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'north-american-powwow',
    'Powwow',
    '{"Pau Wau","Indigenous gathering"}',
    'North America — Plains and other Indigenous nations',
    '{"United States","Canada"}',
    '{"North America — Indigenous communities throughout"}',
    6, 'community_determined',
    'A gathering of Indigenous peoples to celebrate culture, maintain traditions, dance, sing, visit, and trade. Powwows vary widely by nation and region but share the drum circle, regalia, and communal spirit as unifying elements.',
    'The term "powwow" derives from the Narragansett and Massachusett word "powwaw" (a spiritual leader). Modern intertribal powwows developed in the late 19th and early 20th centuries as Indigenous communities maintained cultural practices despite suppression.',
    '{"Grand Entry processional with eagle staff and flags","Intertribal drum songs","Competitive dance categories (Fancy, Traditional, Grass, Jingle)","Give-away ceremonies","Opening and closing prayers"}',
    '{"Fry bread","Indian tacos","Buffalo/bison dishes","Wild rice","Community feast"}',
    '{"Regalia (specific to each dancer''s nation and dance style)","Beadwork, feather work, ribbonwork"}',
    '{"Intertribal drum songs","Honor songs","Contest songs","Veteran songs"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-06-01', '2025-08-31', 'Thousands of powwows held May–September across North America; no single date', false),
      (v_id, 2026, '2026-06-01', '2026-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2027, '2027-06-01', '2027-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2028, '2028-06-01', '2028-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2029, '2029-06-01', '2029-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2030, '2030-06-01', '2030-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2031, '2031-06-01', '2031-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2032, '2032-06-01', '2032-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2033, '2033-06-01', '2033-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2034, '2034-06-01', '2034-08-31', 'Powwow season: spring through fall', false),
      (v_id, 2035, '2035-06-01', '2035-08-31', 'Powwow season: spring through fall', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 26. Paryushana ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'paryushana-jain',
    'Paryushana',
    '{"Das Lakshana (Digambara)","Parva Adhyatma","Festival of Forgiveness"}',
    'Ancient India — Jain tradition',
    '{"India","United States","United Kingdom","East Africa (Jain diaspora)"}',
    '{"South Asia","Global Jain Diaspora"}',
    8, 'lunisolar_jain',
    'The most important festival for Jains — eight or ten days of intense spiritual practice, fasting, meditation, scriptural study, and forgiveness. On the final day (Samvatsari Pratikraman), Jains seek forgiveness from all living beings.',
    'One of the oldest Jain observances, traced to the Agamic period. The Shvetambara tradition observes eight days (Paryushana); the Digambara tradition observes ten days (Das Lakshana) beginning shortly after. Both culminate in Samvatsari / Kshamavani.',
    '{"Tapasya (fasting — partial or complete)","Pratikraman (confession ritual)","Scriptural readings of Kalpasutra","Seeking forgiveness (Kshamavani)","Samvatsari Pratikraman (annual atonement)"}',
    '{"Strict fasting; limited satvik foods if partial fast","Boiled water only for complete fasters"}',
    '{"White clothing representing purity"}',
    '{"Devotional Jain bhajans and stotras"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-08-19', '2025-08-26', 'Shvetambara: 8 days; Samvatsari Aug 26; Digambara: Das Lakshana Aug 27–Sep 5', true),
      (v_id, 2026, '2026-09-05', '2026-09-12', 'Shvetambara tradition (approximate)', false),
      (v_id, 2027, '2027-08-26', '2027-09-02', 'Approximate', false),
      (v_id, 2028, '2028-08-16', '2028-08-23', 'Bhadrapada Krishna (calculated Jain calendar)', false),
      (v_id, 2029, '2029-09-04', '2029-09-11', 'Bhadrapada Krishna (calculated Jain calendar)', false),
      (v_id, 2030, '2030-08-25', '2030-09-01', 'Bhadrapada Krishna (calculated Jain calendar)', false),
      (v_id, 2031, '2031-08-14', '2031-08-21', 'Bhadrapada Krishna (calculated Jain calendar)', false),
      (v_id, 2032, '2032-09-01', '2032-09-08', 'Bhadrapada Krishna (calculated Jain calendar)', false),
      (v_id, 2033, '2033-08-21', '2033-08-28', 'Bhadrapada Krishna (calculated Jain calendar)', false),
      (v_id, 2034, '2034-09-09', '2034-09-16', 'Bhadrapada Krishna (calculated Jain calendar)', false),
      (v_id, 2035, '2035-08-29', '2035-09-05', 'Bhadrapada Krishna (calculated Jain calendar)', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 27. New Year''s Day ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'new-years-day-gregorian',
    'New Year''s Day',
    '{"January 1","Jour de l''An","Silvester (Germany/Austria)"}',
    'Global — based on Gregorian calendar standardization',
    '{"Global — virtually all countries observing the Gregorian calendar"}',
    '{"Global"}',
    1, 'fixed_gregorian',
    'The first day of the Gregorian calendar year, marking a global moment of celebration, reflection, and renewal. While the Gregorian calendar is a Western institution, New Year celebrations on January 1 are now observed worldwide.',
    'The Gregorian calendar was introduced by Pope Gregory XIII in 1582, gradually adopted by most of the world through the 18th–20th centuries. January 1 as New Year dates to Julius Caesar''s Julian calendar reform of 45 BCE.',
    '{"Midnight countdown and fireworks","Champagne/sparkling wine toasts","Auld Lang Syne (English-speaking countries)","Watching fireworks","New Year''s resolutions"}',
    '{"Champagne","Black-eyed peas (US South, for good luck)","Regional luck foods (grapes in Spain, lentils in Italy, herring in Nordic countries)"}',
    '{"Festive evening wear","Party costumes"}',
    '{"Auld Lang Syne","Fireworks soundtrack","Regional pop and traditional music"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-01-01', '2025-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2026, '2026-01-01', '2026-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2027, '2027-01-01', '2027-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2028, '2028-01-01', '2028-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2029, '2029-01-01', '2029-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2030, '2030-01-01', '2030-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2031, '2031-01-01', '2031-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2032, '2032-01-01', '2032-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2033, '2033-01-01', '2033-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2034, '2034-01-01', '2034-01-01', 'Fixed January 1 — Gregorian calendar', true),
      (v_id, 2035, '2035-01-01', '2035-01-01', 'Fixed January 1 — Gregorian calendar', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 28. Krishna Janmashtami ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'krishna-janmashtami',
    'Krishna Janmashtami',
    '{"Gokulashtami","Yadukula Ashtami","Srikrishna Jayanti"}',
    'Mathura & Vrindavan, Northern India — Hindu Puranic tradition',
    '{"India","Nepal","Fiji","Mauritius","Guyana","Trinidad and Tobago","Global Hindu Diaspora"}',
    '{"South Asia","Global Hindu Diaspora"}',
    8, 'hindu_lunisolar',
    'Celebrates the birth of Lord Krishna, the eighth avatar of Vishnu. Known for midnight vigils, fasting, devotional singing, and the Dahi Handi human pyramid festival in Maharashtra.',
    'Recorded in the Bhagavata Purana, Harivamsa, and Mahabharata. Born at midnight in a Mathura prison cell to Devaki and Vasudeva, Krishna was carried across the Yamuna River to Gokul to escape King Kamsa.',
    '{"Nirjala or Phalahar fasting throughout the day","Midnight Abhisheka (ritual bathing) of Bal Gopal idol","Dahi Handi human pyramids in Maharashtra and Goa","Raas Leela dramatic enactments in Vrindavan and Mathura","Drawing small footprints of baby Krishna with rice flour leading into the home"}',
    '{"Makhan Mishri (butter with rock sugar)","Panjiri coriander-dry fruit prasad","Poha Chivda","Pedha","Kheer"}',
    '{"Traditional Indian attire; children dressed as baby Krishna with peacock feathers and Radha"}',
    '{"Krishna Bhajans","Govinda Ala Re folk music during Dahi Handi","Classical Odissi and Kathak dances"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-08-16', '2025-08-16', 'Ashtami Tithi begins Aug 15 night; midnight puja Aug 16 (verified by Drik Panchang)', true),
      (v_id, 2026, '2026-09-04', '2026-09-04', 'Rohini Nakshatra & Ashtami Tithi (verified by Drik Panchang)', true),
      (v_id, 2027, '2027-08-25', '2027-08-25', 'Bhadrapada Krishna Ashtami (calculated)', true),
      (v_id, 2028, '2028-08-13', '2028-08-13', 'Calculated lunisolar', false),
      (v_id, 2029, '2029-09-01', '2029-09-01', 'Calculated lunisolar', false),
      (v_id, 2030, '2030-08-21', '2030-08-21', 'Calculated lunisolar', false),
      (v_id, 2031, '2031-08-10', '2031-08-10', 'Calculated lunisolar', false),
      (v_id, 2032, '2032-08-28', '2032-08-28', 'Calculated lunisolar', false),
      (v_id, 2033, '2033-08-17', '2033-08-17', 'Calculated lunisolar', false),
      (v_id, 2034, '2034-09-05', '2034-09-05', 'Calculated lunisolar', false),
      (v_id, 2035, '2035-08-26', '2035-08-26', 'Calculated lunisolar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 29. Maha Shivaratri ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'maha-shivaratri',
    'Maha Shivaratri',
    '{"The Great Night of Shiva","Shivaratri"}',
    'Ancient India — Vedic and Shaiva tradition',
    '{"India","Nepal","Mauritius","Indonesia (Bali)","Global Hindu Diaspora"}',
    '{"South Asia","Global Hindu Diaspora"}',
    2, 'hindu_lunisolar',
    'Celebrates the cosmic dance of Shiva (Tandava) and his divine marriage to Goddess Parvati. Marked by overnight vigil (Jaagaran), meditation, fasting, and continuous offerings of Bael leaves on the Shiva Lingam.',
    'Described in the Shiva Purana, Linga Purana, and Skanda Purana. According to legend, this is the night Shiva performed the Ananda Tandava and drank the Halahala poison to save the universe.',
    '{"Upavasa (fasting) without food or water (or fruits only)","Four Prahar Abhishekam of Shiva Linga with panchamrita and bilva patra","All-night Jaagaran vigil with sacred hymns like Rudram and Shiva Tandava Stotram","Visiting Jyotirlinga shrines and Pashupatinath Temple in Kathmandu"}',
    '{"Fasting foods: Sabudana khichdi, singhare ka halwa, thandai, fruits, makhana"}',
    '{"Simple dhoti, white or saffron unstitched cotton garments, rudraksha beads, bhasma (sacred ash) tilak"}',
    '{"Vedic Rudram chanting","Shiva Tandava Stotram","Dhrupad devotional classical singing"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-02-26', '2025-02-27', 'Nishita Kaal Puja Feb 26 midnight (verified by Drik Panchang)', true),
      (v_id, 2026, '2026-02-15', '2026-02-16', 'Chaturdashi Tithi begins Feb 15 (verified by Drik Panchang)', true),
      (v_id, 2027, '2027-03-06', '2027-03-07', 'Phalguna Krishna Chaturdashi', true),
      (v_id, 2028, '2028-02-24', '2028-02-25', 'Calculated lunisolar', false),
      (v_id, 2029, '2029-02-12', '2029-02-13', 'Calculated lunisolar', false),
      (v_id, 2030, '2030-03-03', '2030-03-04', 'Calculated lunisolar', false),
      (v_id, 2031, '2031-02-20', '2031-02-21', 'Calculated lunisolar', false),
      (v_id, 2032, '2032-03-10', '2032-03-11', 'Calculated lunisolar', false),
      (v_id, 2033, '2033-02-27', '2033-02-28', 'Calculated lunisolar', false),
      (v_id, 2034, '2034-02-17', '2034-02-18', 'Calculated lunisolar', false),
      (v_id, 2035, '2035-03-08', '2035-03-09', 'Calculated lunisolar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 30. Ganesh Chaturthi ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'ganesh-chaturthi',
    'Ganesh Chaturthi',
    '{"Vinayaka Chaturthi","Ganeshotsav","Vinayaka Chavithi"}',
    'Maharashtra & Peninsular India — Puranic tradition',
    '{"India","Nepal","Mauritius","South Africa","United States","Global Hindu Diaspora"}',
    '{"South Asia","Global Hindu Diaspora"}',
    8, 'hindu_lunisolar',
    'Ten-day celebration honoring Ganesha, the elephant-headed deity of wisdom, beginnings, and obstacle removal. Culminates in Anant Chaturdashi with grand immersion processions (Visarjan).',
    'Celebrated privately since the Satavahana dynasty and popularized publicly by Chhatrapati Shivaji Maharaj. In 1893, freedom fighter Bal Gangadhar Tilak transformed it into a public national festival (Sarvajanik Ganeshotsav) to bridge caste barriers and organize civic resistance against British colonial rule.',
    '{"Prana Pratishtha ritual invoking life into clay idol","Shodashopachara (16-step) daily worship offering 21 Modaks and Durva grass","Uttarpuja farewell prayer on Anant Chaturdashi","Visarjan (immersion) in water bodies with chants of Ganpati Bappa Morya"}',
    '{"Modak (steamed rice-flour dumplings stuffed with coconut and jaggery)","Puran Poli","Sundal","Laddoo (Boondi and Motichoor)","Karanji"}',
    '{"Traditional Maharashtrian Nauvari saree and Kurta-Pyjama with saffron pheta (turban)"}',
    '{"Dhol Tasha percussion troupes","Ganpati Aartis (Sukhkarta Dukhharta)","Lejim folk dance rhythm"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-08-27', '2025-09-06', 'Chaturthi to Anant Chaturdashi (10-day Ganeshotsav, verified by Drik Panchang)', true),
      (v_id, 2026, '2026-09-14', '2026-09-24', 'Chaturthi to Anant Chaturdashi (verified by Drik Panchang)', true),
      (v_id, 2027, '2027-09-04', '2027-09-14', 'Bhadrapada Shukla Chaturthi', true),
      (v_id, 2028, '2028-08-24', '2028-09-03', 'Calculated lunisolar', false),
      (v_id, 2029, '2029-09-12', '2029-09-22', 'Calculated lunisolar', false),
      (v_id, 2030, '2030-09-01', '2030-09-11', 'Calculated lunisolar', false),
      (v_id, 2031, '2031-08-21', '2031-08-31', 'Calculated lunisolar', false),
      (v_id, 2032, '2032-09-08', '2032-09-18', 'Calculated lunisolar', false),
      (v_id, 2033, '2033-08-29', '2033-09-08', 'Calculated lunisolar', false),
      (v_id, 2034, '2034-09-16', '2034-09-26', 'Calculated lunisolar', false),
      (v_id, 2035, '2035-09-06', '2035-09-16', 'Calculated lunisolar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 31. Makar Sankranti & Pongal ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'makar-sankranti-pongal',
    'Makar Sankranti & Pongal',
    '{"Pongal","Uttarayan","Maghi","Khichdi","Sankranthi","Shishur Saenkrat"}',
    'Pan-Indian — Vedic solar astronomical tradition',
    '{"India","Nepal","Sri Lanka","Malaysia","Singapore","Global Diaspora"}',
    '{"South Asia","Southeast Asia","Global Diaspora"}',
    1, 'hindu_solar_fixed',
    'Major agricultural harvest festival celebrating the northward journey of the Sun (Uttarayan). Marks the end of winter solstice and beginning of longer days and harvest of winter crops (rabi).',
    'Referenced in the Mahabharata and ancient Vedic texts. Bhishma Pitamaha waited for the sacred Uttarayan sun to leave his mortal body. In Tamil Nadu, celebrated for 4 days as Bhogi, Surya Pongal, Maattu Pongal, and Kaanum Pongal.',
    '{"Holy dip (Snana) in sacred rivers (Ganga, Yamuna, Godavari, Kaveri, at Gangasagar and Prayagraj)","Uttarayan kite flying competitions filling skies across Ahmedabad and Jaipur","Boiling sweet Pongal in clay pots until it overflows, symbolizing overflowing prosperity","Decorating and honoring farm cattle on Maattu Pongal with painted horns and floral garlands","Distributing Tilgul (sesame and jaggery sweets): \"Tilgul ghya, god god bola\" (Eat sesame and speak sweetly)"}',
    '{"Sakkarai Pongal (sweet jaggery rice with ghee and cashews)","Ven Pongal (peppery savory rice)","Tilgul sesame-jaggery laddoo","Khichdi","Undhiyu mixed vegetable casserole (Gujarat)"}',
    '{"Bright silk dhotis, Kasavu sarees, vibrant Kanjeevaram sarees, festive colorful kurtas"}',
    '{"Folk Nadaswaram and Thavil festive music","Kite festival anthems and folk songs in Gujarat and Rajasthan"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-01-14', '2025-01-15', 'Makara Sankranti Surya Transit (verified by Drik Panchang)', true),
      (v_id, 2026, '2026-01-14', '2026-01-15', 'Sankranti Moment Jan 14 evening / Jan 15 morning (verified by Drik Panchang)', true),
      (v_id, 2027, '2027-01-15', '2027-01-15', 'Solar Makara Transit', true),
      (v_id, 2028, '2028-01-15', '2028-01-15', 'Solar Makara Transit (leap year)', true),
      (v_id, 2029, '2029-01-14', '2029-01-14', 'Solar Makara Transit', true),
      (v_id, 2030, '2030-01-14', '2030-01-14', 'Solar Makara Transit', true),
      (v_id, 2031, '2031-01-15', '2031-01-15', 'Solar Makara Transit', true),
      (v_id, 2032, '2032-01-15', '2032-01-15', 'Solar Makara Transit (leap year)', true),
      (v_id, 2033, '2033-01-14', '2033-01-14', 'Solar Makara Transit', true),
      (v_id, 2034, '2034-01-14', '2034-01-14', 'Solar Makara Transit', true),
      (v_id, 2035, '2035-01-15', '2035-01-15', 'Solar Makara Transit', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 32. Onam ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'onam',
    'Onam',
    '{"Thiruvonam","Kerala Harvest Festival"}',
    'Kerala, Southwestern India — Dravidian & Puranic heritage',
    '{"India (Kerala)","United Arab Emirates","Oman","Qatar","Kuwait","Global Malayali Diaspora"}',
    '{"South Asia","Middle East / Gulf Diaspora","Global Malayali Diaspora"}',
    8, 'malayalam_solar',
    'Ten-day harvest and cultural festival commemorating the mythical golden-age King Mahabali who visits his subjects each year. Celebrated across religious lines by all Malayalis worldwide.',
    'Legend recounts that King Mahabali ruled Kerala with complete egalitarianism, where all people were equal and deceit was unknown. Lord Vishnu took the Vamana avatar to test Mahabali and granted him the boon to return to Kerala once every year during Thiruvonam.',
    '{"Laying floral rangoli carpets (Athapookkalam) with fresh blossoms growing larger daily","Vallam Kali snake boat races (Nehru Trophy Boat Race on Punnamada Lake)","Pulikkali folk performance where performers paint themselves as tigers and leopards","Serving Onasadya grand multi-course feast with 26+ traditional vegetarian dishes","Onathallu martial arts bouts and Onapattu folk singing"}',
    '{"Onasadya (26-course banquet served on banana leaves): Avial, Sambar, Olan, Thoran, Kalan, Parippu, Payasam, Banana chips (Upperi), Sarkara Varatti"}',
    '{"Kerala Kasavu Mundu and Kasavu Sarees (off-white handloom cotton with gold zari border)"}',
    '{"Vanchipattu (boat song chants during snake boat races)","Onapattu folk melodies","Chenda Melam temple percussion orchestras"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-08-26', '2025-09-05', 'Atham Aug 26; Thiruvonam Sep 5 (verified by Kerala Government Calendar)', true),
      (v_id, 2026, '2026-08-16', '2026-08-26', 'Atham Aug 16; Thiruvonam Aug 26 (verified by Kerala Government Calendar)', true),
      (v_id, 2027, '2027-09-02', '2027-09-12', 'Chingam Thiruvonam', true),
      (v_id, 2028, '2028-08-22', '2028-09-01', 'Calculated Malayalam calendar', false),
      (v_id, 2029, '2029-08-11', '2029-08-21', 'Calculated Malayalam calendar', false),
      (v_id, 2030, '2030-08-30', '2030-09-09', 'Calculated Malayalam calendar', false),
      (v_id, 2031, '2031-08-20', '2031-08-30', 'Calculated Malayalam calendar', false),
      (v_id, 2032, '2032-08-08', '2032-08-18', 'Calculated Malayalam calendar', false),
      (v_id, 2033, '2033-08-28', '2033-09-07', 'Calculated Malayalam calendar', false),
      (v_id, 2034, '2034-08-18', '2034-08-28', 'Calculated Malayalam calendar', false),
      (v_id, 2035, '2035-09-06', '2035-09-16', 'Calculated Malayalam calendar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 33. Rosh Hashanah ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'rosh-hashanah',
    'Rosh Hashanah',
    '{"Jewish New Year","Yom Teruah","Day of Judgment"}',
    'Ancient Judea / Levant — Hebrew biblical tradition',
    '{"Israel","United States","France","Canada","United Kingdom","Argentina","Global Jewish Diaspora"}',
    '{"Middle East","North America","Europe","Global Jewish Diaspora"}',
    9, 'hebrew_lunisolar',
    'The Jewish New Year, marking the creation of Adam and Eve and the anniversary of the world. Inaugurates the Ten Days of Repentance (Yamim Noraim) leading to Yom Kippur.',
    'Commanded in Leviticus 23:23–25 as a holy convocation commemorated with the blowing of trumpets (shofar). In Rabbinic tradition, it is the Day of Judgment when God inscribes the destiny of every person in the Book of Life for the coming year.',
    '{"Blowing the Shofar ram''s horn in the synagogue (Tekiah, Shevarim, Teruah)","Dipping slices of sweet apple in honey with the prayer: \"May it be Your will to renew for us a good and sweet year\"","Tashlich ritual reciting prayers by a river or sea to symbolically cast sins into the depths","Candle lighting and reciting the Shehecheyanu blessing","Eating round Challah bread symbolizing the cyclical nature of time"}',
    '{"Apples dipped in honey","Round Challah with raisins","Pomegranate seeds (symbolizing 613 commandments)","Fish head or lamb head (\"that we be the head and not the tail\")","Honey cake (Lekach)"}',
    '{"White festive attire (kittel in synagogue), yarmulke, and tallit prayer shawls"}',
    '{"Shofar blasts","Avinu Malkeinu liturgical prayer chant","Unetanneh Tokef piyyut melody"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-09-22', '2025-09-24', 'Begins sunset Sep 22; 1-2 Tishrei (verified by Hebcal)', true),
      (v_id, 2026, '2026-09-11', '2026-09-13', 'Begins sunset Sep 11; 1-2 Tishrei (verified by Hebcal)', true),
      (v_id, 2027, '2027-10-01', '2027-10-03', 'Hebrew calendar 5788', true),
      (v_id, 2028, '2028-09-20', '2028-09-22', 'Calculated Hebrew calendar', false),
      (v_id, 2029, '2029-09-09', '2029-09-11', 'Calculated Hebrew calendar', false),
      (v_id, 2030, '2030-09-27', '2030-09-29', 'Calculated Hebrew calendar', false),
      (v_id, 2031, '2031-09-17', '2031-09-19', 'Calculated Hebrew calendar', false),
      (v_id, 2032, '2032-09-05', '2032-09-07', 'Calculated Hebrew calendar', false),
      (v_id, 2033, '2033-09-23', '2033-09-25', 'Calculated Hebrew calendar', false),
      (v_id, 2034, '2034-09-13', '2034-09-15', 'Calculated Hebrew calendar', false),
      (v_id, 2035, '2035-10-03', '2035-10-05', 'Calculated Hebrew calendar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 34. Sukkot ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'sukkot',
    'Sukkot',
    '{"Feast of Tabernacles","Feast of Booths","Chag HaAsif","Season of Our Joy"}',
    'Ancient Israel — Biblical Torah tradition',
    '{"Israel","United States","France","Canada","United Kingdom","Global Jewish Diaspora"}',
    '{"Middle East","North America","Europe","Global Jewish Diaspora"}',
    10, 'hebrew_lunisolar',
    'Seven-day biblical pilgrimage festival commemorating the forty years the Israelites wandered in the desert living in temporary shelters (sukkot), and celebrating the final autumn agricultural harvest.',
    'Commanded in Leviticus 23:39–43. Historically one of the three pilgrimage festivals (Shalosh Regalim) when Jews journeyed to the Temple in Jerusalem. Concludes with Shemini Atzeret and Simchat Torah celebrating the completion and restart of the annual Torah reading cycle.',
    '{"Building and decorating the Sukkah with fruit, foliage, and artwork","Dwelling (eating and sleeping) in the Sukkah for seven days","Waving the Four Species: Etrog (citron), Lulav (palm frond), Hadas (myrtle branch), and Aravah (willow branch)","Welcoming symbolic spiritual guests (Ushpizin: Abraham, Isaac, Jacob, Moses, Aaron, Joseph, David)","Hoshana Rabbah seven-circuit processions with willow branches"}',
    '{"Stuffed cabbage (Holishkes / Kreplach symbolizing packed abundance)","Autumn harvest squash and pumpkin dishes","Pomegranate and apple cakes","Fresh figs and dates"}',
    '{"Festive holiday dress for meals and synagogue services"}',
    '{"Hallel psalms chanting","Simchat Torah Klezmer dance music and Torah circle dancing (Hakafot)"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-10-06', '2025-10-13', '15-21 Tishrei (verified by Hebcal)', true),
      (v_id, 2026, '2026-09-25', '2026-10-02', '15-21 Tishrei (verified by Hebcal)', true),
      (v_id, 2027, '2027-10-15', '2027-10-22', 'Hebrew calendar 5788', true),
      (v_id, 2028, '2028-10-04', '2028-10-11', 'Calculated Hebrew calendar', false),
      (v_id, 2029, '2029-09-23', '2029-09-30', 'Calculated Hebrew calendar', false),
      (v_id, 2030, '2030-10-11', '2030-10-18', 'Calculated Hebrew calendar', false),
      (v_id, 2031, '2031-10-01', '2031-10-08', 'Calculated Hebrew calendar', false),
      (v_id, 2032, '2032-09-19', '2032-09-26', 'Calculated Hebrew calendar', false),
      (v_id, 2033, '2033-10-07', '2033-10-14', 'Calculated Hebrew calendar', false),
      (v_id, 2034, '2034-09-27', '2034-10-04', 'Calculated Hebrew calendar', false),
      (v_id, 2035, '2035-10-17', '2035-10-24', 'Calculated Hebrew calendar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 35. Hanukkah ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'hanukkah',
    'Hanukkah',
    '{"Chanukah","Festival of Lights","Feast of Dedication","Chag HaUrim"}',
    'Ancient Judea (Jerusalem) — Second Temple era',
    '{"Israel","United States","France","Canada","United Kingdom","Global Jewish Diaspora"}',
    '{"Middle East","North America","Europe","Global Jewish Diaspora"}',
    12, 'hebrew_lunisolar',
    'Eight-day winter festival celebrating the rededication of the Second Temple in Jerusalem following the Maccabean victory over the Seleucid Empire in 165 BCE, and the miracle of the oil that burned for eight days.',
    'Recorded in the First and Second Books of Maccabees and the Talmud (Shabbat 21b). Judah the Maccabee and his brothers reclaimed the desecrated Temple. Finding only one cruse of pure olive oil with the High Priest''s seal—enough for just one day—the menorah miraculous burned for eight continuous days until new oil could be consecrated.',
    '{"Kindling the Hanukkiah (menorah) starting with one light on night one and reaching eight on night eight","Using the shamash (helper candle) to light the others with blessing prayers","Displaying the Hanukkiah in a window facing the street for Pirsumei Nisa (publicizing the miracle)","Spinning the four-sided dreidel with letters Nun, Gimel, Hei, Shin (\"A great miracle happened there\")","Singing Maoz Tzur (Rock of Ages) and Hanerot Halalu hymns"}',
    '{"Latkes (crispy fried potato pancakes served with sour cream and applesauce)","Sufganiyot (jelly-filled deep-fried donuts dusted with powdered sugar)","Chocolate Hanukkah gelt coins"}',
    '{"Casual holiday clothing; festive blue, white, and silver Hanukkah sweaters"}',
    '{"Maoz Tzur liturgical melody","Dreidel song (\"I Have a Little Dreidel\")","Traditional Ladino songs like Ocho Kandelikas"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-12-14', '2025-12-22', '25 Kislev – 2 Tevet (verified by Hebcal)', true),
      (v_id, 2026, '2026-12-04', '2026-12-12', '25 Kislev – 2 Tevet (verified by Hebcal)', true),
      (v_id, 2027, '2027-12-24', '2028-01-01', 'Hebrew calendar 5788', true),
      (v_id, 2028, '2028-12-12', '2028-12-20', 'Calculated Hebrew calendar', false),
      (v_id, 2029, '2029-12-02', '2029-12-10', 'Calculated Hebrew calendar', false),
      (v_id, 2030, '2030-12-20', '2030-12-28', 'Calculated Hebrew calendar', false),
      (v_id, 2031, '2031-12-10', '2031-12-18', 'Calculated Hebrew calendar', false),
      (v_id, 2032, '2032-11-28', '2032-12-06', 'Calculated Hebrew calendar', false),
      (v_id, 2033, '2033-12-16', '2033-12-24', 'Calculated Hebrew calendar', false),
      (v_id, 2034, '2034-12-06', '2034-12-14', 'Calculated Hebrew calendar', false),
      (v_id, 2035, '2035-12-26', '2036-01-03', 'Calculated Hebrew calendar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 36. Islamic New Year ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'islamic-new-year',
    'Islamic New Year',
    '{"Hijri New Year","Ra’s al-Sana al-Hijriyya","Awal Muharram"}',
    'Medina & Arabian Peninsula — Islamic historical era',
    '{"Saudi Arabia","Egypt","Indonesia","Turkey","Morocco","Malaysia","Pakistan","Global Muslim World"}',
    '{"Middle East & North Africa","Southeast Asia","South Asia","Global Diaspora"}',
    6, 'islamic_lunar',
    'Marks the start of a new Islamic lunar calendar year and commemorates the Hijra: the migration of Prophet Muhammad and early Muslims from Mecca to Medina in 622 CE, establishing the first Muslim community.',
    'Instituted during the caliphate of Umar ibn al-Khattab in 639 CE, choosing the Hijra as the defining watershed epoch of Islamic history. Muharram is one of the four sacred months (al-Ashhur al-Hurum) in the Quran during which warfare was prohibited.',
    '{"Reflective prayers and Quran recitation at local mosques","Observing voluntary fasts during the sacred month of Muharram","Listening to historical lectures on the lessons of the Hijra","Exchanging congratulations for the new Hijri year (Kullu am wa antum bi-khair)"}',
    '{"Traditional sweet dishes: Muharram pudding / Ashure (Noah''s pudding in Turkey), sweet couscous, festive semolina porridge"}',
    '{"Traditional modest attire: Thobe, jalabiya, batik, or white prayer garments"}',
    '{"Islamic Nasheeds (devotional acapella hymns), Tala al-Badru Alayna singing"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-06-26', '2025-06-26', '1 Muharram 1447 AH (verified by Umm al-Qura Calendar)', true),
      (v_id, 2026, '2026-06-16', '2026-06-16', '1 Muharram 1448 AH (verified by Umm al-Qura Calendar)', true),
      (v_id, 2027, '2027-06-06', '2027-06-06', '1 Muharram 1449 AH', true),
      (v_id, 2028, '2028-05-25', '2028-05-25', 'Calculated lunar Hijri', false),
      (v_id, 2029, '2029-05-14', '2029-05-14', 'Calculated lunar Hijri', false),
      (v_id, 2030, '2030-05-04', '2030-05-04', 'Calculated lunar Hijri', false),
      (v_id, 2031, '2031-04-23', '2031-04-23', 'Calculated lunar Hijri', false),
      (v_id, 2032, '2032-04-11', '2032-04-11', 'Calculated lunar Hijri', false),
      (v_id, 2033, '2033-03-31', '2033-03-31', 'Calculated lunar Hijri', false),
      (v_id, 2034, '2034-03-21', '2034-03-21', 'Calculated lunar Hijri', false),
      (v_id, 2035, '2035-03-10', '2035-03-10', 'Calculated lunar Hijri', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 37. Day of Ashura ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'day-of-ashura',
    'Day of Ashura',
    '{"Youm-e-Ashura","10th of Muharram","Tamkharit (Senegal)"}',
    'Middle East & Karbala, Iraq — Islamic history',
    '{"Iraq","Iran","Pakistan","India","Lebanon","Turkey","Egypt","Senegal","Global Muslim World"}',
    '{"Middle East & North Africa","South Asia","West Africa","Global Muslim Community"}',
    7, 'islamic_lunar',
    'In Shia Islam, a solemn day of mourning commemorating the martyrdom of Imam Husayn ibn Ali (grandson of the Prophet) at the Battle of Karbala in 680 CE. In Sunni Islam, a day of voluntary fasting commemorating Prophet Moses being saved from Pharaoh when the Red Sea parted.',
    'The 10th day of Muharram has multi-layered historical resonance: Moses fasting in gratitude for the Exodus, and later the tragedy of Karbala where Imam Husayn, his family, and 72 companions stood against the tyrannical Umayyad army of Yazid I.',
    '{"Attending commemorative Majlis assemblies listening to accounts of Karbala","Reciting Ziyarat Ashura and elegiac mourning poetry","Voluntary fasting on the 9th and 10th of Muharram (Sunni tradition)","Distributing free water, sherbet, and communal food (Sabeel / Niaz) to all passersby","Preparing and sharing Ashure pudding (Noah''s pudding) across Anatolia and the Balkans"}',
    '{"Noah''s Pudding (Ashure: cracked wheat, chickpeas, dried apricots, raisins, figs, walnuts, and pomegranate)","Haleem savory meat and wheat stew","Free Sabeel milk sherbet with basil seeds"}',
    '{"Black or dark mourning clothes in Shia communities; modest white clothing for fasting prayers"}',
    '{"Sufi elegies, Marsiya recitations, Latmiya rhythmic mourning poetry"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-07-05', '2025-07-06', '10 Muharram 1447 AH (verified by Umm al-Qura Calendar)', true),
      (v_id, 2026, '2026-06-25', '2026-06-26', '10 Muharram 1448 AH (verified by Umm al-Qura Calendar)', true),
      (v_id, 2027, '2027-06-15', '2027-06-16', '10 Muharram 1449 AH', true),
      (v_id, 2028, '2028-06-03', '2028-06-04', 'Calculated lunar Hijri', false),
      (v_id, 2029, '2029-05-23', '2029-05-24', 'Calculated lunar Hijri', false),
      (v_id, 2030, '2030-05-13', '2030-05-14', 'Calculated lunar Hijri', false),
      (v_id, 2031, '2031-05-02', '2031-05-03', 'Calculated lunar Hijri', false),
      (v_id, 2032, '2032-04-20', '2032-04-21', 'Calculated lunar Hijri', false),
      (v_id, 2033, '2033-04-09', '2033-04-10', 'Calculated lunar Hijri', false),
      (v_id, 2034, '2034-03-30', '2034-03-31', 'Calculated lunar Hijri', false),
      (v_id, 2035, '2035-03-19', '2035-03-20', 'Calculated lunar Hijri', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 38. Chuseok ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'chuseok',
    'Chuseok',
    '{"Hangawi","Korean Autumn Harvest Festival","Gabae"}',
    'Korean Peninsula — Silla Kingdom (57 BCE–935 CE)',
    '{"South Korea","North Korea","Global Korean Diaspora"}',
    '{"East Asia","Global Korean Diaspora"}',
    9, 'lunisolar_korean',
    'One of Korea''s two major three-day holidays, celebrated on the autumn full moon to give thanks for the harvest and honor ancestors with ritual food offerings and tomb maintenance.',
    'Traced back to Gabae during the reign of King Yuri of Silla, which started as a month-long national weaving competition among palace women that concluded with food, wine, and festive song on the full moon.',
    '{"Charye ancestral memorial service setting out newly harvested grain, fruit, and songpyeon","Beolcho grave weeding and cleaning at ancestral burial mounds","Making Songpyeon half-moon-shaped rice cakes steamed over aromatic pine needles","Ganggangsullae traditional circular folk dance performed by women under the full moon (UNESCO Intangible Cultural Heritage)","Ssireum traditional Korean belt wrestling tournaments"}',
    '{"Songpyeon (half-moon shaped rice cakes filled with toasted sesame, red bean, or chestnuts)","Jeon savory pancakes (pajeon, donggeurangttaeng)","Japchae glass noodle stir-fry","Fresh Korean pears, persimmons, and jujubes","Baekju traditional rice wine"}',
    '{"Hanbok traditional Korean clothing with flowing jeogori jacket and chima skirt in bright holiday colors"}',
    '{"Pungmul traditional Korean percussion and farmer''s drumming","Ganggangsullae call-and-response folk singing","Gayageum zither melodies"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-10-05', '2025-10-07', '15th day of 8th lunar month (Korea National Holiday)', true),
      (v_id, 2026, '2026-09-24', '2026-09-26', '15th day of 8th lunar month (Korea National Holiday)', true),
      (v_id, 2027, '2027-09-14', '2027-09-16', '15th day of 8th lunar month', true),
      (v_id, 2028, '2028-10-02', '2028-10-04', 'Calculated lunisolar', false),
      (v_id, 2029, '2029-09-21', '2029-09-23', 'Calculated lunisolar', false),
      (v_id, 2030, '2030-09-11', '2030-09-13', 'Calculated lunisolar', false),
      (v_id, 2031, '2031-09-30', '2031-10-02', 'Calculated lunisolar', false),
      (v_id, 2032, '2032-09-18', '2032-09-20', 'Calculated lunisolar', false),
      (v_id, 2033, '2033-09-07', '2033-09-09', 'Calculated lunisolar', false),
      (v_id, 2034, '2034-09-26', '2034-09-28', 'Calculated lunisolar', false),
      (v_id, 2035, '2035-09-15', '2035-09-17', 'Calculated lunisolar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 39. Double Ninth Festival ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'double-ninth-festival',
    'Double Ninth Festival',
    '{"Chongyang Festival","Chung Yeung Festival","Seniors'' Day"}',
    'China — Han Dynasty (202 BCE–220 CE)',
    '{"China","Hong Kong","Taiwan","Singapore","Malaysia","Vietnam"}',
    '{"East Asia","Southeast Asia"}',
    10, 'lunisolar_chinese',
    'Traditional festival of longevity and ancestral remembrance. In the I Ching, nine is a yang number; the 9th day of the 9th month has double yang, considered auspicious yet dangerous, celebrated by climbing mountains, drinking chrysanthemum wine, and visiting ancestors'' graves.',
    'Legend of the Han Dynasty relates that the scholar Huan Jing was advised by a Taoist immortal to take his family to high ground with cornel branches and chrysanthemum wine to escape a deadly plague. In 1989, China designated it Senior Citizens'' Day.',
    '{"Climbing hills and high mountains (Denggao) to breathe fresh autumn air and seek elevation","Wearing fragrant Zhuyu (Cornus officinalis / dogwood) sprigs to ward off pestilence","Drinking chrysanthemum tea or wine believed to purge heat and prolong life","Visiting ancestral graves and sweeping tomb stones in Hong Kong and Guangdong","Presenting nine-layered steamed Chongyang cakes to elders as wishes for progress and longevity"}',
    '{"Chongyang cake (steamed rice cake with dates, chestnuts, and pine nuts)","Chrysanthemum wine and tea","Roast suckling pig (Hong Kong grave-sweeping offering)","Autumn crab"}',
    '{"Comfortable hiking garments, sprigs of red zhuyu pinned to clothing"}',
    '{"Traditional Chinese Guqin zither","Classical autumnal poetry recitations (Wang Wei''s Double Ninth poem)"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-10-29', '2025-10-29', '9th day of 9th lunar month (verified by Hong Kong Observatory)', true),
      (v_id, 2026, '2026-10-18', '2026-10-18', '9th day of 9th lunar month (verified by Hong Kong Observatory)', true),
      (v_id, 2027, '2027-10-08', '2027-10-08', '9th day of 9th lunar month', true),
      (v_id, 2028, '2028-10-26', '2028-10-26', 'Calculated lunisolar', false),
      (v_id, 2029, '2029-10-16', '2029-10-16', 'Calculated lunisolar', false),
      (v_id, 2030, '2030-10-05', '2030-10-05', 'Calculated lunisolar', false),
      (v_id, 2031, '2031-10-24', '2031-10-24', 'Calculated lunisolar', false),
      (v_id, 2032, '2032-10-12', '2032-10-12', 'Calculated lunisolar', false),
      (v_id, 2033, '2033-10-01', '2033-10-01', 'Calculated lunisolar', false),
      (v_id, 2034, '2034-10-20', '2034-10-20', 'Calculated lunisolar', false),
      (v_id, 2035, '2035-10-09', '2035-10-09', 'Calculated lunisolar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 40. Loy Krathong & Yi Peng ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'loy-krathong-yi-peng',
    'Loy Krathong & Yi Peng',
    '{"Festival of Lights Thailand","Yee Peng Sky Lantern Festival","Tazaungdaing (Myanmar)"}',
    'Sukhothai Kingdom, Thailand — Buddhist & Siamese heritage',
    '{"Thailand","Laos","Myanmar","Cambodia"}',
    '{"Southeast Asia"}',
    11, 'thai_lunisolar',
    'Celebrated across Thailand by releasing decorated floating baskets (krathongs) onto rivers and waterways, and in Chiang Mai launching thousands of glowing paper lanterns (khom loi) into the night sky (Yi Peng).',
    'Rooted in ancient Brahmin and Buddhist rites paying respects to Phra Mae Khongkha (the Goddess of Water) and venerating the sacred footprint of the Buddha beside the mythical Nammatha River.',
    '{"Crafting krathongs from banana trunk slices, folded banana leaves, orchids, marigolds, three incense sticks, and a candle","Placing coin and nail clippings inside the krathong to symbolize shedding misfortune","Floating the lit krathong gently away onto water with a silent prayer","Releasing Khom Loi sky lanterns in northern Thailand (Chiang Mai)","Nopphamat beauty pageants and traditional Lanna folk dances"}',
    '{"Khao Soi coconut curry noodles (Northern Thailand)","Sai Oua Chiang Mai herbal sausage","Khanom Krok coconut rice pancakes","Pad Thai street food"}',
    '{"Traditional Thai silk attire: Chut Thai, sinh wrap skirts, Sabai shawls"}',
    '{"Loy Krathong traditional song played on Ranat ek xylophone, Sueng lute, and Saw duang fiddle"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-11-05', '2025-11-06', 'Full moon 12th Thai lunar month (verified by Tourism Authority of Thailand)', true),
      (v_id, 2026, '2026-11-24', '2026-11-25', 'Full moon 12th Thai lunar month (verified by Tourism Authority of Thailand)', true),
      (v_id, 2027, '2027-11-13', '2027-11-14', 'Thai lunar calendar', true),
      (v_id, 2028, '2028-11-01', '2028-11-02', 'Calculated Thai lunisolar', false),
      (v_id, 2029, '2029-11-20', '2029-11-21', 'Calculated Thai lunisolar', false),
      (v_id, 2030, '2030-11-10', '2030-11-11', 'Calculated Thai lunisolar', false),
      (v_id, 2031, '2031-11-28', '2031-11-29', 'Calculated Thai lunisolar', false),
      (v_id, 2032, '2032-11-16', '2032-11-17', 'Calculated Thai lunisolar', false),
      (v_id, 2033, '2033-11-06', '2033-11-07', 'Calculated Thai lunisolar', false),
      (v_id, 2034, '2034-11-25', '2034-11-26', 'Calculated Thai lunisolar', false),
      (v_id, 2035, '2035-11-14', '2035-11-15', 'Calculated Thai lunisolar', false)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 41. Matariki ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'matariki',
    'Matariki',
    '{"Te Kāhui o Matariki","Māori New Year","Pleiades Rising"}',
    'Aotearoa / New Zealand — Indigenous Māori heritage',
    '{"New Zealand"}',
    '{"Oceania"}',
    6, 'maori_maramataka',
    'The rising of the Matariki star cluster (the Pleiades) in the pre-dawn winter sky marks the beginning of the Māori New Year. A time to remember those who passed, celebrate the present harvest with feasts, and plan for the future.',
    'Celebrated by iwi (tribes) across Aotearoa for centuries according to the Maramataka lunar calendar. In 2022, New Zealand officially legislated Matariki as a national public holiday, the first indigenous public holiday in the nation''s history.',
    '{"Pre-dawn stargazing ceremonies calling out the names of relatives who passed away during the previous year (Pōhutukawa star)","Hautapu ceremony: cooking food representing earth, water, and air in an earth oven, lifting the lids at dawn to release steam as an offering to the stars","Lighting fires and candles to welcome the dawn of the new cycle","Flying traditional Māori kites (manu tukutuku) to connect the heavens and earth","Wānanga tribal storytelling and passing genealogical knowledge (whakapapa)"}',
    '{"Hāngī feast (pork, chicken, sweet potato kūmara, pumpkin, and stuffing cooked underground over volcanic rocks)","Rēwena potato sourdough bread","Kaimoana seafood (pāua, mussels, smoked eel)","Boil-up with watercress and doughboys"}',
    '{"Kākahu feather cloaks, traditional woven Māori flax garments (korowai), pounamu (greenstone jade) pendants"}',
    '{"Waiata traditional melodic songs","Taonga pūoro traditional musical instruments (flutes and conch shells)","Kapa haka cultural performance"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-06-20', '2025-06-20', 'Official New Zealand Statutory Public Holiday', true),
      (v_id, 2026, '2026-07-10', '2026-07-10', 'Official New Zealand Statutory Public Holiday', true),
      (v_id, 2027, '2027-06-25', '2027-06-25', 'Official New Zealand Statutory Public Holiday', true),
      (v_id, 2028, '2028-07-14', '2028-07-14', 'Official New Zealand Statutory Public Holiday', true),
      (v_id, 2029, '2029-07-06', '2029-07-06', 'Official New Zealand Statutory Public Holiday', true),
      (v_id, 2030, '2030-06-21', '2030-06-21', 'Official New Zealand Statutory Public Holiday', true),
      (v_id, 2031, '2031-07-11', '2031-07-11', 'Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule', true),
      (v_id, 2032, '2032-07-02', '2032-07-02', 'Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule', true),
      (v_id, 2033, '2033-06-24', '2033-06-24', 'Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule', true),
      (v_id, 2034, '2034-07-07', '2034-07-07', 'Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule', true),
      (v_id, 2035, '2035-06-29', '2035-06-29', 'Te Pire mō te Hararei Tūmatanui o Te Kāhui o Matariki schedule', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 42. Inti Raymi ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'inti-raymi',
    'Inti Raymi',
    '{"Festival of the Sun","Fiesta del Sol"}',
    'Cusco, Peru — Inca Empire (Tawantinsuyu)',
    '{"Peru","Ecuador","Bolivia"}',
    '{"Americas","South America"}',
    6, 'fixed_gregorian',
    'Ancient Inca theatrical and religious ceremony honoring Inti, the Sun God, and celebrating the winter solstice which marks the shortest day and the return of lengthening sunlight in the southern hemisphere.',
    'Instituted by Inca Emperor Pachacuti in 1412 CE at Cusco. Banned by Spanish Viceroy Francisco de Toledo in 1572 as pagan, it was revived in 1944 by Peruvian writer Faustino Espinoza Navarro based on the chronicles of Garcilaso de la Vega and is now celebrated annually at the fortress of Sacsayhuamán.',
    '{"Inca emperor (Sapa Inca) greets the dawn at the Qorikancha Sun Temple","Procession of the four suyus (quadrants) of the Inca Empire to Plaza de Armas","Ritual invocation in Quechua to Inti and Pachamama (Mother Earth) at Sacsayhuamán","Theatrical sacrifice of a llama and reading of omens for the coming year","Sankhu ritual sacred corn bread distributed to the populace"}',
    '{"Chiri Uchu (traditional cold Cusco banquet: guinea pig, chicken, jerky ch''arki, toasted corn, fish eggs, and cheese)","Pachamanca earthen barbecue","Chicha de jora fermented corn drink"}',
    '{"Elaborate gold-threaded Inca royal tunics (Unku), feather crowns (Mascaypacha), colorful woven Andean ponchos and chullo caps"}',
    '{"Pututu conch shell trumpets, panpipes (zampoñas and quenas), traditional bombo drums, Quechua choral anthems"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-06-24', '2025-06-24', 'Fixed Solstice Day (Cusco Civic Holiday)', true),
      (v_id, 2026, '2026-06-24', '2026-06-24', 'Fixed Solstice Day (Cusco Civic Holiday)', true),
      (v_id, 2027, '2027-06-24', '2027-06-24', 'Fixed June 24', true),
      (v_id, 2028, '2028-06-24', '2028-06-24', 'Fixed June 24', true),
      (v_id, 2029, '2029-06-24', '2029-06-24', 'Fixed June 24', true),
      (v_id, 2030, '2030-06-24', '2030-06-24', 'Fixed June 24', true),
      (v_id, 2031, '2031-06-24', '2031-06-24', 'Fixed June 24', true),
      (v_id, 2032, '2032-06-24', '2032-06-24', 'Fixed June 24', true),
      (v_id, 2033, '2033-06-24', '2033-06-24', 'Fixed June 24', true),
      (v_id, 2034, '2034-06-24', '2034-06-24', 'Fixed June 24', true),
      (v_id, 2035, '2035-06-24', '2035-06-24', 'Fixed June 24', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 43. Juneteenth ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'juneteenth',
    'Juneteenth',
    '{"Juneteenth National Independence Day","Freedom Day","Jubilee Day","Emancipation Day"}',
    'Galveston, Texas, United States — African American heritage',
    '{"United States"}',
    '{"North America","Americas"}',
    6, 'fixed_gregorian',
    'Commemorates the day on June 19, 1865, when Union General Gordon Granger arrived in Galveston, Texas, and issued General Order No. 3, announcing the freedom of the last remaining enslaved African Americans in the Confederacy, two and a half years after the Emancipation Proclamation.',
    'First celebrated in Texas in 1866 with prayer meetings and spirituals. The tradition spread throughout the United States during the Great Migration. In 2021, it was officially signed into law as the eleventh United States federal holiday.',
    '{"Reading aloud of General Order No. 3 and the Emancipation Proclamation","Singing \"Lift Every Voice and Sing\" (the Black National Anthem)","Community prayer services and spirituals in historical Black churches","Eating traditional red-colored foods symbolizing resilience, sacrifice, and joy","Family genealogy presentations and oral history recordings"}',
    '{"Red-colored foods: Red velvet cake, barbecue ribs with red sauce, watermelon, strawberry soda, hibiscus tea (sorrel), strawberry pie","Collard greens, black-eyed peas, cornbread"}',
    '{"Juneteenth festival t-shirts, African wax-print Dashikis and Kente cloths, red, black, and green Pan-African colors"}',
    '{"\"Lift Every Voice and Sing\"","Gospel choirs","Jazz, Blues, and contemporary R&B"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-06-19', '2025-06-19', 'US Federal Holiday', true),
      (v_id, 2026, '2026-06-19', '2026-06-19', 'US Federal Holiday', true),
      (v_id, 2027, '2027-06-19', '2027-06-19', 'US Federal Holiday', true),
      (v_id, 2028, '2028-06-19', '2028-06-19', 'US Federal Holiday', true),
      (v_id, 2029, '2029-06-19', '2029-06-19', 'US Federal Holiday', true),
      (v_id, 2030, '2030-06-19', '2030-06-19', 'US Federal Holiday', true),
      (v_id, 2031, '2031-06-19', '2031-06-19', 'US Federal Holiday', true),
      (v_id, 2032, '2032-06-19', '2032-06-19', 'US Federal Holiday', true),
      (v_id, 2033, '2033-06-19', '2033-06-19', 'US Federal Holiday', true),
      (v_id, 2034, '2034-06-19', '2034-06-19', 'US Federal Holiday', true),
      (v_id, 2035, '2035-06-19', '2035-06-19', 'US Federal Holiday', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 44. Carnival & Mardi Gras ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'carnival-mardi-gras',
    'Carnival & Mardi Gras',
    '{"Mardi Gras","Carnaval do Brasil","Carnevale di Venezia","Shrove Tuesday","Fat Tuesday"}',
    'Southern Europe — Western Christian Pre-Lenten tradition',
    '{"Brazil","United States (New Orleans)","Italy (Venice)","Trinidad and Tobago","France","Germany","Colombia"}',
    '{"Americas","Europe","Caribbean"}',
    2, 'western_liturgical',
    'Global pre-Lenten festival of parades, masquerades, music, and indulgence before the forty-day fasting period of Lent. Celebrated with distinctive traditions in Rio de Janeiro, New Orleans, Venice, and Port of Spain.',
    'Evolved from ancient Roman Saturnalia and medieval European Christian feasts. The word Carnival derives from medieval Latin "carne levare" (to remove meat), as households consumed rich meat, fats, and dairy before the solemn fast of Ash Wednesday.',
    '{"Parades of masked dancers and marching brass bands","Crowning of King Momo (Brazil) or Rex, King of Carnival (New Orleans)","Finding the plastic baby hidden inside the King Cake (bringing good luck)","Samba school competitions judged on theme, music, and costume"}',
    '{"King cake with purple, green, and gold sugar","Feijoada black bean stew (Brazil)","Pancakes / crêpes (Shrove Tuesday UK/France)","Frittelle and Galani fried pastries (Venice)","Beignets"}',
    '{"Elaborate feathered and beaded samba costumes, Venetian porcelain masks and Renaissance capes, Mardi Gras purple/green/gold beads"}',
    '{"Brazilian Samba-enredo","New Orleans Dixieland brass bands","Trinidad Soca and Calypso"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-03-04', '2025-03-04', 'Mardi Gras day (Ash Wednesday falls Mar 5; Rio Carnival Feb 28–Mar 4)', true),
      (v_id, 2026, '2026-02-17', '2026-02-17', 'Mardi Gras day (Ash Wednesday Feb 18; Rio Feb 13–17)', true),
      (v_id, 2027, '2027-02-09', '2027-02-09', 'Pre-Lenten Tuesday', true),
      (v_id, 2028, '2028-02-29', '2028-02-29', 'Pre-Lenten Tuesday in leap year', true),
      (v_id, 2029, '2029-02-13', '2029-02-13', 'Pre-Lenten Tuesday', true),
      (v_id, 2030, '2030-03-05', '2030-03-05', 'Pre-Lenten Tuesday', true),
      (v_id, 2031, '2031-02-25', '2031-02-25', 'Pre-Lenten Tuesday', true),
      (v_id, 2032, '2032-02-10', '2032-02-10', 'Pre-Lenten Tuesday in leap year', true),
      (v_id, 2033, '2033-03-01', '2033-03-01', 'Pre-Lenten Tuesday', true),
      (v_id, 2034, '2034-02-21', '2034-02-21', 'Pre-Lenten Tuesday', true),
      (v_id, 2035, '2035-02-06', '2035-02-06', 'Pre-Lenten Tuesday', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

  -- ── 45. Saint Patrick’s Day ──────────────────────────────────
  INSERT INTO public.festivals (id, slug, name, alternate_names, cultural_origin, countries, regions,
    typical_month, date_rule, significance, history, rituals, food, clothing, music)
  VALUES (
    gen_random_uuid(),
    'st-patricks-day',
    'Saint Patrick’s Day',
    '{"Feast of Saint Patrick","Lá Fhéile Pádraig"}',
    'Ireland — Christian feast day & Irish national tradition',
    '{"Ireland","United States","United Kingdom","Canada","Australia","Global Irish Diaspora"}',
    '{"Europe","North America","Global Irish Diaspora"}',
    3, 'fixed_gregorian',
    'Celebrates Saint Patrick (c. 385–461 CE), the patron saint of Ireland who brought Christianity to the island, using the three-leaved shamrock to explain the Holy Trinity. Celebrated globally as a festival of Irish culture, music, parades, and wearing the green.',
    'Made an official Christian feast day in the early 17th century by the Catholic Church. The modern secular celebration with parades was popularized by Irish emigrants in Boston and New York City in the 18th century as an expression of cultural identity.',
    '{"Wearing green clothing, rosettes, or real shamrocks (Trifolium dubium) on the lapel","The \"drowning of the shamrock\" in whiskey at the end of the day","Parades featuring pipe and drum bands, step dancers, and community floats","Attending Mass or Anglican services of thanksgiving"}',
    '{"Corned beef and cabbage (Irish-American)","Irish soda bread with caraway","Colcannon mashed potatoes with kale","Irish lamb stew","Guinness stout"}',
    '{"Emerald green attire, tweed caps, knitted Aran wool sweaters, shamrock badges"}',
    '{"Irish traditional folk music: Uilleann pipes, tin whistle, bodhrán drum, fiddle jigs and reels"}'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    significance = EXCLUDED.significance,
    history = EXCLUDED.history
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'festival_occurrences') THEN
    INSERT INTO public.festival_occurrences (festival_id, year, start_date, end_date, region_notes, verified) VALUES
      (v_id, 2025, '2025-03-17', '2025-03-17', 'Fixed Gregorian March 17 (Ireland Public Holiday)', true),
      (v_id, 2026, '2026-03-17', '2026-03-17', 'Fixed March 17', true),
      (v_id, 2027, '2027-03-17', '2027-03-17', 'Fixed March 17', true),
      (v_id, 2028, '2028-03-17', '2028-03-17', 'Fixed March 17', true),
      (v_id, 2029, '2029-03-17', '2029-03-17', 'Fixed March 17', true),
      (v_id, 2030, '2030-03-17', '2030-03-17', 'Fixed March 17', true),
      (v_id, 2031, '2031-03-17', '2031-03-17', 'Fixed March 17', true),
      (v_id, 2032, '2032-03-17', '2032-03-17', 'Fixed March 17', true),
      (v_id, 2033, '2033-03-17', '2033-03-17', 'Fixed March 17', true),
      (v_id, 2034, '2034-03-17', '2034-03-17', 'Fixed March 17', true),
      (v_id, 2035, '2035-03-17', '2035-03-17', 'Fixed March 17', true)
    ON CONFLICT (festival_id, year, start_date) DO NOTHING;
  END IF;

END $$;

COMMIT;
