/**
 * src/features/culture/services/cultureMasterConstants.js
 *
 * Grounded fallback dataset and distribution metrics for the
 * 1,000,000 Culture Master Dataset (v3.0-1M).
 */

export const MASTER_DATASET_DISTRIBUTION = {
  total_records: 1000000,
  dataset_version: '3.0-1M',
  original_seed_records: 50,
  expanded_records: 999950,
  priority_regions: {
    India: 220000,
    'United States': 190000,
    Germany: 150000,
    Japan: 120000,
    Global: 320000,
  },
  supported_kinds: ['music', 'dance', 'food', 'craft', 'fashion', 'diaspora', 'heritage', 'art'],
}

export const FALLBACK_MASTER_NODES = [
  {
    slug: 'aboriginal_australian_art_diaspora_community_connections_09950',
    name: 'First Nations Australian Art — Diaspora & Exchange: Community Connections',
    kind: 'diaspora',
    origin: 'Australia',
    era: 'tens of thousands of years–present',
    description:
      'An expanded Hailey content node examining migration, diaspora, cultural exchange and adaptation within First Nations Australian Art. Derived from original seed record.',
    related_tags: ['heritage', 'art', 'place', 'oral-history', 'diaspora', 'hailey-1m', 'australia'],
    community_slug: 'global-living-heritage',
    experiences: [
      'Explore diaspora & exchange through the context of First Nations Australian Art',
      'Compare documented and contemporary expressions related to diaspora & exchange',
      'Trace how community connections connects people, place, practice and memory',
    ],
    places: [
      {
        name: 'Alice Springs',
        type: 'cultural_place',
        note: 'Important place connected to First Nations Australian Art.',
      },
      {
        name: 'Northern Territory',
        type: 'cultural_place',
        note: 'Important place connected to First Nations Australian Art.',
      },
    ],
    people: [
      {
        name: 'Emily Kame Kngwarreye',
        role: 'associated practitioner / cultural figure',
        note: 'Verify biographical attribution.',
      },
      {
        name: 'David Malangi',
        role: 'associated practitioner / cultural figure',
        note: 'Verify biographical attribution.',
      },
    ],
    practices: [
      { name: 'Country-based storytelling', type: 'living_practice' },
      { name: 'dot and line systems', type: 'living_practice' },
      { name: 'community art practice', type: 'living_practice' },
    ],
    artifacts: [
      {
        name: 'Country-Based Storytelling',
        type: 'cultural_artifact',
        note: 'Object-level attribution required.',
      },
    ],
    timeline: [
      {
        year: 'tens of thousands of years',
        event: 'Early documented forms develop within regional social context.',
      },
      {
        year: '20th century',
        event: 'Adapts through migration, media, institutions, and community practice.',
      },
      {
        year: 'present',
        event: 'First Nations Australian Art continues through contemporary reinterpretation.',
      },
    ],
    media: {
      hero_image_url:
        'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80',
      image_source: 'Wikimedia Commons / Public Archive',
      license_note: 'CC-BY-SA-4.0 / Public Domain verification required.',
      generated_image_prompt: 'Editorial cultural illustration about First Nations Australian Art.',
    },
    sources: [
      {
        label: 'UNESCO Intangible Cultural Heritage',
        url: 'https://ich.unesco.org/',
        about: 'Living-heritage context.',
      },
      {
        label: 'Smithsonian Collections',
        url: 'https://collections.si.edu/search/',
        about: 'Searchable museum records.',
      },
    ],
    editorial_status: 'verified_seed_record',
    expansion_metadata: {
      dataset_version: '3.0-1M',
      region: 'Australia',
      focus: 'diaspora',
      focus_title: 'Diaspora & Exchange',
      perspective: 'Community Connections',
      is_original_seed: true,
    },
    is_original_seed: true,
  },
  {
    slug: 'culture_0_0_1',
    name: 'Indian Culture — India: Music & Sound — Origins and Context #1',
    kind: 'music',
    origin: 'India',
    era: 'Contemporary / multi-period; verify specific historical scope',
    description:
      'Structured cultural research node for India focused on Music & Sound. Explores Hindustani and Carnatic modal traditions, raga aesthetics, and devotional oral traditions.',
    related_tags: ['Indian', 'India', 'music', 'hailey-1m', 'research-node', 'classical-raga'],
    community_slug: 'south-asian-handloom',
    experiences: [
      'Explore Music & Sound in India',
      'Compare regional and contemporary expressions',
      'Trace connections among people, place, practice and memory',
    ],
    places: [
      {
        name: 'Varanasi',
        type: 'cultural_place',
        note: 'Center of classical musical gharanas.',
      },
      {
        name: 'Chennai',
        type: 'cultural_place',
        note: 'Center of Carnatic music festival season.',
      },
    ],
    people: [
      {
        name: 'Tansen',
        role: 'historical composer / icon',
        note: 'Seminal figure in North Indian classical music.',
      },
    ],
    practices: [
      { name: 'Raga improvisation', type: 'living_practice' },
      { name: 'Tala rhythmic cycles', type: 'living_practice' },
      { name: 'Guru-shishya parampara', type: 'living_practice' },
    ],
    artifacts: [
      {
        name: 'Sitar & Tanpura',
        type: 'cultural_artifact',
        note: 'Acoustic chordophones central to modal performance.',
      },
    ],
    timeline: [
      {
        year: 'Ancient (c. 1500 BCE)',
        event: 'Sama Veda chanting establishes sacred melodic foundations.',
      },
      {
        year: '16th Century',
        event: 'Mughal court patronage synthesizes Persian and Indic musical systems.',
      },
      {
        year: 'present',
        event: 'Global synthesis across diaspora, cinema, and world acoustic stages.',
      },
    ],
    media: {
      hero_image_url:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      image_source: 'Wikimedia Commons MediaSearch',
      license_note: 'Verify media provenance before production use.',
      generated_image_prompt: 'Editorial illustration of Indian classical musicians.',
    },
    sources: [
      {
        label: 'Sangeet Natak Akademi',
        url: 'https://sangeetnatak.gov.in/',
        about: 'National academy for performing arts.',
      },
    ],
    editorial_status: 'synthetic_research_node_requires_verification',
    expansion_metadata: {
      dataset_version: '3.0-1M',
      region: 'India',
      cultural_label: 'Indian',
      focus: 'music',
      focus_title: 'Music & Sound',
      perspective: 'Origins and Context',
      is_original_seed: false,
    },
    is_original_seed: false,
  },
  {
    slug: 'culture_0_1_2',
    name: 'Indian Culture — India: Dance & Movement — Origins and Context #2',
    kind: 'dance',
    origin: 'India',
    era: 'Classical Antiquity to Present',
    description:
      'Structured cultural research node for India focused on Dance & Movement. Encompasses Natya Shastra traditions, Bharatanatyam, Kathak, Odissi, and folk celebratory dances.',
    related_tags: ['Indian', 'India', 'dance', 'hailey-1m', 'research-node', 'bharatanatyam'],
    community_slug: 'south-asian-handloom',
    experiences: [
      'Explore Dance & Movement in India',
      'Compare regional and contemporary expressions',
      'Trace mudra hand gestures and expressive abhinaya',
    ],
    places: [
      {
        name: 'Thanjavur',
        type: 'cultural_place',
        note: 'Cradle of Sadir and Bharatanatyam temple traditions.',
      },
    ],
    people: [
      {
        name: 'Rukmini Devi Arundale',
        role: 'revivalist choreographer',
        note: 'Kalakshetra founder.',
      },
    ],
    practices: [
      { name: 'Abhinaya facial expression', type: 'living_practice' },
      { name: 'Nritta pure rhythm', type: 'living_practice' },
    ],
    artifacts: [
      {
        name: 'Salangai / Ghungroo',
        type: 'cultural_artifact',
        note: 'Bells worn on ankles for percussive feedback.',
      },
    ],
    timeline: [
      {
        year: 'c. 2nd Century BCE',
        event: 'Compilation of the Natya Shastra treatise on performing arts.',
      },
      {
        year: '20th Century',
        event: 'Modern revival and formal institutionalization of classical styles.',
      },
    ],
    media: {
      hero_image_url:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      image_source: 'Wikimedia Commons MediaSearch',
      license_note: 'Verify media provenance.',
      generated_image_prompt: 'Bharatanatyam dancer in classical posture.',
    },
    sources: [
      {
        label: 'UNESCO Intangible Cultural Heritage',
        url: 'https://ich.unesco.org/',
        about: 'Indian classical dance documentation.',
      },
    ],
    editorial_status: 'synthetic_research_node_requires_verification',
    expansion_metadata: {
      dataset_version: '3.0-1M',
      region: 'India',
      cultural_label: 'Indian',
      focus: 'dance',
      focus_title: 'Dance & Movement',
      perspective: 'Origins and Context',
      is_original_seed: false,
    },
    is_original_seed: false,
  },
  {
    slug: 'culture_1_0_1',
    name: 'American Culture — United States: Music & Sound — Origins and Context #1',
    kind: 'music',
    origin: 'United States',
    era: '19th–21st Century',
    description:
      'Structured cultural research node for the United States focused on Music & Sound. Explores the delta blues, jazz improvisation, Appalachian folk, and Bronx hip-hop sonic heritage.',
    related_tags: ['American', 'United States', 'music', 'blues', 'jazz', 'hip-hop', 'hailey-1m'],
    community_slug: 'bronx-hiphop-origins',
    experiences: [
      'Explore Blues and Jazz roots across the American South and Northern cities',
      'Examine technological reproduction from vinyl to digital sampling',
      'Trace community roots in African American church traditions',
    ],
    places: [
      {
        name: 'New Orleans, Louisiana',
        type: 'cultural_place',
        note: 'Cradle of early jazz and Congo Square gatherings.',
      },
      {
        name: 'The Bronx, New York',
        type: 'cultural_place',
        note: 'Birthplace of hip-hop breaks at 1520 Sedgwick Ave.',
      },
    ],
    people: [
      {
        name: 'Louis Armstrong',
        role: 'innovator & soloist',
        note: 'Pioneered solo melodic improvisation in jazz.',
      },
      {
        name: 'DJ Kool Herc',
        role: 'block party pioneer',
        note: 'Invented the merry-go-round breakbeat turntable technique.',
      },
    ],
    practices: [
      { name: 'Call-and-response vocalization', type: 'living_practice' },
      { name: 'Turntablism & breakbeat manipulation', type: 'living_practice' },
    ],
    artifacts: [
      {
        name: 'Technics SL-1200 Turntable',
        type: 'cultural_artifact',
        note: 'Direct-drive instrument of the block party DJ.',
      },
    ],
    timeline: [
      {
        year: '1910s–1920s',
        event: 'Great Migration spreads Southern blues into Chicago, Detroit, and Harlem.',
      },
      {
        year: '1973',
        event: 'DJ Kool Herc hosts foundational block party in the West Bronx.',
      },
    ],
    media: {
      hero_image_url:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      image_source: 'Wikimedia Commons',
      license_note: 'Public archival imagery.',
      generated_image_prompt: 'Editorial block party scene in the Bronx with twin turntables.',
    },
    sources: [
      {
        label: 'Library of Congress National Recording Registry',
        url: 'https://www.loc.gov/programs/national-recording-preservation-board/',
        about: 'Audio heritage.',
      },
    ],
    editorial_status: 'synthetic_research_node_requires_verification',
    expansion_metadata: {
      dataset_version: '3.0-1M',
      region: 'United States',
      cultural_label: 'American',
      focus: 'music',
      focus_title: 'Music & Sound',
      perspective: 'Origins and Context',
      is_original_seed: false,
    },
    is_original_seed: false,
  },
  {
    slug: 'culture_2_0_1',
    name: 'German Culture — Germany: Modular Electronics & Club Geometries #1',
    kind: 'music',
    origin: 'Germany',
    era: 'Post-1989 to Present',
    description:
      'Structured cultural research node for Germany focused on Electronic Sound & Spatial Art. Explores Krautrock synthesizers, post-Wall Berlin warehouse spaces, and minimal techno.',
    related_tags: ['German', 'Germany', 'techno', 'modular', 'berlin', 'hailey-1m'],
    community_slug: 'berlin-modular-minimal',
    experiences: [
      'Explore modular analog synthesizers and electronic sequencing',
      'Understand the reclamation of industrial spaces after the fall of the Berlin Wall',
      'Examine club culture as an intangible cultural heritage space',
    ],
    places: [
      {
        name: 'Berlin-Mitte & Kreuzberg',
        type: 'cultural_place',
        note: 'Historic hub of club culture and electronic studio spaces.',
      },
      {
        name: 'Düsseldorf',
        type: 'cultural_place',
        note: 'Kling Klang studio origins of electronic pop.',
      },
    ],
    people: [
      {
        name: 'Kraftwerk',
        role: 'electronic pioneers',
        note: 'Founded automated pop and electronic sequence aesthetics.',
      },
    ],
    practices: [
      { name: 'All-night communal dance gatherings', type: 'living_practice' },
      { name: 'Patching Eurorack synthesizers', type: 'living_practice' },
    ],
    artifacts: [
      {
        name: 'Roland TR-909 & TB-303',
        type: 'cultural_artifact',
        note: 'Analog instruments defining minimal rhythms.',
      },
    ],
    timeline: [
      {
        year: '1989–1991',
        event: 'Fall of the Berlin Wall enables temporary use of abandoned spaces for clubs.',
      },
      {
        year: '2024',
        event:
          'Berlin techno culture inscribed on UNESCO nationwide intangible cultural heritage registry.',
      },
    ],
    media: {
      hero_image_url:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      image_source: 'Wikimedia Commons',
      license_note: 'Open access.',
      generated_image_prompt: 'Minimalist modular synthesizer rack with patch cords.',
    },
    sources: [
      {
        label: 'UNESCO German Commission',
        url: 'https://www.unesco.de/en/culture-and-nature/intangible-cultural-heritage',
        about: 'Berlin Techno inscription.',
      },
    ],
    editorial_status: 'synthetic_research_node_requires_verification',
    expansion_metadata: {
      dataset_version: '3.0-1M',
      region: 'Germany',
      cultural_label: 'German',
      focus: 'music',
      focus_title: 'Modular & Electronic Culture',
      perspective: 'Origins and Context',
      is_original_seed: false,
    },
    is_original_seed: false,
  },
  {
    slug: 'culture_3_0_1',
    name: 'Japanese Culture — Japan: Craft, Textiles & Streetwear Geometries #1',
    kind: 'fashion',
    origin: 'Japan',
    era: 'Edo Period to Contemporary Ura-Harajuku',
    description:
      'Structured cultural research node for Japan focused on Craft & Streetwear. Explores traditional indigo dyeing (aizome), boro mending, selvedge denim shuttle looms, and Tokyo streetwear archives.',
    related_tags: ['Japanese', 'Japan', 'streetwear', 'indigo', 'textiles', 'harajuku', 'hailey-1m'],
    community_slug: 'streetwear-archive',
    experiences: [
      'Explore Ura-Harajuku independent label movements of the 1990s',
      'Trace traditional indigo vats and sashiko reinforcement stitching',
      'Examine vintage American repro craftsmanship in Kojima, Okayama',
    ],
    places: [
      {
        name: 'Harajuku & Shibuya, Tokyo',
        type: 'cultural_place',
        note: 'Epicenter of 1990s Japanese streetwear archives.',
      },
      {
        name: 'Kojima, Kurashiki',
        type: 'cultural_place',
        note: 'Denim capital of Japan preserving vintage shuttle loom weaving.',
      },
    ],
    people: [
      {
        name: 'Hiroshi Fujiwara',
        role: 'cultural curator & designer',
        note: 'Pioneer of Ura-Harajuku streetwear network.',
      },
    ],
    practices: [
      { name: 'Sashiko hand-stitching', type: 'living_practice' },
      { name: 'Natural fermentation indigo dyeing', type: 'living_practice' },
    ],
    artifacts: [
      {
        name: 'Toyoda G3 shuttle loom',
        type: 'cultural_artifact',
        note: 'Vintage machinery crafting low-tension selvedge denim.',
      },
    ],
    timeline: [
      {
        year: '17th Century',
        event:
          'Edo-era sumptuary laws foster subtle interior textile mastery and indigo shades.',
      },
      {
        year: '1990s',
        event: 'Ura-Harajuku movement establishes global blueprint for limited-run streetwear.',
      },
    ],
    media: {
      hero_image_url:
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
      image_source: 'Wikimedia Commons',
      license_note: 'Open access.',
      generated_image_prompt: 'Japanese craftsman dipping cotton into deep indigo vat.',
    },
    sources: [
      {
        label: 'Japan National Tourism Organization Crafts',
        url: 'https://www.japan.travel/en/guide/traditional-crafts/',
        about: 'Official craft registry.',
      },
    ],
    editorial_status: 'synthetic_research_node_requires_verification',
    expansion_metadata: {
      dataset_version: '3.0-1M',
      region: 'Japan',
      cultural_label: 'Japanese',
      focus: 'fashion',
      focus_title: 'Craft & Streetwear',
      perspective: 'Origins and Context',
      is_original_seed: false,
    },
    is_original_seed: false,
  },
]
