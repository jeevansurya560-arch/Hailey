/**
 * frontend/src/features/festivals/data/festivalImageManifest.js
 *
 * Traceable, provenance-aware Cultural Image Manifest for Hailey Festivals.
 * Keyed by canonical festival ID, slug, and legacy prefix identifiers.
 *
 * PROVENANCE POLICY:
 * 1. AI-generated images are strictly labeled as 'ai_generated' with actual origin
 *    (Google DeepMind Imagen 3) and internal prototype usage terms.
 * 2. Unverified draft photographs are labeled as 'photograph' with 'verified: false'
 *    and unverified source provenance. No false claims of Wikimedia Commons or CC-BY-SA licenses.
 * 3. The 'verified' flag is STRICTLY false unless an asset has a verified, legally documented
 *    chain of rights with confirmed original URL and license clearance.
 */

export const FESTIVAL_IMAGE_MANIFEST = {
  // ── October 2026 Reference Triumvirate ──────────────────────────────────────
  'sukkot': {
    festivalId: 'sukkot',
    assetPath: '/festivals/sukkot.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Traditional Sukkah booth decorated with autumn harvest fruits and palm fronds. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Traditional outdoor Jewish Sukkah booth with palm fronds, hanging pomegranates, glowing oil lamps and a festively set harvest table under starlight.'
  },
  'f-sukkot': {
    festivalId: 'f-sukkot',
    assetPath: '/festivals/sukkot.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Traditional Sukkah booth decorated with autumn harvest fruits and palm fronds. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Traditional outdoor Jewish Sukkah booth with palm fronds, hanging pomegranates, glowing oil lamps and a festively set harvest table under starlight.'
  },

  'navratri': {
    festivalId: 'navratri',
    assetPath: '/festivals/navratri.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Reverent Goddess Durga idol adorned with marigold garlands and glowing oil lamps. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Reverent golden Goddess Durga idol adorned with fresh marigold garlands, surrounded by glowing terracotta oil lamps (diyas) and traditional Garba textiles.'
  },
  'f-navratri': {
    festivalId: 'f-navratri',
    assetPath: '/festivals/navratri.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Reverent Goddess Durga idol adorned with marigold garlands and glowing oil lamps. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Reverent golden Goddess Durga idol adorned with fresh marigold garlands, surrounded by glowing terracotta oil lamps (diyas) and traditional Garba textiles.'
  },

  'double-ninth-festival': {
    festivalId: 'double-ninth-festival',
    assetPath: '/festivals/double_ninth.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Golden chrysanthemums and Denggao mountain climbing tradition. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Blooming golden chrysanthemums and red dogwood berries overlooking misty mountain trails where hikers practice the Denggao autumn tradition.'
  },
  'f-double-ninth': {
    festivalId: 'f-double-ninth',
    assetPath: '/festivals/double_ninth.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Golden chrysanthemums and Denggao mountain climbing tradition. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Blooming golden chrysanthemums and red dogwood berries overlooking misty mountain trails where hikers practice the Denggao autumn tradition.'
  },
  'double_ninth': {
    festivalId: 'double_ninth',
    assetPath: '/festivals/double_ninth.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Golden chrysanthemums and Denggao mountain climbing tradition. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Blooming golden chrysanthemums and red dogwood berries overlooking misty mountain trails where hikers practice the Denggao autumn tradition.'
  },

  // ── Major Cultural Traditions (Synthesized Prototype Artwork) ──────────────
  'diwali': {
    festivalId: 'diwali',
    assetPath: '/festivals/diwali.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Traditional colored powder rangoli and glowing terracotta diyas. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Intricate floral rangoli made of colored powders illuminated by rows of glowing clay oil lamps (diyas) in a courtyard during Diwali.'
  },
  'f-diwali': {
    festivalId: 'f-diwali',
    assetPath: '/festivals/diwali.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Traditional colored powder rangoli and glowing terracotta diyas. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Intricate floral rangoli made of colored powders illuminated by rows of glowing clay oil lamps (diyas) in a courtyard during Diwali.'
  },

  'chinese-new-year-spring-festival': {
    festivalId: 'chinese-new-year-spring-festival',
    assetPath: '/festivals/spring_festival.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Courtyard with red lanterns, spring couplets, and festive plum blossoms. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Traditional courtyard entrance adorned with glowing red silk lanterns, red calligraphy spring couplets, and blooming plum blossoms for Lunar New Year.'
  },
  'f-spring-festival': {
    festivalId: 'f-spring-festival',
    assetPath: '/festivals/spring_festival.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Courtyard with red lanterns, spring couplets, and festive plum blossoms. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Traditional courtyard entrance adorned with glowing red silk lanterns, red calligraphy spring couplets, and blooming plum blossoms for Lunar New Year.'
  },
  'lunar_new_year': {
    festivalId: 'lunar_new_year',
    assetPath: '/festivals/spring_festival.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Courtyard with red lanterns, spring couplets, and festive plum blossoms. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Traditional courtyard entrance adorned with glowing red silk lanterns, red calligraphy spring couplets, and blooming plum blossoms for Lunar New Year.'
  },

  'eid-al-fitr': {
    festivalId: 'eid-al-fitr',
    assetPath: '/festivals/eid_al_fitr.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Crescent moon evening with traditional sweets and ornate brass lantern. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Golden crescent moon glowing in twilight sky above a mosque dome, with ornate Fanous lantern and traditional Eid sweets on an engraved brass tray.'
  },
  'f-eid-fitr': {
    festivalId: 'f-eid-fitr',
    assetPath: '/festivals/eid_al_fitr.jpg',
    sourcePageUrl: '',
    creator: 'Google DeepMind Imagen 3 (via Antigravity visual synthesis)',
    licenseName: 'Hailey Internal Reference Artwork / Editorial Prototype',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Synthesized editorial artwork generated via Google Imagen 3 for cultural representation. Crescent moon evening with traditional sweets and ornate brass lantern. Not a documentary photograph.',
    imageType: 'ai_generated',
    verified: false,
    altText: 'Golden crescent moon glowing in twilight sky above a mosque dome, with ornate Fanous lantern and traditional Eid sweets on an engraved brass tray.'
  },

  // ── Archival Draft Photographs (Pending Rights Clearance) ──────────────────
  // Note: These images originate from unverified project drafts. They are marked
  // verified: false and do not claim unverified CC-BY-SA or Wikimedia origins.
  'f-holi': {
    festivalId: 'f-holi',
    assetPath: '/photos/culture_01.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Holi powder celebrations. Rights holder and exact license pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Joyful celebration of Holi with vibrant natural colored powders (gulal) in air.'
  },
  'holi': {
    festivalId: 'holi',
    assetPath: '/photos/culture_01.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Holi powder celebrations. Rights holder and exact license pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Joyful celebration of Holi with vibrant natural colored powders (gulal) in air.'
  },

  'f-dia-muertos': {
    festivalId: 'f-dia-muertos',
    assetPath: '/photos/culture_07.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Día de los Muertos ofrenda altar. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Traditional Mexican Día de los Muertos ofrenda altar with cempasúchil marigolds, sugar skulls, and candlelight.'
  },
  'day_of_dead': {
    festivalId: 'day_of_dead',
    assetPath: '/photos/culture_07.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Día de los Muertos ofrenda altar. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Traditional Mexican Día de los Muertos ofrenda altar with cempasúchil marigolds, sugar skulls, and candlelight.'
  },

  'f-carnival': {
    festivalId: 'f-carnival',
    assetPath: '/photos/culture_09.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Carnival street procession. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Vibrant Carnival street parade with elaborate costumes, brass instruments, and community masquerade.'
  },

  'f-powwow-north-america': {
    festivalId: 'f-powwow-north-america',
    assetPath: '/photos/culture_12.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting intertribal powwow dancers. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Traditional Indigenous dancers at an intertribal powwow in handcrafted regalia with eagle feathers and beadwork.'
  },

  'f-songkran': {
    festivalId: 'f-songkran',
    assetPath: '/photos/culture_15.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Songkran water ceremony. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Sacred water blessing ritual during Songkran Thai New Year with scented water, jasmine petals, and silver bowls.'
  },

  'f-loy-krathong': {
    festivalId: 'f-loy-krathong',
    assetPath: '/photos/culture_18.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Loy Krathong floating offerings. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Handmade banana-leaf krathong decorated with fresh lotus blossoms and glowing candle floating on illuminated water.'
  },

  'f-onam': {
    festivalId: 'f-onam',
    assetPath: '/photos/culture_21.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Onam Pookkalam flower design. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Concentric geometric Pookkalam floral carpet created with fresh marigold and jasmine petals for Onam.'
  },

  'f-nowruz': {
    festivalId: 'f-nowruz',
    assetPath: '/photos/culture_24.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Nowruz Haft-Sin setting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Traditional Nowruz Haft-Sin table with sprouted wheat grass (Sabzeh), painted eggs, mirror, apples, and candles.'
  },
  'nowruz': {
    festivalId: 'nowruz',
    assetPath: '/photos/culture_24.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Nowruz Haft-Sin setting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Traditional Nowruz Haft-Sin table with sprouted wheat grass (Sabzeh), painted eggs, mirror, apples, and candles.'
  },

  'f-vesak': {
    festivalId: 'f-vesak',
    assetPath: '/photos/culture_27.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Vesak lantern celebration. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Serene Buddhist temple courtyard decorated with glowing paper lanterns and fresh lotus flowers on Vesak day.'
  },
  'vesak': {
    festivalId: 'vesak',
    assetPath: '/photos/culture_27.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Vesak lantern celebration. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Serene Buddhist temple courtyard decorated with glowing paper lanterns and fresh lotus flowers on Vesak day.'
  },

  'f-obon': {
    festivalId: 'f-obon',
    assetPath: '/photos/culture_30.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Obon lantern lighting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Strings of red and white paper Chochin lanterns glowing at night during an Obon summer festival.'
  },
  'obon': {
    festivalId: 'obon',
    assetPath: '/photos/culture_30.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Obon lantern lighting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Strings of red and white paper Chochin lanterns glowing at night during an Obon summer festival.'
  },

  'f-kwanzaa': {
    festivalId: 'f-kwanzaa',
    assetPath: '/photos/culture_33.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Kwanzaa Kinara table setting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Hand-carved wooden Kinara holding seven Mishumaa Saba candles flanked by ears of corn (Muhindi) and woven Mkeka mat.'
  },
  'kwanzaa': {
    festivalId: 'kwanzaa',
    assetPath: '/photos/culture_33.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Kwanzaa Kinara table setting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Hand-carved wooden Kinara holding seven Mishumaa Saba candles flanked by ears of corn (Muhindi) and woven Mkeka mat.'
  },

  'f-passover': {
    festivalId: 'f-passover',
    assetPath: '/photos/culture_05.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Passover Seder table setting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Ornate ceremonial Passover Seder plate set with symbolic elements, crisp matzah, and silver wine goblet.'
  },
  'passover': {
    festivalId: 'passover',
    assetPath: '/photos/culture_05.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Passover Seder table setting. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Ornate ceremonial Passover Seder plate set with symbolic elements, crisp matzah, and silver wine goblet.'
  },

  'f-hanukkah': {
    festivalId: 'f-hanukkah',
    assetPath: '/photos/culture_04.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Hanukkah Menorah with burning oil wicks. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Traditional bronze Hanukkah Menorah with flickering oil lights sitting beside wooden dreidels and sufganiyot jelly donuts.'
  },
  'hanukkah': {
    festivalId: 'hanukkah',
    assetPath: '/photos/culture_04.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Hanukkah Menorah with burning oil wicks. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Traditional bronze Hanukkah Menorah with flickering oil lights sitting beside wooden dreidels and sufganiyot jelly donuts.'
  },

  'f-easter': {
    festivalId: 'f-easter',
    assetPath: '/photos/culture_14.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Christian Paschal candle and lilies. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Liturgical church sanctuary adorned with tall Paschal candle and fresh white Easter lilies on Resurrection Sunday.'
  },
  'easter_western': {
    festivalId: 'easter_western',
    assetPath: '/photos/culture_14.jpeg',
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival research photograph documenting Christian Paschal candle and lilies. Rights holder pending confirmation.',
    imageType: 'photograph',
    verified: false,
    altText: 'Liturgical church sanctuary adorned with tall Paschal candle and fresh white Easter lilies on Resurrection Sunday.'
  }
}

