-- ============================================================
-- 0016_seed_cultural_master_dispatches.sql
-- Seed 33 Real Cultural Dispatches from Hailey_1M_Culture_Master_Dataset/photos
-- Authored exclusively by primary cultural archivist Jeevan Surya (fdd83264-e15c-4b05-8f75-68bbd577df3c)
-- ============================================================

DO $$
DECLARE
  v_author_id uuid := 'fdd83264-e15c-4b05-8f75-68bbd577df3c';
  v_comm_arch uuid;
  v_comm_perf uuid;
  v_comm_fest uuid;
  v_comm_urb  uuid;
  v_comm_her  uuid;

  v_tag_south_asian int;
  v_tag_japanese    int;
  v_tag_middle_east int;
  v_tag_streetwear  int;
  v_tag_celtic      int;
  v_tag_workwear    int;
  v_tag_street_ph   int;
  v_tag_analog_ph   int;
  v_tag_latino      int;
  v_tag_oral_hist   int;

  v_p01 uuid; v_p02 uuid; v_p03 uuid; v_p04 uuid; v_p05 uuid;
  v_p06 uuid; v_p07 uuid; v_p08 uuid; v_p09 uuid; v_p10 uuid;
  v_p11 uuid; v_p12 uuid; v_p13 uuid; v_p14 uuid; v_p15 uuid;
  v_p16 uuid; v_p17 uuid; v_p18 uuid; v_p19 uuid; v_p20 uuid;
  v_p21 uuid; v_p22 uuid; v_p23 uuid; v_p24 uuid; v_p25 uuid;
  v_p26 uuid; v_p27 uuid; v_p28 uuid; v_p29 uuid; v_p30 uuid;
  v_p31 uuid; v_p32 uuid; v_p33 uuid;
