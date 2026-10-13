/**
 * demonstrationDispatches.js
 * 
 * Hailey Hybrid Community Feed — Demonstration Content Dataset & Adapter
 * 
 * Provides clearly identified, culturally grounded demonstration profiles
 * and dispatches to make the Explore discovery experience rich and diverse
 * during early platform growth.
 * 
 * Authentic authenticated users coexist in the exact same feed under their own
 * real identities, persisting directly in Supabase.
 */

export function isDemoContentEnabled() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENABLE_DEMO_POSTS === 'false') {
    return false
  }
  return true
}

export const DEMONSTRATION_AUTHORS = {
  jeevan_surya: {
    id: 'demo-author-jeevan',
    handle: 'jeevan_surya',
    display_name: 'Jeevan Surya Jalli',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Jeevan&backgroundColor=6A1F35&textColor=ffffff',
    bio: 'Lead Cultural Archivist & Sacred Architecture Specialist. Chronicling sacred living heritage sites across India and the global diaspora.',
    location: 'Agra & Varanasi, India',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'archivist'],
  },
  ananya_rao: {
    id: 'demo-author-ananya',
    handle: 'ananya_rao',
    display_name: 'Ananya Rao',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Ananya&backgroundColor=8B263E&textColor=ffffff',
    bio: 'Classical Performing Arts & Natya Shastra Researcher. Documenting temple dance lineages, mudras, and oral traditions.',
    location: 'Chennai, India',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'scholar'],
  },
  kenji_tanaka: {
    id: 'demo-author-kenji',
    handle: 'kenji_tanaka',
    display_name: 'Kenji Tanaka',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Kenji&backgroundColor=1E3A8A&textColor=ffffff',
    bio: 'Traditional Japanese Timber Joinery, Feudal Castles, and Kyoto Matsuri Historian.',
    location: 'Kyoto, Japan',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'historian'],
  },
  karim_hassan: {
    id: 'demo-author-karim',
    handle: 'karim_hassan',
    display_name: 'Dr. Karim Hassan',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Karim&backgroundColor=065F46&textColor=ffffff',
    bio: 'Islamic Art Historian & Umayyad Architecture Specialist. Chronicling Persian ceramic geometry, Sufi mysticism, and calligraphy.',
    location: 'Cairo, Egypt',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'scholar'],
  },
  priya_mehta: {
    id: 'demo-author-priya',
    handle: 'priya_mehta',
    display_name: 'Priya Mehta',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya&backgroundColor=9D4EDD&textColor=ffffff',
    bio: 'Ethnographic Ritual Documentarian. Specializing in Himalayan Monastic Cham, Hemis pageantry, and ephemeral rangoli art.',
    location: 'Ladakh & Spiti, India',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'photographer'],
  },
  elena_rostova: {
    id: 'demo-author-elena',
    handle: 'elena_rostova',
    display_name: 'Elena Rostova',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Elena&backgroundColor=92400E&textColor=ffffff',
    bio: 'European Ethnography & Ancestral Living Traditions Researcher. Chronicling Central & Eastern European folklore and memorials.',
    location: 'Krakow, Poland',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'ethnographer'],
  },
  mateo_silva: {
    id: 'demo-author-mateo',
    handle: 'mateo_silva',
    display_name: 'Mateo Silva',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Mateo&backgroundColor=B45309&textColor=ffffff',
    bio: 'Andalusian Flamenco Ethnomusicologist. Documenting deep cante jondo roots, Gitano heritage, and southern Spanish folklore.',
    location: 'Seville, Spain',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'ethnomusicologist'],
  },
  marcus_vance: {
    id: 'demo-author-marcus',
    handle: 'marcus_vance',
    display_name: 'Marcus Vance',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Marcus&backgroundColor=1F2937&textColor=ffffff',
    bio: 'Urban Expression, South Bronx Hip-Hop Culture, and American Folk Pageantry Archivist.',
    location: 'New York, United States',
    is_demo: true,
    is_editorial: true,
    is_verified: true,
    roles: ['curator', 'historian'],
  },
}

export const DEMO_AUTHORS_LIST = Object.values(DEMONSTRATION_AUTHORS)