/**
 * Resolves the image metadata for a given festival.
 * Falls back to cultural category defaults or a neutral placeholder if uncatalogued.
 */
export function getFestivalImage(festival) {
  if (!festival) return null

  // Check direct ID or slug match
  const match = 
    FESTIVAL_IMAGE_MANIFEST[festival.id] ||
    FESTIVAL_IMAGE_MANIFEST[festival.slug] ||
    FESTIVAL_IMAGE_MANIFEST[festival.festival_id]

  if (match) {
    return match
  }

  // Graceful category-informed cultural fallback
  const category = (festival.category || '').toLowerCase()
  const religion = (festival.religion || festival.traditionType || '').toLowerCase()

  let fallbackPhoto = '/photos/culture_02.jpeg'
  let altText = `${festival.name || 'Festival'} cultural observance`

  if (religion.includes('hindu') || religion.includes('vedic')) {
    fallbackPhoto = '/festivals/navratri.jpg'
    altText = `${festival.name} - Traditional Hindu celebration and illuminated ritual setting`
  } else if (religion.includes('juda')) {
    fallbackPhoto = '/festivals/sukkot.jpg'
    altText = `${festival.name} - Traditional Jewish holy day and ceremonial celebration`
  } else if (religion.includes('chinese') || religion.includes('tao') || religion.includes('confucian')) {
    fallbackPhoto = '/festivals/spring_festival.jpg'
    altText = `${festival.name} - Traditional East Asian cultural festival and lanterns`
  } else if (religion.includes('islam') || religion.includes('muslim')) {
    fallbackPhoto = '/festivals/eid_al_fitr.jpg'
    altText = `${festival.name} - Traditional Islamic sacred observance and community feast`
  } else if (category.includes('harvest') || category.includes('seasonal')) {
    fallbackPhoto = '/festivals/double_ninth.jpg'
    altText = `${festival.name} - Seasonal harvest and astronomical equinox observance`
  }

  return {
    festivalId: festival.id || festival.slug,
    assetPath: fallbackPhoto,
    sourcePageUrl: '',
    creator: 'Hailey Visual Research Collection (Unverified Source)',
    licenseName: 'Research Reference Only — Rights Pending Clearance',
    licenseUrl: 'https://hailey.app/legal/terms',
    attribution: 'Archival fallback reference imagery from research drafts.',
    imageType: 'illustration',
    verified: false,
    altText
  }
}