BEGIN
  -- 1. Resolve communities
  SELECT id INTO v_comm_arch FROM public.communities WHERE slug = 'sacred-architecture' LIMIT 1;
  SELECT id INTO v_comm_perf FROM public.communities WHERE slug = 'performing-arts' LIMIT 1;
  SELECT id INTO v_comm_fest FROM public.communities WHERE slug = 'festivals-pageantry' LIMIT 1;
  SELECT id INTO v_comm_urb  FROM public.communities WHERE slug = 'urban-expression' LIMIT 1;
  SELECT id INTO v_comm_her  FROM public.communities WHERE slug = 'living-heritage' LIMIT 1;

  -- 2. Resolve tags
  SELECT id INTO v_tag_south_asian FROM public.tags WHERE slug = 'south-asian' LIMIT 1;
  SELECT id INTO v_tag_japanese    FROM public.tags WHERE slug = 'japanese' LIMIT 1;
  SELECT id INTO v_tag_middle_east FROM public.tags WHERE slug = 'middle-eastern' LIMIT 1;
  SELECT id INTO v_tag_streetwear  FROM public.tags WHERE slug = 'streetwear' LIMIT 1;
  SELECT id INTO v_tag_celtic      FROM public.tags WHERE slug = 'celtic' LIMIT 1;
  SELECT id INTO v_tag_workwear    FROM public.tags WHERE slug = 'workwear' LIMIT 1;
  SELECT id INTO v_tag_street_ph   FROM public.tags WHERE slug = 'street-photography' LIMIT 1;
  SELECT id INTO v_tag_analog_ph   FROM public.tags WHERE slug = 'analog-film-photo' LIMIT 1;
  SELECT id INTO v_tag_latino      FROM public.tags WHERE slug = 'latino' LIMIT 1;
  SELECT id INTO v_tag_oral_hist   FROM public.tags WHERE slug = 'oral-history' LIMIT 1;

  -- 3. Clear existing seed posts to prevent duplicates
  DELETE FROM public.posts WHERE author_id = v_author_id;

  -- 4. Insert 33 Cultural Dispatches
  -- 01. Taj Mahal
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'Taj Mahal (Agra, Uttar Pradesh) — Commissioned in 1631 by Mughal Emperor Shah Jahan. Built with translucent Makrana white marble, featuring pietra dura (parchin kari) floral stone inlays with lapis lazuli, carnelian, and jade. The central dome rises 73 meters, framed by four minarets tilted slightly outward to protect the tomb in case of earthquakes. A testament to Persian, Islamic, and Indian architectural synthesis.', '/photos/culture_01.jpeg', 'Archaeological Survey of India / Hailey Field Archive', 'https://whc.unesco.org/en/list/252', true, 'published', 'GENERAL', now() - interval '33 days')
  RETURNING id INTO v_p01;

  -- 02. Sanchi Stupa
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'The Great Stupa at Sanchi (Madhya Pradesh) — Commissioned by Emperor Ashoka in the 3rd Century BCE. Its hemispherical sandstone dome represents the cosmic vault and the parinirvana of the Buddha. The four elaborately carved Toranas (ornamental gateways) depict Jataka tales, sacred yakshinis, and Buddhist aniconic emblems, standing as one of the oldest preserved stone structures in South Asia.', '/photos/culture_02.jpeg', 'UNESCO Living Heritage Archive', 'https://whc.unesco.org/en/list/524', true, 'published', 'GENERAL', now() - interval '32 days')
  RETURNING id INTO v_p02;

  -- 03. White House
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'The White House (Washington, D.C.) — Designed by Irish-born architect James Hoban in the Neoclassical Federal style, constructed between 1792 and 1800 using Aquia Creek sandstone. The iconic South Portico with its Ionic colonnade frames the Ellipse and the Washington Monument obelisk, embodying the civic architectural ideals of the American Republic.', '/photos/culture_03.jpeg', 'National Park Service / Architectural Heritage', 'https://www.nps.gov/whho/index.htm', true, 'published', 'GENERAL', now() - interval '31 days')
  RETURNING id INTO v_p03;

  -- 04. Bharatanatyam
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Bharatanatyam (Tamil Nadu, India) — Ancient classical dance form codified in the Natya Shastra by sage Bharata Muni. Dancers in pleated Kanchipuram silk saris with zari borders and brass salangai (ankle bells) perform intricate nritta (pure rhythmic footwork) and abhinaya (expressive facial gestures). Each mudra conveys spiritual and philosophical narratives of devotion and nature.', '/photos/culture_04.jpeg', 'Sangeet Natak Akademi Archives', 'https://sangeetnatak.gov.in', true, 'published', 'GENERAL', now() - interval '30 days')
  RETURNING id INTO v_p04;

  -- 05. Dome of the Rock
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'Dome of the Rock (Jerusalem) — Umayyad architectural masterpiece completed in 691 CE under Caliph Abd al-Malik. The octagonal arcade is adorned with intricate glazed Persian ceramic tiles, Quranic calligraphy friezes, and an exquisite gilded wooden dome crowning the Foundation Stone. One of the earliest and most revered monuments of Islamic civilization.', '/photos/culture_05.jpeg', 'Islamic Endowment & Heritage Survey', 'https://whc.unesco.org/en/list/148', true, 'published', 'GENERAL', now() - interval '29 days')
  RETURNING id INTO v_p05;

  -- 06. Statue of Liberty
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'Statue of Liberty (New York Harbor) — Designed by French sculptor Frédéric-Auguste Bartholdi with internal iron pylon framework by Gustave Eiffel. Dedicated in 1886 as a gift of friendship from France to the United States. Its repoussé copper skin, naturally patinated to verdigris green, stands on a star-shaped granite pedestal on Liberty Island, welcoming generations of immigrants.', '/photos/culture_06.jpeg', 'National Park Service Archives', 'https://www.nps.gov/stli/index.htm', true, 'published', 'GENERAL', now() - interval '28 days')
  RETURNING id INTO v_p06;

  -- 07. Bronx Street Dance
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_urb, 'Bronx Hip-Hop & B-Boying Culture (New York) — Originating in the South Bronx during the early 1970s block parties pioneered by DJ Kool Herc. Dancers execute toprock, downrock, power moves, and freezes on concrete and linoleum. B-boying grew from an inner-city street expression into a globally recognized Olympic discipline and cultural pillar.', '/photos/culture_07.jpeg', 'Urban Arts Cultural Archive', 'https://www.bronxmuseum.org', true, 'published', 'GENERAL', now() - interval '27 days')
  RETURNING id INTO v_p07;

  -- 08. Macy's Parade
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Macy''s Thanksgiving Day Parade (Manhattan, New York) — American folkloric street procession held annually since 1924. Featuring giant helium character balloons first crafted with puppeteer Tony Sarg, marching bands from every state, and theatrical floats passing through Herald Square. A living tradition celebrating mid-century American holiday spectacle.', '/photos/culture_08.jpeg', 'New York Historical Pageant Archive', 'https://www.macys.com/p/parade/', true, 'published', 'GENERAL', now() - interval '26 days')
  RETURNING id INTO v_p08;

  -- 09. Kuchipudi Natya
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Kuchipudi (Andhra Pradesh, India) — Classical dance-drama originating from the village of Kuchipudi in Krishna district. Dancers balance on brass plates (Tarangam) while maintaining rhythmic precision and expressive sanchari bhava. Characterized by vivacious fast-paced footwork, sculpted postures, and intricate abhinaya honoring sacred epics.', '/photos/culture_09.jpeg', 'Andhra Pradesh Department of Culture', 'https://culture.ap.gov.in', true, 'published', 'GENERAL', now() - interval '25 days')
  RETURNING id INTO v_p09;

  -- 10. Cham Monastic Dance
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Monastic Cham Dance (Tibet / Bhutan) — Sacred ritual dance performed by Buddhist monks wearing ceremonial silk brocade robes and symbolic hats during religious festivals (Tshechus). The slow, rhythmic circular movements, accompanied by long dungchen horns and cymbals, symbolize spiritual purification and the triumph of wisdom over ignorance.', '/photos/culture_10.jpeg', 'Himalayan Living Heritage Trust', 'https://whc.unesco.org', true, 'published', 'GENERAL', now() - interval '24 days')
  RETURNING id INTO v_p10;

  -- 11. Hemis Festival
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Hemis Festival Cham (Ladakh, India) — Sacred masked pageant held at Hemis Gompa honoring Guru Padmasambhava. Monks don fearsome, hand-carved wooden masks depicting Mahakala and wrathful deities. The synchronized ritual movements represent the subjugation of negative energies, attracting pilgrims across the high-altitude Trans-Himalayan valleys.', '/photos/culture_11.jpeg', 'Ladakh Monastic Archive', 'https://leh.nic.in', true, 'published', 'GENERAL', now() - interval '23 days')
  RETURNING id INTO v_p11;

  -- 12. Bharatanatyam Varnam
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Bharatanatyam Varnam (South India) — The central and most demanding suite of the Margam repertoire. Dancers perform complex rhythmic teermanams alongside soulful abhinaya, embodying aesthetic rasa (spiritual emotion). The interplay between rhythm, melody, and devotional poetry captures centuries of living temple lineage.', '/photos/culture_12.jpeg', 'Kalakshetra Heritage Collection', 'https://www.kalakshetra.in', true, 'published', 'GENERAL', now() - interval '22 days')
  RETURNING id INTO v_p12;

  -- 13. Kathina Robe Ceremony
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_her, 'Kathina Robe Offering (Southeast Asia) — Theravada Buddhist festival held at the close of the three-month Vassa rainy-season retreat. Lay devotees offer new handwoven saffron and ochre robes, lotus flowers, and alms to the sangha (monastic community). A centuries-old communal ceremony fostering solidarity and merit-making.', '/photos/culture_13.jpeg', 'Theravada Monastic Heritage Association', 'https://en.wikipedia.org/wiki/Kathina', true, 'published', 'GENERAL', now() - interval '21 days')
  RETURNING id INTO v_p13;

  -- 14. Hemis Pilgrimage
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Hemis Monastic Gathering (Spiti & Ladakh) — High-altitude congregation of Buddhist monks, lamas, and mountain communities. Adorned in crimson woolen robes and surrounded by five-colored prayer flags (lungta), the congregation gathers for monastic discourses, cham blessings, and collective prayers for universal compassion.', '/photos/culture_14.jpeg', 'Trans-Himalayan Cultural Society', 'https://leh.nic.in', true, 'published', 'GENERAL', now() - interval '20 days')
  RETURNING id INTO v_p14;

  -- 15. Himeji Castle
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'Himeji Castle (Hyogo Prefecture, Japan) — Regarded as the finest surviving example of early 17th-century Japanese feudal castle architecture. Featuring pristine white-plastered timber walls, tiered gables (chidori hafu), and an ingenious defensive spiral layout designed by Toyotomi Hideyoshi and Ikeda Terumasa. Recognized as Japan''s first UNESCO World Cultural Heritage site.', '/photos/culture_15.jpeg', 'Himeji Cultural Heritage Preservation Division', 'https://whc.unesco.org/en/list/661', true, 'published', 'GENERAL', now() - interval '19 days')
  RETURNING id INTO v_p15;

  -- 16. Colosseum
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'The Colosseum (Rome, Italy) — Built under emperors Vespasian and Titus between 72 and 80 CE. Constructed of travertine limestone, tuff, and brick-faced concrete, it could seat over 50,000 spectators across three tiers of Doric, Ionic, and Corinthian arches. An enduring symbol of ancient Roman civil engineering and urban spectacle.', '/photos/culture_16.jpeg', 'Parco Archeologico del Colosseo', 'https://whc.unesco.org/en/list/91', true, 'published', 'GENERAL', now() - interval '18 days')
  RETURNING id INTO v_p16;

  -- 17. Seiganto-ji Pagoda & Nachi Falls
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'Seiganto-ji Pagoda & Nachi Falls (Wakayama, Japan) — Spiritual heart of the Kumano Kodo pilgrimage routes. The three-tiered vermilion pagoda stands against the dramatic 133-meter Nachi Falls, a sacred shintai (dwelling of kami) revered in both Shinto and Tendai Buddhist syncretism for over a millennium.', '/photos/culture_17.jpeg', 'Kumano Sacred Sites Heritage Board', 'https://whc.unesco.org/en/list/1142', true, 'published', 'GENERAL', now() - interval '17 days')
  RETURNING id INTO v_p17;

  -- 18. Diwali Rangoli
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Diwali Rangoli & Deepotsav (India) — Sacred floor art created during the Festival of Lights using colored quartz powder, flower petals, and rice flour. Intricate geometric mandalas and peacock patterns are illuminated with handmade clay oil lamps (diyas), symbolizing the triumph of light over darkness and welcoming prosperity and auspicious energy.', '/photos/culture_18.jpeg', 'Folk Art and Ritual Heritage Survey', 'https://indiaculture.gov.in', true, 'published', 'GENERAL', now() - interval '16 days')
  RETURNING id INTO v_p18;

  -- 19. Eiffel Tower
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'The Eiffel Tower (Paris, France) — Erected on the Champ de Mars for the 1889 Exposition Universelle to celebrate the centennial of the French Revolution. Built with 18,038 puddling iron parts and 2.5 million rivets by Gustave Eiffel''s engineering atelier, rising 330 meters as an enduring icon of French industrial modernism.', '/photos/culture_19.jpeg', 'Société d''Exploitation de la Tour Eiffel', 'https://www.toureiffel.paris', true, 'published', 'GENERAL', now() - interval '15 days')
  RETURNING id INTO v_p19;

  -- 20. Zaduszki Cemetery Vigil
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_her, 'Zaduszki & All Saints'' Night (Central & Eastern Europe) — Ancient memorial observance on November 1st and 2nd. Families gather in ancestral cemeteries to light thousands of znicze (votive glass candles) and lay fresh chrysanthemums on gravestones, transforming the twilight burial grounds into luminous seas of ancestral remembrance.', '/photos/culture_20.jpeg', 'European Ethnographic Living Archive', 'https://en.wikipedia.org/wiki/Zaduszki', true, 'published', 'GENERAL', now() - interval '14 days')
  RETURNING id INTO v_p20;

  -- 21. Key Monastery
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'Key Monastery (Spiti Valley, India) — Tibetan Buddhist monastery of the Gelugpa sect perched at 4,166 meters above sea level overlooking the Spiti River. Established in the 11th century, its fortress-like stacked architecture houses priceless thangkas, ancient manuscripts, and sacred prayer halls that have endured high-altitude Himalayan isolation.', '/photos/culture_21.jpeg', 'Spiti Heritage Preservation Council', 'https://himachaltourism.gov.in', true, 'published', 'GENERAL', now() - interval '13 days')
  RETURNING id INTO v_p21;

  -- 22. Irish Step Dance
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Irish Step Dancing (Ireland & Global Diaspora) — Traditional step dance characterized by a rigid upper torso and lightning-fast precision footwork. Dancers at regional Feis competitions wear elaborately hand-embroidered solo dresses featuring Celtic knotwork, Tara brooches, and stiffened hornpipe shoes, celebrating Gaelic cultural resurgence.', '/photos/culture_22.jpeg', 'An Coimisiún le Rincí Gaelacha', 'https://www.clrg.ie', true, 'published', 'GENERAL', now() - interval '12 days')
  RETURNING id INTO v_p22;

  -- 23. Oktoberfest
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Oktoberfest & Bavarian Volkstradition (Munich, Germany) — World''s largest folk festival, held since 1810 on the Theresienwiese. Revelers in authentic Bavarian Tracht — hand-stitched leather Lederhosen and alpine Dirndl — gather beneath giant hops-wreath chandeliers in historic brewery tents to brass Blasmusik and centuries-old culinary heritage.', '/photos/culture_23.jpeg', 'Munich City Heritage Collection', 'https://www.oktoberfest.de', true, 'published', 'GENERAL', now() - interval '11 days')
  RETURNING id INTO v_p23;

  -- 24. Persian Silk Carpet
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_her, 'Persian & Islamic Silk Tapestries — Historic textile masterpieces featuring hand-knotted silk on silk foundations with knot densities exceeding 800 knots per square inch. Master weavers from Tabriz, Isfahan, and Kashan incorporate sacred medallion patterns, cypress trees of life, and arabesque foliage dyed with madder root, indigo, and saffron.', '/photos/culture_24.jpeg', 'National Museum of Islamic Art', 'https://www.metmuseum.org', true, 'published', 'GENERAL', now() - interval '10 days')
  RETURNING id INTO v_p24;

  -- 25. Sufi Whirling Dervishes
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Mevlevi Sema Ceremony (Konya, Turkey) — 13th-century Sufi spiritual ceremony inspired by mystic poet Jalaluddin Rumi. Dervishes wearing tall felt camel-hair hats (sikke) representing ego''s tombstone and white flared skirts (tennure) spin with their right palms turned toward heaven to receive divine grace and left palms toward earth to distribute love.', '/photos/culture_25.jpeg', 'UNESCO Intangible Cultural Heritage Registry', 'https://ich.unesco.org/en/RL/mevlevi-sema-ceremony-00065', true, 'published', 'GENERAL', now() - interval '9 days')
  RETURNING id INTO v_p25;

  -- 26. Andalusian Flamenco
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Andalusian Flamenco (Seville & Granada, Spain) — Deep expressive art form blending Romani, Moorish, Jewish, and traditional Andalusian roots. Featuring cante jondo (deep singing), passionate toque on Spanish cypress guitar, and explosive zapateado (percussive footwork) in ruffled bata de cola dresses expressing duende (artistic soul).', '/photos/culture_26.jpeg', 'Centro Andaluz de Flamenco', 'https://ich.unesco.org/en/RL/flamenco-00363', true, 'published', 'GENERAL', now() - interval '8 days')
  RETURNING id INTO v_p26;

  -- 27. Awa Odori
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Awa Odori (Tokushima Prefecture, Japan) — Japan''s most famous Bon dance festival, dating back over 400 years to 1587. Female dance troupes (ren) wear braided amigasa straw hats, vibrant yukata, and geta sandals elevated on the front toe, executing lively choreography to shamisen, taiko drums, and the infectious refrain: ''The dancers are fools, the watchers are fools!''', '/photos/culture_27.jpeg', 'Tokushima City Tourism Association', 'https://www.awaodori-kaikan.jp', true, 'published', 'GENERAL', now() - interval '7 days')
  RETURNING id INTO v_p27;

  -- 28. Jidai Matsuri
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Jidai Matsuri (Kyoto, Japan) — Grand historic pageant held each October at Heian Shrine. A two-kilometer procession of 2,000 participants dressed in museum-accurate period costumes recreates twelve centuries of Kyoto history, from the Meiji Restoration backward through the Edo, Muromachi, and Heian eras.', '/photos/culture_28.jpeg', 'Kyoto Traditional Culture Preservation Guild', 'https://www.heianjingu.or.jp', true, 'published', 'GENERAL', now() - interval '6 days')
  RETURNING id INTO v_p28;

  -- 29. Egyptian Tanoura
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Egyptian Tanoura Dance (Cairo, Egypt) — Vibrant Sufi-derived folkloric dance performed to the rhythm of mizmar pipes and daf drums. The dancer spins continuously while manipulating heavy, layered geometric skirts weighing over 15 kilograms, creating kaleidoscopic swirling discs symbolizing the rotation of planets around the cosmic center.', '/photos/culture_29.jpeg', 'El Tannoura Egyptian Heritage Troupe', 'https://en.wikipedia.org/wiki/Tanoura', true, 'published', 'GENERAL', now() - interval '5 days')
  RETURNING id INTO v_p29;

  -- 30. Kyoto Geisha Miyako Odori
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_perf, 'Miyako Odori & Japanese Classical Dance (Gion, Kyoto) — Revered spring dance performance first staged in 1872 during the Kyoto Exhibition. Geiko and maiko in trailing hand-painted silk kimono with gold brocade obi perform stylized dances celebrating the seasons beneath blossoming cherry boughs.', '/photos/culture_30.jpeg', 'Gion Kobu Kabukai Foundation', 'https://www.miyako-odori.jp', true, 'published', 'GENERAL', now() - interval '4 days')
  RETURNING id INTO v_p30;

  -- 31. Karatsu Kunchi
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Karatsu Kunchi Festival (Saga Prefecture, Japan) — Autumn harvest festival featuring fourteen colossal Hikiyama floats dating from 1819 to 1876. Shaped like giant red and golden lions, samurai helmets, and dragons, the floats are crafted using hundreds of layers of Japanese washi paper and gold leaf lacquer, pulled through the streets to rhythmic cries of ''Enya! Enya!''', '/photos/culture_31.jpeg', 'Karatsu Hikiyama Preservation Society', 'https://www.karatsu-kankou.jp', true, 'published', 'GENERAL', now() - interval '3 days')
  RETURNING id INTO v_p31;

  -- 32. Sheikh Zayed Grand Mosque
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_arch, 'Sheikh Zayed Grand Mosque (Abu Dhabi, UAE) — Landmark Islamic monument completed in 2007, blending Mamluk, Ottoman, and Fatimid architectural elements. Built with pure Macedonian Sivec white marble, it features 82 domes, 1,096 exterior columns inlaid with semi-precious amethyst and mother-of-pearl, and the world''s largest hand-knotted Persian carpet.', '/photos/culture_32.jpeg', 'Sheikh Zayed Grand Mosque Centre', 'https://www.szgmc.gov.ae', true, 'published', 'GENERAL', now() - interval '2 days')
  RETURNING id INTO v_p32;

  -- 33. American Square Dance
  INSERT INTO public.posts (author_id, community_id, body, media_url, media_credit, source_url, is_editorial, status, age_classification, created_at)
  VALUES (v_author_id, v_comm_fest, 'Traditional American Square Dance & Barn Dance — Folk dance tradition rooted in 17th-century English country dance, French quadrilles, and Appalachian fiddle music. Four couples in colorful circle skirts and western workshirts form a square, executing synchronized promenades, do-si-dos, and swings guided by the caller''s rhythmic rhymes.', '/photos/culture_33.jpeg', 'American Folk Dance & Music Archive', 'https://en.wikipedia.org/wiki/Square_dance', true, 'published', 'GENERAL', now() - interval '1 day')
  RETURNING id INTO v_p33;

  -- 5. Attach Tags to Posts
  INSERT INTO public.post_tags (post_id, tag_id, weight) VALUES
    (v_p01, v_tag_south_asian, 1.0),
    (v_p02, v_tag_south_asian, 1.0),
    (v_p03, v_tag_workwear, 1.0),
    (v_p04, v_tag_south_asian, 1.0),
    (v_p05, v_tag_middle_east, 1.0),
    (v_p06, v_tag_street_ph, 1.0),
    (v_p07, v_tag_streetwear, 1.0),
    (v_p08, v_tag_street_ph, 1.0),
    (v_p09, v_tag_south_asian, 1.0),
    (v_p10, v_tag_oral_hist, 1.0),
    (v_p11, v_tag_south_asian, 1.0),
    (v_p12, v_tag_south_asian, 1.0),
    (v_p13, v_tag_oral_hist, 1.0),
    (v_p14, v_tag_south_asian, 1.0),
    (v_p15, v_tag_japanese, 1.0),
    (v_p16, v_tag_analog_ph, 1.0),
    (v_p17, v_tag_japanese, 1.0),
    (v_p18, v_tag_south_asian, 1.0),
    (v_p19, v_tag_street_ph, 1.0),
    (v_p20, v_tag_oral_hist, 1.0),
    (v_p21, v_tag_south_asian, 1.0),
    (v_p22, v_tag_celtic, 1.0),
    (v_p23, v_tag_workwear, 1.0),
    (v_p24, v_tag_middle_east, 1.0),
    (v_p25, v_tag_middle_east, 1.0),
    (v_p26, v_tag_latino, 1.0),
    (v_p27, v_tag_japanese, 1.0),
    (v_p28, v_tag_japanese, 1.0),
    (v_p29, v_tag_middle_east, 1.0),
    (v_p30, v_tag_japanese, 1.0),
    (v_p31, v_tag_japanese, 1.0),
    (v_p32, v_tag_middle_east, 1.0),
    (v_p33, v_tag_workwear, 1.0)
  ON CONFLICT DO NOTHING;

  -- 6. Attach Initial Discourse Comments
  INSERT INTO public.post_comments (post_id, author_id, body, created_at) VALUES
    (v_p01, v_author_id, 'The symmetry of the Makrana white marble and parchin kari inlays is astonishing in early morning mist.', now() - interval '32 days'),
    (v_p02, v_author_id, 'Ashoka''s Torana gateways at Sanchi capture an unbroken continuity of Buddhist narrative iconography.', now() - interval '31 days'),
    (v_p04, v_author_id, 'In Bharatanatyam, every adavu footstep is calibrated to the cosmic meter of the mridangam.', now() - interval '29 days'),
    (v_p07, v_author_id, 'The South Bronx parks transformed turntable breakbeats into global athletic choreography.', now() - interval '26 days'),
    (v_p09, v_author_id, 'Tarangam plate-dancing in Kuchipudi demands total stillness of gaze while feet articulate complex rhythmic jati.', now() - interval '24 days'),
    (v_p15, v_author_id, 'The timber frame and plaster joinery of Himeji Castle has withstood centuries of tectonic tremor.', now() - interval '18 days'),
    (v_p17, v_author_id, 'The mist rising from Nachi Falls alongside the vermilion pagoda embodies Shinto-Buddhist sacred harmony.', now() - interval '16 days'),
    (v_p18, v_author_id, 'Sacred geometry in rangoli is an offering of beauty meant to fade, honoring impermanence.', now() - interval '15 days'),
    (v_p25, v_author_id, 'The Mevlevi Sema is a moving contemplation — turning without dizziness by fixing the inner eye on stillness.', now() - interval '8 days'),
    (v_p26, v_author_id, 'Duende in Flamenco cannot be manufactured; it is born from the singer''s rawest confrontation with mortality.', now() - interval '7 days');

  -- 7. Add likes to posts
  INSERT INTO public.post_reactions (post_id, user_id, kind)
  SELECT p.id, v_author_id, 'like'::public.reaction_kind
  FROM public.posts p WHERE p.author_id = v_author_id
  ON CONFLICT DO NOTHING;

  -- 8. Add shares to posts
  INSERT INTO public.post_shares (post_id, user_id, share_channel)
  SELECT p.id, v_author_id, 'link'
  FROM public.posts p WHERE p.author_id = v_author_id;

END $$;