// Map seed dispatch ID suffixes (1-33) to specific demonstration authors
export const DISPATCH_AUTHOR_MAPPING = {
  1: 'jeevan_surya', // Taj Mahal
  2: 'jeevan_surya', // Sanchi Stupa
  3: 'marcus_vance', // White House
  4: 'ananya_rao',   // Bharatanatyam
  5: 'karim_hassan', // Dome of the Rock
  6: 'marcus_vance', // Statue of Liberty
  7: 'marcus_vance', // Bronx Street Dance
  8: 'marcus_vance', // Macy's Parade
  9: 'ananya_rao',   // Kuchipudi
  10: 'priya_mehta', // Cham Monastic Dance
  11: 'priya_mehta', // Hemis Festival
  12: 'ananya_rao',  // Bharatanatyam Varnam
  13: 'priya_mehta', // Kathina Robe Ceremony
  14: 'priya_mehta', // Hemis Pilgrimage
  15: 'kenji_tanaka',// Himeji Castle
  16: 'elena_rostova',// Colosseum
  17: 'kenji_tanaka',// Seiganto-ji Pagoda & Nachi Falls
  18: 'priya_mehta', // Diwali Rangoli
  19: 'elena_rostova',// Eiffel Tower
  20: 'elena_rostova',// Zaduszki Vigil
  21: 'priya_mehta', // Key Monastery
  22: 'elena_rostova',// Irish Step Dance
  23: 'elena_rostova',// Oktoberfest
  24: 'karim_hassan',// Persian Silk Carpet
  25: 'karim_hassan',// Sufi Whirling Dervishes
  26: 'mateo_silva', // Andalusian Flamenco
  27: 'kenji_tanaka',// Awa Odori
  28: 'kenji_tanaka',// Jidai Matsuri
  29: 'karim_hassan',// Egyptian Tanoura
  30: 'kenji_tanaka',// Kyoto Miyako Odori
  31: 'kenji_tanaka',// Karatsu Kunchi
  32: 'karim_hassan',// Sheikh Zayed Mosque
  33: 'marcus_vance',// American Square Dance
}

/**
 * 33 Curated Cultural Dispatches with distinct demonstration authors
 */
