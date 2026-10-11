/**
 * Registry of cultural statistics and anthropological metadata by origin.
 * Used for interactive hover inspection cards across the Explore Page.
 */

export const ORIGIN_CULTURE_METRICS = {
  India: {
    flag: '🇮🇳',
    name: 'India & South Asia',
    total_nodes: '220,000',
    cultures_count: 28,
    cultures_label: 'Regional Cultures & Lineages',
    traditions: ['Carnatic & Hindustani Ragas', 'Double-Ikat Patan Patola', 'Chola Lost-Wax Bronze', 'Kathakali & Bharatanatyam', 'Vedic Sacred Architecture'],
    domains: ['Music', 'Handloom Textiles', 'Dance', 'Metallurgy', 'Spices'],
    artifacts_count: '4,820',
    timeline: '~3,300 BCE – Present',
    key_hubs: ['Varanasi', 'Thanjavur', 'Patan', 'Kerala', 'Bengal'],
    description: 'Ancient cradle of classical raga structures, living handloom archives, and spiritual lost-wax metallurgical casting traditions.',
  },
  'United States': {
    flag: '🇺🇸',
    name: 'United States',
    total_nodes: '190,000',
    cultures_count: 16,
    cultures_label: 'Heritage Traditions & Diasporas',
    traditions: ['Bronx Hip-Hop & Breakbeats', 'Mississippi Delta Blues', 'New Orleans Creole & Brass', 'Puebloan Black-on-Black Pottery', 'Appalachian Banjo Folk'],
    domains: ['Music', 'Subculture Fashion', 'Ceramics', 'Street Art'],
    artifacts_count: '3,940',
    timeline: '~1600s – Present',
    key_hubs: ['Bronx NYC', 'New Orleans', 'San Ildefonso', 'Detroit', 'Memphis'],
    description: 'Subcultural melting pot of 20th-century sonic revolutions, turntable audio collage, and ancestral Native American pottery.',
  },
  Germany: {
    flag: '🇩🇪',
    name: 'Germany & Central Europe',
    total_nodes: '150,000',
    cultures_count: 11,
    cultures_label: 'Artistic Movements & Guilds',
    traditions: ['Berlin Modular Synthesizer Systems', 'Weimar Bauhaus Design Geometry', 'Black Forest Woodcraft', 'Expressionist Printmaking', 'Industrial Techno Architecture'],
    domains: ['Modular Sound', 'Design', 'Woodcraft', 'Architecture'],
    artifacts_count: '3,120',
    timeline: '~800 CE – Present',
    key_hubs: ['Berlin', 'Dessau', 'Weimar', 'Hamburg', 'Black Forest'],
    description: 'Epicenter of functional design philosophy, electronic synthesizer patch synthesis, and concrete brutalist spaces.',
  },
  Japan: {
    flag: '🇯🇵',
    name: 'Japan',
    total_nodes: '120,000',
    cultures_count: 14,
    cultures_label: 'Master Guilds & Craft Traditions',
    traditions: ['Kyoto Urushi Kintsugi Repair', 'Tohoku Boro & Indigo Sashiko', 'Urahara Streetwear Subculture', 'Bizen Anagama Wood Firing', 'Noh & Gagaku Performance'],
    domains: ['Ceramics', 'Textiles', 'Streetwear', 'Tea Rituals'],
    artifacts_count: '3,650',
    timeline: 'Jōmon Period – Present',
    key_hubs: ['Kyoto', 'Harajuku', 'Tohoku', 'Bizen', 'Nara'],
    description: 'Living archive of wabi-sabi preservation philosophies, natural indigo vat fermentation, and small-batch streetwear experimentation.',
  },
  Australia: {
    flag: '🇦🇺',
    name: 'Australia & Oceania',
    total_nodes: '85,000',
    cultures_count: 8,
    cultures_label: 'First Nations Songlines & Collectives',
    traditions: ['First Nations Country Storytelling', 'Desert Ochre Dot Systems', 'Didgeridoo / Yidaki Acoustics', 'Bark Painting & Carving', 'Corroboree Ceremonies'],
    domains: ['Oral History', 'Visual Art', 'Acoustics', 'Body Art'],
    artifacts_count: '1,890',
    timeline: '65,000+ Years – Present',
    key_hubs: ['Alice Springs', 'Arnhem Land', 'Kimberley', 'Torres Strait'],
    description: 'The world\'s oldest continuous living culture, preserving sacred geographical songlines and mineral ochre pigments.',
  },
  Mexico: {
    flag: '🇲🇽',
    name: 'Mexico & Mesoamerica',
    total_nodes: '95,000',
    cultures_count: 12,
    cultures_label: 'Indigenous Crafts & Lineages',
    traditions: ['Oaxacan Zapotec Cochineal Weaving', 'San Bartolo Barro Negro Pottery', 'Tilcajete Copal Wood Alebrijes', 'Huichol Sacred Yarn Painting', 'Traditional Mezcal Distillation'],
    domains: ['Textiles', 'Ceramics', 'Folk Art', 'Culinary'],
    artifacts_count: '2,400',
    timeline: 'Pre-Columbian – Present',
    key_hubs: ['Oaxaca', 'Puebla', 'Michoacán', 'Chiapas'],
    description: 'Vibrant Mesoamerican master crafts sustained by indigenous collectives, botanical cochineal dyeing, and sacred nahual carvings.',
  },
  Morocco: {
    flag: '🇲🇦',
    name: 'Morocco & North Africa',
    total_nodes: '75,000',
    cultures_count: 9,
    cultures_label: 'Amazigh & Medina Guilds',
    traditions: ['Fez Hand-Chiseled Zellige Mosaics', 'Atlas Mountain Berber Rug Weaving', 'Hand-Hammered Brass Amphorae', 'Gnawa Spiritual Trance Music', 'Sebou River Cobalt Ceramics'],
    domains: ['Mosaics', 'Textiles', 'Metalwork', 'Music'],
    artifacts_count: '1,950',
    timeline: '~1,000 BCE – Present',
    key_hubs: ['Fez Medina', 'Marrakech', 'Essaouira', 'Chefchaouen'],
    description: 'Ancestral Islamic star geometry, foot-turned ceramic pottery, and Amazigh wool weaving passed down through Maâlem guilds.',
  },
  Nigeria: {
    flag: '🇳🇬',
    name: 'Nigeria & West Africa',
    total_nodes: '80,000',
    cultures_count: 10,
    cultures_label: 'Royal Guilds & Living Arts',
    traditions: ['Yoruba Lost-Wax Bronze Sculpting', 'Benin Royal Coral & Brass Regalia', 'Adire Indigo Resist Dyeing', 'Highlife & Afrobeat Polyrhythms', 'Nok Terracotta Heritage'],
    domains: ['Metallurgy', 'Textiles', 'Polyrhythms', 'Sculpture'],
    artifacts_count: '2,100',
    timeline: '~500 BCE – Present',
    key_hubs: ['Ife', 'Benin City', 'Lagos', 'Abeokuta'],
    description: 'Unmatched mastery of cire-perdue lost wax bronzeworking, ancestral court memorials, and polyrhythmic percussion structures.',
  },
  Peru: {
    flag: '🇵🇪',
    name: 'Peru & Andean Highlands',
    total_nodes: '68,000',
    cultures_count: 7,
    cultures_label: 'Quechua & Aymara Textile Guilds',
    traditions: ['Chinchero Backstrap Alpaca Weaving', 'Sacred Pallay Incan Iconography', 'Natural Yanali & Qolle Dyeing', 'Andean Siku Pan Flute Harmonics', 'Cusco Wood & Gold Leaf Carving'],
    domains: ['Backstrap Looms', 'Botanical Dyes', 'Music', 'Sculpture'],
    artifacts_count: '1,720',
    timeline: 'Incan Civilizations – Present',
    key_hubs: ['Sacred Valley', 'Cusco', 'Pisac', 'Lake Titicaca'],
    description: 'High-altitude Incan drop-spindle spinning, intricate backstrap geometric weaving, and astronomical textile cartography.',
  },
  Global: {
    flag: '🌐',
    name: 'Global Living Atlas',
    total_nodes: '1,000,000',
    cultures_count: 50,
    cultures_label: 'Foundational Seed Cultures',
    traditions: ['Sacred Textiles & Weaving', 'Acoustic Resonance & Soundtracks', 'Ceremonial Kilns & Pottery', 'Living Festivals & Rites', 'Indigenous Wisdom Systems'],
    domains: ['All 8 Cultural Vectors'],
    artifacts_count: '28,500',
    timeline: 'Deep Antiquity – Contemporary Era',
    key_hubs: ['Worldwide Archives & Collectives'],
    description: 'Interconnected global human cultural tapestry bridging Indigenous heritage, urban subcultures, and living traditions.',
  },
}

/**
 * Helper to retrieve statistics for a given origin name with graceful fuzzy matching
 */
export function getOriginMetrics(originName) {
  if (!originName) return ORIGIN_CULTURE_METRICS['Global']
  const clean = originName.trim()
  if (ORIGIN_CULTURE_METRICS[clean]) return ORIGIN_CULTURE_METRICS[clean]

  // Fuzzy match
  const lower = clean.toLowerCase()
  for (const [key, val] of Object.entries(ORIGIN_CULTURE_METRICS)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return val
    }
  }

  // Generative fallback for unanticipated countries
  return {
    flag: '📍',
    name: clean,
    total_nodes: '24,000',
    cultures_count: 6,
    cultures_label: 'Cataloged Cultural Traditions',
    traditions: ['Oral Heritage', 'Craft Practices', 'Culinary Customs', 'Folk Expression'],
    domains: ['Heritage', 'Art', 'Community'],
    artifacts_count: '750+',
    timeline: 'Historical Era – Present',
    key_hubs: [clean],
    description: `Anthropological and living heritage research catalog recorded for ${clean}.`,
  }
}