export const DEMONSTRATION_DISPATCHES = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    author: DEMONSTRATION_AUTHORS.jeevan_surya,
    author_id: DEMONSTRATION_AUTHORS.jeevan_surya.id,
    body: 'Taj Mahal (Agra, Uttar Pradesh) — Commissioned in 1631 by Mughal Emperor Shah Jahan. Built with translucent Makrana white marble, featuring pietra dura (parchin kari) floral stone inlays with lapis lazuli, carnelian, and jade. The central dome rises 73 meters, framed by four minarets tilted slightly outward to protect the tomb in case of earthquakes. A testament to Persian, Islamic, and Indian architectural synthesis.',
    media_url: '/photos/culture_01.jpeg',
    media_credit: 'Archaeological Survey of India / Hailey Field Archive',
    source_url: 'https://whc.unesco.org/en/list/252',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 420, commentsCount: 38, sharesCount: 24, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000002-0000-0000-0000-000000000002',
    author: DEMONSTRATION_AUTHORS.jeevan_surya,
    author_id: DEMONSTRATION_AUTHORS.jeevan_surya.id,
    body: 'The Great Stupa at Sanchi (Madhya Pradesh) — Commissioned by Emperor Ashoka in the 3rd Century BCE. Its hemispherical sandstone dome represents the cosmic vault and the parinirvana of the Buddha. The four elaborately carved Toranas (ornamental gateways) depict Jataka tales, sacred yakshinis, and Buddhist aniconic emblems, standing as one of the oldest preserved stone structures in South Asia.',
    media_url: '/photos/culture_02.jpeg',
    video_url: '/videos/Buddhavanam_Clip_1_Stupa_and_Monastery.mp4',
    is_video: true,
    media_credit: 'UNESCO Living Heritage Archive',
    source_url: 'https://whc.unesco.org/en/list/524',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 312, commentsCount: 22, sharesCount: 15, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000003-0000-0000-0000-000000000003',
    author: DEMONSTRATION_AUTHORS.marcus_vance,
    author_id: DEMONSTRATION_AUTHORS.marcus_vance.id,
    body: 'The White House (Washington, D.C.) — Designed by Irish-born architect James Hoban in the Neoclassical Federal style, constructed between 1792 and 1800 using Aquia Creek sandstone. The iconic South Portico with its Ionic colonnade frames the Ellipse and the Washington Monument obelisk, embodying the civic architectural ideals of the American Republic.',
    media_url: '/photos/culture_03.jpeg',
    media_credit: 'National Park Service / Architectural Heritage',
    source_url: 'https://www.nps.gov/whho/index.htm',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 6, name: 'Workwear', slug: 'workwear', kind: 'aesthetic' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 185, commentsCount: 14, sharesCount: 9, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000004-0000-0000-0000-000000000004',
    author: DEMONSTRATION_AUTHORS.ananya_rao,
    author_id: DEMONSTRATION_AUTHORS.ananya_rao.id,
    body: 'Bharatanatyam (Tamil Nadu, India) — Ancient classical dance form codified in the Natya Shastra by sage Bharata Muni. Dancers in pleated Kanchipuram silk saris with zari borders and brass salangai (ankle bells) perform intricate nritta (pure rhythmic footwork) and abhinaya (expressive facial gestures). Each mudra conveys spiritual and philosophical narratives of devotion and nature.',
    media_url: '/photos/culture_04.jpeg',
    media_credit: 'Sangeet Natak Akademi Archives',
    source_url: 'https://sangeetnatak.gov.in',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 462, commentsCount: 41, sharesCount: 30, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000005-0000-0000-0000-000000000005',
    author: DEMONSTRATION_AUTHORS.karim_hassan,
    author_id: DEMONSTRATION_AUTHORS.karim_hassan.id,
    body: 'Dome of the Rock (Jerusalem) — Umayyad architectural masterpiece completed in 691 CE under Caliph Abd al-Malik. The octagonal arcade is adorned with intricate glazed Persian ceramic tiles, Quranic calligraphy friezes, and an exquisite gilded wooden dome crowning the Foundation Stone. One of the earliest and most revered monuments of Islamic civilization.',
    media_url: '/photos/culture_05.jpeg',
    video_url: '/videos/Islamic_Culture_Clip_1_Mosque_Architecture.mp4',
    is_video: true,
    media_credit: 'Islamic Endowment & Heritage Survey',
    source_url: 'https://whc.unesco.org/en/list/148',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 3, name: 'Middle Eastern', slug: 'middle-eastern', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 388, commentsCount: 29, sharesCount: 21, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000006-0000-0000-0000-000000000006',
    author: DEMONSTRATION_AUTHORS.marcus_vance,
    author_id: DEMONSTRATION_AUTHORS.marcus_vance.id,
    body: 'Statue of Liberty (New York Harbor) — Designed by French sculptor Frédéric-Auguste Bartholdi with internal iron pylon framework by Gustave Eiffel. Dedicated in 1886 as a gift of friendship from France to the United States. Its repoussé copper skin, naturally patinated to verdigris green, stands on a star-shaped granite pedestal on Liberty Island, welcoming generations of immigrants.',
    media_url: '/photos/culture_06.jpeg',
    media_credit: 'National Park Service Archives',
    source_url: 'https://www.nps.gov/stli/index.htm',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 7, name: 'Street Photography', slug: 'street-photography', kind: 'medium' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 295, commentsCount: 19, sharesCount: 16, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000007-0000-0000-0000-000000000007',
    author: DEMONSTRATION_AUTHORS.marcus_vance,
    author_id: DEMONSTRATION_AUTHORS.marcus_vance.id,
    body: 'Bronx Hip-Hop & B-Boying Culture (New York) — Originating in the South Bronx during the early 1970s block parties pioneered by DJ Kool Herc. Dancers execute toprock, downrock, power moves, and freezes on concrete and linoleum. B-boying grew from an inner-city street expression into a globally recognized Olympic discipline and cultural pillar.',
    media_url: '/photos/culture_07.jpeg',
    media_credit: 'Urban Arts Cultural Archive',
    source_url: 'https://www.bronxmuseum.org',
    community: { slug: 'urban-expression', name: 'Urban Expression' },
    tags: [{ id: 4, name: 'Streetwear', slug: 'streetwear', kind: 'aesthetic' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 520, commentsCount: 45, sharesCount: 38, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000008-0000-0000-0000-000000000008',
    author: DEMONSTRATION_AUTHORS.marcus_vance,
    author_id: DEMONSTRATION_AUTHORS.marcus_vance.id,
    body: "Macy's Thanksgiving Day Parade (Manhattan, New York) — American folkloric street procession held annually since 1924. Featuring giant helium character balloons first crafted with puppeteer Tony Sarg, marching bands from every state, and theatrical floats passing through Herald Square. A living tradition celebrating mid-century American holiday spectacle.",
    media_url: '/photos/culture_08.jpeg',
    media_credit: 'New York Historical Pageant Archive',
    source_url: 'https://www.macys.com/p/parade/',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 7, name: 'Street Photography', slug: 'street-photography', kind: 'medium' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 275, commentsCount: 18, sharesCount: 12, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000009-0000-0000-0000-000000000009',
    author: DEMONSTRATION_AUTHORS.ananya_rao,
    author_id: DEMONSTRATION_AUTHORS.ananya_rao.id,
    body: 'Kuchipudi (Andhra Pradesh, India) — Classical dance-drama originating from the village of Kuchipudi in Krishna district. Dancers balance on brass plates (Tarangam) while maintaining rhythmic precision and expressive sanchari bhava. Characterized by vivacious fast-paced footwork, sculpted postures, and intricate abhinaya honoring sacred epics.',
    media_url: '/photos/culture_09.jpeg',
    media_credit: 'Andhra Pradesh Department of Culture',
    source_url: 'https://culture.ap.gov.in',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 340, commentsCount: 26, sharesCount: 17, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000010-0000-0000-0000-00000000010',
    author: DEMONSTRATION_AUTHORS.priya_mehta,
    author_id: DEMONSTRATION_AUTHORS.priya_mehta.id,
    body: 'Monastic Cham Dance (Tibet / Bhutan) — Sacred ritual dance performed by Buddhist monks wearing ceremonial silk brocade robes and symbolic hats during religious festivals (Tshechus). The slow, rhythmic circular movements, accompanied by long dungchen horns and cymbals, symbolize spiritual purification and the triumph of wisdom over ignorance.',
    media_url: '/photos/culture_10.jpeg',
    video_url: '/videos/Buddhavanam_Clip_2_Monks_and_Heritage.mp4',
    is_video: true,
    media_credit: 'Himalayan Living Heritage Trust',
    source_url: 'https://whc.unesco.org',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 10, name: 'Oral History', slug: 'oral-history', kind: 'medium' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 410, commentsCount: 33, sharesCount: 25, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000011-0000-0000-0000-00000000011',
    author: DEMONSTRATION_AUTHORS.priya_mehta,
    author_id: DEMONSTRATION_AUTHORS.priya_mehta.id,
    body: 'Hemis Festival Cham (Ladakh, India) — Sacred masked pageant held at Hemis Gompa honoring Guru Padmasambhava. Monks don fearsome, hand-carved wooden masks depicting Mahakala and wrathful deities. The synchronized ritual movements represent the subjugation of negative energies, attracting pilgrims across the high-altitude Trans-Himalayan valleys.',
    media_url: '/photos/culture_11.jpeg',
    media_credit: 'Ladakh Monastic Archive',
    source_url: 'https://leh.nic.in',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 495, commentsCount: 42, sharesCount: 31, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000012-0000-0000-0000-00000000012',
    author: DEMONSTRATION_AUTHORS.ananya_rao,
    author_id: DEMONSTRATION_AUTHORS.ananya_rao.id,
    body: 'Bharatanatyam Varnam (South India) — The central and most demanding suite of the Margam repertoire. Dancers perform complex rhythmic teermanams alongside soulful abhinaya, embodying aesthetic rasa (spiritual emotion). The interplay between rhythm, melody, and devotional poetry captures centuries of living temple lineage.',
    media_url: '/photos/culture_12.jpeg',
    media_credit: 'Kalakshetra Heritage Collection',
    source_url: 'https://www.kalakshetra.in',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 375, commentsCount: 28, sharesCount: 20, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000013-0000-0000-0000-00000000013',
    author: DEMONSTRATION_AUTHORS.priya_mehta,
    author_id: DEMONSTRATION_AUTHORS.priya_mehta.id,
    body: 'Kathina Robe Offering (Southeast Asia) — Theravada Buddhist festival held at the close of the three-month Vassa rainy-season retreat. Lay devotees offer new handwoven saffron and ochre robes, lotus flowers, and alms to the sangha (monastic community). A centuries-old communal ceremony fostering solidarity and merit-making.',
    media_url: '/photos/culture_13.jpeg',
    media_credit: 'Theravada Monastic Heritage Association',
    source_url: 'https://en.wikipedia.org/wiki/Kathina',
    community: { slug: 'living-heritage', name: 'Living Heritage' },
    tags: [{ id: 10, name: 'Oral History', slug: 'oral-history', kind: 'medium' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 260, commentsCount: 16, sharesCount: 11, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000014-0000-0000-0000-00000000014',
    author: DEMONSTRATION_AUTHORS.priya_mehta,
    author_id: DEMONSTRATION_AUTHORS.priya_mehta.id,
    body: 'Hemis Monastic Gathering (Spiti & Ladakh) — High-altitude congregation of Buddhist monks, lamas, and mountain communities. Adorned in crimson woolen robes and surrounded by five-colored prayer flags (lungta), the congregation gathers for monastic discourses, cham blessings, and collective prayers for universal compassion.',
    media_url: '/photos/culture_14.jpeg',
    video_url: '/videos/India_Heritage_Clip_1_Monuments.mp4',
    is_video: true,
    media_credit: 'Trans-Himalayan Cultural Society',
    source_url: 'https://leh.nic.in',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 390, commentsCount: 31, sharesCount: 22, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000015-0000-0000-0000-00000000015',
    author: DEMONSTRATION_AUTHORS.kenji_tanaka,
    author_id: DEMONSTRATION_AUTHORS.kenji_tanaka.id,
    body: 'Himeji Castle (Hyogo Prefecture, Japan) — Regarded as the finest surviving example of early 17th-century Japanese feudal castle architecture. Featuring pristine white-plastered timber walls, tiered gables (chidori hafu), and an ingenious defensive spiral layout designed by Toyotomi Hideyoshi and Ikeda Terumasa. Recognized as Japan\'s first UNESCO World Cultural Heritage site.',
    media_url: '/photos/culture_15.jpeg',
    media_credit: 'Himeji Cultural Heritage Preservation Division',
    source_url: 'https://whc.unesco.org/en/list/661',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 2, name: 'Japanese', slug: 'japanese', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 512, commentsCount: 44, sharesCount: 36, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000016-0000-0000-0000-00000000016',
    author: DEMONSTRATION_AUTHORS.elena_rostova,
    author_id: DEMONSTRATION_AUTHORS.elena_rostova.id,
    body: 'The Colosseum (Rome, Italy) — Built under emperors Vespasian and Titus between 72 and 80 CE. Constructed of travertine limestone, tuff, and brick-faced concrete, it could seat over 50,000 spectators across three tiers of Doric, Ionic, and Corinthian arches. An enduring symbol of ancient Roman civil engineering and urban spectacle.',
    media_url: '/photos/culture_16.jpeg',
    media_credit: 'Parco Archeologico del Colosseo',
    source_url: 'https://whc.unesco.org/en/list/91',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 8, name: 'Analog Film Photography', slug: 'analog-film-photo', kind: 'medium' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 440, commentsCount: 35, sharesCount: 28, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000017-0000-0000-0000-00000000017',
    author: DEMONSTRATION_AUTHORS.kenji_tanaka,
    author_id: DEMONSTRATION_AUTHORS.kenji_tanaka.id,
    body: 'Seiganto-ji Pagoda & Nachi Falls (Wakayama, Japan) — Spiritual heart of the Kumano Kodo pilgrimage routes. The three-tiered vermilion pagoda stands against the dramatic 133-meter Nachi Falls, a sacred shintai (dwelling of kami) revered in both Shinto and Tendai Buddhist syncretism for over a millennium.',
    media_url: '/photos/culture_17.jpeg',
    media_credit: 'Kumano Sacred Sites Heritage Board',
    source_url: 'https://whc.unesco.org/en/list/1142',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 2, name: 'Japanese', slug: 'japanese', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 578, commentsCount: 52, sharesCount: 41, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000018-0000-0000-0000-00000000018',
    author: DEMONSTRATION_AUTHORS.priya_mehta,
    author_id: DEMONSTRATION_AUTHORS.priya_mehta.id,
    body: 'Diwali Rangoli & Deepotsav (India) — Sacred floor art created during the Festival of Lights using colored quartz powder, flower petals, and rice flour. Intricate geometric mandalas and peacock patterns are illuminated with handmade clay oil lamps (diyas), symbolizing the triumph of light over darkness and welcoming prosperity and auspicious energy.',
    media_url: '/photos/culture_18.jpeg',
    media_credit: 'Folk Art and Ritual Heritage Survey',
    source_url: 'https://indiaculture.gov.in',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 460, commentsCount: 39, sharesCount: 29, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000019-0000-0000-0000-00000000019',
    author: DEMONSTRATION_AUTHORS.elena_rostova,
    author_id: DEMONSTRATION_AUTHORS.elena_rostova.id,
    body: "The Eiffel Tower (Paris, France) — Erected on the Champ de Mars for the 1889 Exposition Universelle to celebrate the centennial of the French Revolution. Built with 18,038 puddling iron parts and 2.5 million rivets by Gustave Eiffel's engineering atelier, rising 330 meters as an enduring icon of French industrial modernism.",
    media_url: '/photos/culture_19.jpeg',
    media_credit: "Société d'Exploitation de la Tour Eiffel",
    source_url: 'https://www.toureiffel.paris',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 7, name: 'Street Photography', slug: 'street-photography', kind: 'medium' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 380, commentsCount: 27, sharesCount: 19, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000020-0000-0000-0000-00000000020',
    author: DEMONSTRATION_AUTHORS.elena_rostova,
    author_id: DEMONSTRATION_AUTHORS.elena_rostova.id,
    body: "Zaduszki & All Saints' Night (Central & Eastern Europe) — Ancient memorial observance on November 1st and 2nd. Families gather in ancestral cemeteries to light thousands of znicze (votive glass candles) and lay fresh chrysanthemums on gravestones, transforming the twilight burial grounds into luminous seas of ancestral remembrance.",
    media_url: '/photos/culture_20.jpeg',
    media_credit: 'European Ethnographic Living Archive',
    source_url: 'https://en.wikipedia.org/wiki/Zaduszki',
    community: { slug: 'living-heritage', name: 'Living Heritage' },
    tags: [{ id: 10, name: 'Oral History', slug: 'oral-history', kind: 'medium' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 310, commentsCount: 24, sharesCount: 18, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000021-0000-0000-0000-00000000021',
    author: DEMONSTRATION_AUTHORS.priya_mehta,
    author_id: DEMONSTRATION_AUTHORS.priya_mehta.id,
    body: 'Key Monastery (Spiti Valley, India) — Tibetan Buddhist monastery of the Gelugpa sect perched at 4,166 meters above sea level overlooking the Spiti River. Established in the 11th century, its fortress-like stacked architecture houses priceless thangkas, ancient manuscripts, and sacred prayer halls that have endured high-altitude Himalayan isolation.',
    media_url: '/photos/culture_21.jpeg',
    video_url: '/videos/India_Heritage_Clip_4_Nature_and_Living_Heritage.mp4',
    is_video: true,
    media_credit: 'Spiti Heritage Preservation Council',
    source_url: 'https://himachaltourism.gov.in',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 1, name: 'South Asian', slug: 'south-asian', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 425, commentsCount: 34, sharesCount: 26, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000022-0000-0000-0000-00000000022',
    author: DEMONSTRATION_AUTHORS.elena_rostova,
    author_id: DEMONSTRATION_AUTHORS.elena_rostova.id,
    body: 'Irish Step Dancing (Ireland & Global Diaspora) — Traditional step dance characterized by a rigid upper torso and lightning-fast precision footwork. Dancers at regional Feis competitions wear elaborately hand-embroidered solo dresses featuring Celtic knotwork, Tara brooches, and stiffened hornpipe shoes, celebrating Gaelic cultural resurgence.',
    media_url: '/photos/culture_22.jpeg',
    media_credit: 'An Coimisiún le Rincí Gaelacha',
    source_url: 'https://www.clrg.ie',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 5, name: 'Celtic', slug: 'celtic', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 290, commentsCount: 21, sharesCount: 15, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000023-0000-0000-0000-00000000023',
    author: DEMONSTRATION_AUTHORS.elena_rostova,
    author_id: DEMONSTRATION_AUTHORS.elena_rostova.id,
    body: 'Oktoberfest & Bavarian Volkstradition (Munich, Germany) — World\'s largest folk festival, held since 1810 on the Theresienwiese. Revelers in authentic Bavarian Tracht — hand-stitched leather Lederhosen and alpine Dirndl — gather beneath giant hops-wreath chandeliers in historic brewery tents to brass Blasmusik and centuries-old culinary heritage.',
    media_url: '/photos/culture_23.jpeg',
    media_credit: 'Munich City Heritage Collection',
    source_url: 'https://www.oktoberfest.de',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 6, name: 'Workwear', slug: 'workwear', kind: 'aesthetic' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 360, commentsCount: 25, sharesCount: 18, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000024-0000-0000-0000-00000000024',
    author: DEMONSTRATION_AUTHORS.karim_hassan,
    author_id: DEMONSTRATION_AUTHORS.karim_hassan.id,
    body: 'Persian & Islamic Silk Tapestries — Historic textile masterpieces featuring hand-knotted silk on silk foundations with knot densities exceeding 800 knots per square inch. Master weavers from Tabriz, Isfahan, and Kashan incorporate sacred medallion patterns, cypress trees of life, and arabesque foliage dyed with madder root, indigo, and saffron.',
    media_url: '/photos/culture_24.jpeg',
    media_credit: 'National Museum of Islamic Art',
    source_url: 'https://www.metmuseum.org',
    community: { slug: 'living-heritage', name: 'Living Heritage' },
    tags: [{ id: 3, name: 'Middle Eastern', slug: 'middle-eastern', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 440, commentsCount: 36, sharesCount: 27, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000025-0000-0000-0000-00000000025',
    author: DEMONSTRATION_AUTHORS.karim_hassan,
    author_id: DEMONSTRATION_AUTHORS.karim_hassan.id,
    body: "Mevlevi Sema Ceremony (Konya, Turkey) — 13th-century Sufi spiritual ceremony inspired by mystic poet Jalaluddin Rumi. Dervishes wearing tall felt camel-hair hats (sikke) representing ego's tombstone and white flared skirts (tennure) spin with their right palms turned toward heaven to receive divine grace and left palms toward earth to distribute love.",
    media_url: '/photos/culture_25.jpeg',
    media_credit: 'UNESCO Intangible Cultural Heritage Registry',
    source_url: 'https://ich.unesco.org/en/RL/mevlevi-sema-ceremony-00065',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 3, name: 'Middle Eastern', slug: 'middle-eastern', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 510, commentsCount: 46, sharesCount: 37, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000026-0000-0000-0000-00000000026',
    author: DEMONSTRATION_AUTHORS.mateo_silva,
    author_id: DEMONSTRATION_AUTHORS.mateo_silva.id,
    body: 'Andalusian Flamenco (Seville & Granada, Spain) — Deep expressive art form blending Romani, Moorish, Jewish, and traditional Andalusian roots. Featuring cante jondo (deep singing), passionate toque on Spanish cypress guitar, and explosive zapateado (percussive footwork) in ruffled bata de cola dresses expressing duende (artistic soul).',
    media_url: '/photos/culture_26.jpeg',
    video_url: '/videos/India_Heritage_Clip_3_Traditions_Scenery.mp4',
    is_video: true,
    media_credit: 'Centro Andaluz de Flamenco',
    source_url: 'https://ich.unesco.org/en/RL/flamenco-00363',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 9, name: 'Latino', slug: 'latino', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 475, commentsCount: 43, sharesCount: 32, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000027-0000-0000-0000-00000000027',
    author: DEMONSTRATION_AUTHORS.kenji_tanaka,
    author_id: DEMONSTRATION_AUTHORS.kenji_tanaka.id,
    body: "Awa Odori (Tokushima Prefecture, Japan) — Japan's most famous Bon dance festival, dating back over 400 years to 1587. Female dance troupes (ren) wear braided amigasa straw hats, vibrant yukata, and geta sandals elevated on the front toe, executing lively choreography to shamisen, taiko drums, and the infectious refrain: 'The dancers are fools, the watchers are fools!'",
    media_url: '/photos/culture_27.jpeg',
    media_credit: 'Tokushima City Tourism Association',
    source_url: 'https://www.awaodori-kaikan.jp',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 2, name: 'Japanese', slug: 'japanese', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 395, commentsCount: 32, sharesCount: 23, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000028-0000-0000-0000-00000000028',
    author: DEMONSTRATION_AUTHORS.kenji_tanaka,
    author_id: DEMONSTRATION_AUTHORS.kenji_tanaka.id,
    body: 'Jidai Matsuri (Kyoto, Japan) — Grand historic pageant held each October at Heian Shrine. A two-kilometer procession of 2,000 participants dressed in museum-accurate period costumes recreates twelve centuries of Kyoto history, from the Meiji Restoration backward through the Edo, Muromachi, and Heian eras.',
    media_url: '/photos/culture_28.jpeg',
    video_url: '/videos/India_Heritage_Clip_2_Culture_Festivals.mp4',
    is_video: true,
    media_credit: 'Kyoto Traditional Culture Preservation Guild',
    source_url: 'https://www.heianjingu.or.jp',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 2, name: 'Japanese', slug: 'japanese', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 430, commentsCount: 37, sharesCount: 26, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000029-0000-0000-0000-00000000029',
    author: DEMONSTRATION_AUTHORS.karim_hassan,
    author_id: DEMONSTRATION_AUTHORS.karim_hassan.id,
    body: 'Egyptian Tanoura Dance (Cairo, Egypt) — Vibrant Sufi-derived folkloric dance performed to the rhythm of mizmar pipes and daf drums. The dancer spins continuously while manipulating heavy, layered geometric skirts weighing over 15 kilograms, creating kaleidoscopic swirling discs symbolizing the rotation of planets around the cosmic center.',
    media_url: '/photos/culture_29.jpeg',
    media_credit: 'El Tannoura Egyptian Heritage Troupe',
    source_url: 'https://en.wikipedia.org/wiki/Tanoura',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 3, name: 'Middle Eastern', slug: 'middle-eastern', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 360, commentsCount: 27, sharesCount: 20, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000030-0000-0000-0000-00000000030',
    author: DEMONSTRATION_AUTHORS.kenji_tanaka,
    author_id: DEMONSTRATION_AUTHORS.kenji_tanaka.id,
    body: 'Miyako Odori & Japanese Classical Dance (Gion, Kyoto) — Revered spring dance performance first staged in 1872 during the Kyoto Exhibition. Geiko and maiko in trailing hand-painted silk kimono with gold brocade obi perform stylized dances celebrating the seasons beneath blossoming cherry boughs.',
    media_url: '/photos/culture_30.jpeg',
    media_credit: 'Gion Kobu Kabukai Foundation',
    source_url: 'https://www.miyako-odori.jp',
    community: { slug: 'performing-arts', name: 'Performing Arts' },
    tags: [{ id: 2, name: 'Japanese', slug: 'japanese', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 480, commentsCount: 41, sharesCount: 33, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000031-0000-0000-0000-00000000031',
    author: DEMONSTRATION_AUTHORS.kenji_tanaka,
    author_id: DEMONSTRATION_AUTHORS.kenji_tanaka.id,
    body: "Karatsu Kunchi Festival (Saga Prefecture, Japan) — Autumn harvest festival featuring fourteen colossal Hikiyama floats dating from 1819 to 1876. Shaped like giant red and golden lions, samurai helmets, and dragons, the floats are crafted using hundreds of layers of Japanese washi paper and gold leaf lacquer, pulled through the streets to rhythmic cries of 'Enya! Enya!'",
    media_url: '/photos/culture_31.jpeg',
    media_credit: 'Karatsu Hikiyama Preservation Society',
    source_url: 'https://www.karatsu-kankou.jp',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 2, name: 'Japanese', slug: 'japanese', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 390, commentsCount: 30, sharesCount: 22, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000032-0000-0000-0000-00000000032',
    author: DEMONSTRATION_AUTHORS.karim_hassan,
    author_id: DEMONSTRATION_AUTHORS.karim_hassan.id,
    body: 'Sheikh Zayed Grand Mosque (Abu Dhabi, UAE) — Landmark Islamic monument completed in 2007, blending Mamluk, Ottoman, and Fatimid architectural elements. Built with pure Macedonian Sivec white marble, it features 82 domes, 1,096 exterior columns inlaid with semi-precious amethyst and mother-of-pearl, and the world\'s largest hand-knotted Persian carpet.',
    media_url: '/photos/culture_32.jpeg',
    video_url: '/videos/Islamic_Culture_Clip_2_Prayer_and_Heritage.mp4',
    is_video: true,
    media_credit: 'Sheikh Zayed Grand Mosque Centre',
    source_url: 'https://www.szgmc.gov.ae',
    community: { slug: 'sacred-architecture', name: 'Sacred Architecture' },
    tags: [{ id: 3, name: 'Middle Eastern', slug: 'middle-eastern', kind: 'culture' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 620, commentsCount: 55, sharesCount: 46, isLiked: false, isSaved: false, isHidden: false },
  },
  {
    id: 'c0000033-0000-0000-0000-00000000033',
    author: DEMONSTRATION_AUTHORS.marcus_vance,
    author_id: DEMONSTRATION_AUTHORS.marcus_vance.id,
    body: 'Traditional American Square Dance & Barn Dance — Folk dance tradition rooted in 17th-century English country dance, French quadrilles, and Appalachian fiddle music. Four couples in colorful circle skirts and western workshirts form a square, executing synchronized promenades, do-si-dos, and swings guided by the caller\'s rhythmic rhymes.',
    media_url: '/photos/culture_33.jpeg',
    media_credit: 'American Folk Dance & Music Archive',
    source_url: 'https://en.wikipedia.org/wiki/Square_dance',
    community: { slug: 'festivals-pageantry', name: 'Festivals & Pageantry' },
    tags: [{ id: 6, name: 'Workwear', slug: 'workwear', kind: 'aesthetic' }],
    is_editorial: true,
    is_demo: true,
    status: 'published',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reactions: { likesCount: 310, commentsCount: 22, sharesCount: 16, isLiked: false, isSaved: false, isHidden: false },
  },
]

export const DEMO_DISPATCHES_MAP = new Map(
  DEMONSTRATION_DISPATCHES.map((d) => [d.id, d])
)

/**
 * Check if a post ID represents a demonstration seed post
 */
export function isDemoPostId(postId) {
  if (!postId) return false
  return (
    DEMO_DISPATCHES_MAP.has(postId) ||
    /^c00000\d{2}-0000-0000-0000-0000000000\d{2}$/.test(postId)
  )
}

/**
 * Retrieve demonstration post by ID
 */
export function getDemoPostById(postId) {
  if (!postId) return null
  if (DEMO_DISPATCHES_MAP.has(postId)) {
    return DEMO_DISPATCHES_MAP.get(postId)
  }
  // Check index match
  const match = postId.match(/^c00000(\d{2})-/)
  if (match) {
    const idx = parseInt(match[1], 10) - 1
    if (idx >= 0 && idx < DEMONSTRATION_DISPATCHES.length) {
      return DEMONSTRATION_DISPATCHES[idx]
    }
  }
  return null
}

/**
 * Retrieve demonstration author by handle
 */
export function getDemoAuthorByHandle(handle) {
  if (!handle) return null
  const clean = handle.toLowerCase().replace(/^@/, '')
  return DEMONSTRATION_AUTHORS[clean] || null
}

/**
 * Retrieve demonstration author by ID
 */
export function getDemoAuthorById(id) {
  if (!id) return null
  return DEMO_AUTHORS_LIST.find((a) => a.id === id) || null
}

/**
 * Retrieve all demonstration posts authored by a specific handle
 */
export function getDemoPostsByAuthorHandle(handle) {
  const author = getDemoAuthorByHandle(handle)
  if (!author) return []
  return DEMONSTRATION_DISPATCHES.filter((d) => d.author.handle === author.handle)
}

/**
 * Retrieve all demonstration posts authored by a specific demo author ID
 */
export function getDemoPostsByAuthorId(authorId) {
  return DEMONSTRATION_DISPATCHES.filter(
    (d) => d.author.id === authorId || d.author_id === authorId
  )
}
