import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: 'frontend/.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ycftnowviqyapxycirwz.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const AUTHOR_ID = 'fdd83264-e15c-4b05-8f75-68bbd577df3c' // Jeevan Surya

const POSTS = [
  {
    media_url: '/photos/culture_01.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'south-asian',
    media_credit: 'Archaeological Survey of India / Hailey Field Archive',
    source_url: 'https://whc.unesco.org/en/list/252',
    body: 'Taj Mahal (Agra, Uttar Pradesh) — Commissioned in 1631 by Mughal Emperor Shah Jahan. Built with translucent Makrana white marble, featuring pietra dura (parchin kari) floral stone inlays with lapis lazuli, carnelian, and jade. The central dome rises 73 meters, framed by four minarets tilted slightly outward to protect the tomb in case of earthquakes. A testament to Persian, Islamic, and Indian architectural synthesis.',
    likes: 42,
    shares: 12,
    comments: [
      'The symmetry of the parchin kari floral inlays is awe-inspiring in person.',
      'One of the greatest architectural wonders ever created by humankind.'
    ]
  },
  {
    media_url: '/photos/culture_02.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'south-asian',
    media_credit: 'UNESCO Living Heritage Archive',
    source_url: 'https://whc.unesco.org/en/list/524',
    body: 'The Great Stupa at Sanchi (Madhya Pradesh) — Commissioned by Emperor Ashoka in the 3rd Century BCE. Its hemispherical sandstone dome represents the cosmic vault and the parinirvana of the Buddha. The four elaborately carved Toranas (ornamental gateways) depict Jataka tales, sacred yakshinis, and Buddhist aniconic emblems, standing as one of the oldest preserved stone structures in South Asia.',
    likes: 38,
    shares: 9,
    comments: [
      'The Torana carvings of the Yakshinis under sal trees reflect profound nature veneration.'
    ]
  },
  {
    media_url: '/photos/culture_03.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'workwear',
    media_credit: 'National Park Service / Architectural Heritage',
    source_url: 'https://www.nps.gov/whho/index.htm',
    body: 'The White House (Washington, D.C.) — Designed by Irish-born architect James Hoban in the Neoclassical Federal style, constructed between 1792 and 1800 using Aquia Creek sandstone. The iconic South Portico with its Ionic colonnade frames the Ellipse and the Washington Monument obelisk, embodying the civic architectural ideals of the American Republic.',
    likes: 24,
    shares: 5,
    comments: [
      'The neoclassical portico proportions are influenced by Leinster House in Dublin.'
    ]
  },
  {
    media_url: '/photos/culture_04.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'south-asian',
    media_credit: 'Sangeet Natak Akademi Archives',
    source_url: 'https://sangeetnatak.gov.in',
    body: 'Bharatanatyam (Tamil Nadu, India) — Ancient classical dance form codified in the Natya Shastra by sage Bharata Muni. Dancers in pleated Kanchipuram silk saris with zari borders and brass salangai (ankle bells) perform intricate nritta (pure rhythmic footwork) and abhinaya (expressive facial gestures). Each mudra conveys spiritual and philosophical narratives of devotion and nature.',
    likes: 56,
    shares: 18,
    comments: [
      'The Aramandi stance requires extraordinary physical discipline and balance.',
      'Fascinating how sacred geometry is translated into physical mudras.'
    ]
  },
  {
    media_url: '/photos/culture_05.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'middle-eastern',
    media_credit: 'Islamic Endowment & Heritage Survey',
    source_url: 'https://whc.unesco.org/en/list/148',
    body: 'Dome of the Rock (Jerusalem) — Umayyad architectural masterpiece completed in 691 CE under Caliph Abd al-Malik. The octagonal arcade is adorned with intricate glazed Persian ceramic tiles, Quranic calligraphy friezes, and an exquisite gilded wooden dome crowning the Foundation Stone. One of the earliest and most revered monuments of Islamic civilization.',
    likes: 47,
    shares: 14,
    comments: [
      'The octagonal ambulatory design echoes late Roman and Byzantine martyria.'
    ]
  },
  {
    media_url: '/photos/culture_06.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'street-photography',
    media_credit: 'National Park Service Archives',
    source_url: 'https://www.nps.gov/stli/index.htm',
    body: 'Statue of Liberty (New York Harbor) — Designed by French sculptor Frédéric-Auguste Bartholdi with internal iron pylon framework by Gustave Eiffel. Dedicated in 1886 as a gift of friendship from France to the United States. Its repoussé copper skin, naturally patinated to verdigris green, stands on a star-shaped granite pedestal on Liberty Island, welcoming generations of immigrants.',
    likes: 39,
    shares: 8,
    comments: [
      'The repoussé copper technique allowed such a massive sculpture to be lightweight.'
    ]
  },
  {
    media_url: '/photos/culture_07.jpeg',
    community_slug: 'urban-expression',
    tag_slug: 'streetwear',
    media_credit: 'Urban Arts Cultural Archive',
    source_url: 'https://www.bronxmuseum.org',
    body: 'Bronx Hip-Hop & B-Boying Culture (New York) — Originating in the South Bronx during the early 1970s block parties pioneered by DJ Kool Herc. Dancers execute toprock, downrock, power moves, and freezes on concrete and linoleum. B-boying grew from an inner-city street expression into a globally recognized Olympic discipline and cultural pillar.',
    likes: 63,
    shares: 22,
    comments: [
      'The freeze at the end of a breakdown is where the dancer makes their identity statement.'
    ]
  },
  {
    media_url: '/photos/culture_08.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'street-photography',
    media_credit: 'New York Historical Pageant Archive',
    source_url: 'https://www.macys.com/p/parade/',
    body: 'Macy\'s Thanksgiving Day Parade (Manhattan, New York) — American folkloric street procession held annually since 1924. Featuring giant helium character balloons first crafted with puppeteer Tony Sarg, marching bands from every state, and theatrical floats passing through Herald Square. A living tradition celebrating mid-century American holiday spectacle.',
    likes: 31,
    shares: 7,
    comments: [
      'Tony Sarg\'s original giant balloon designs were inspired by traditional marionettes.'
    ]
  },
  {
    media_url: '/photos/culture_09.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'south-asian',
    media_credit: 'Andhra Pradesh Department of Culture',
    source_url: 'https://culture.ap.gov.in',
    body: 'Kuchipudi (Andhra Pradesh, India) — Classical dance-drama originating from the village of Kuchipudi in Krishna district. Dancers balance on brass plates (Tarangam) while maintaining rhythmic precision and expressive sanchari bhava. Characterized by vivacious fast-paced footwork, sculpted postures, and intricate abhinaya honoring sacred epics.',
    likes: 52,
    shares: 16,
    comments: [
      'The Tarangam brass plate balance is astonishingly difficult to master.'
    ]
  },
  {
    media_url: '/photos/culture_10.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'oral-history',
    media_credit: 'Himalayan Living Heritage Trust',
    source_url: 'https://whc.unesco.org',
    body: 'Monastic Cham Dance (Tibet / Bhutan) — Sacred ritual dance performed by Buddhist monks wearing ceremonial silk brocade robes and symbolic hats during religious festivals (Tshechus). The slow, rhythmic circular movements, accompanied by long dungchen horns and cymbals, symbolize spiritual purification and the triumph of wisdom over ignorance.',
    likes: 45,
    shares: 11,
    comments: [
      'The resonance of the dungchen horns vibrates straight through the courtyard stones.'
    ]
  },
  {
    media_url: '/photos/culture_11.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'south-asian',
    media_credit: 'Ladakh Monastic Archive',
    source_url: 'https://leh.nic.in',
    body: 'Hemis Festival Cham (Ladakh, India) — Sacred masked pageant held at Hemis Gompa honoring Guru Padmasambhava. Monks don fearsome, hand-carved wooden masks depicting Mahakala and wrathful deities. The synchronized ritual movements represent the subjugation of negative energies, attracting pilgrims across the high-altitude Trans-Himalayan valleys.',
    likes: 58,
    shares: 20,
    comments: [
      'The colors of the silk robes against the barren Ladakh mountain backdrop are unforgettable.'
    ]
  },
  {
    media_url: '/photos/culture_12.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'south-asian',
    media_credit: 'Kalakshetra Heritage Collection',
    source_url: 'https://www.kalakshetra.in',
    body: 'Bharatanatyam Varnam (South India) — The central and most demanding suite of the Margam repertoire. Dancers perform complex rhythmic teermanams alongside soulful abhinaya, embodying aesthetic rasa (spiritual emotion). The interplay between rhythm, melody, and devotional poetry captures centuries of living temple lineage.',
    likes: 49,
    shares: 13,
    comments: [
      'Varnam is the true test of endurance and expressive depth for a classical dancer.'
    ]
  },
  {
    media_url: '/photos/culture_13.jpeg',
    community_slug: 'living-heritage',
    tag_slug: 'oral-history',
    media_credit: 'Theravada Monastic Heritage Association',
    source_url: 'https://en.wikipedia.org/wiki/Kathina',
    body: 'Kathina Robe Offering (Southeast Asia) — Theravada Buddhist festival held at the close of the three-month Vassa rainy-season retreat. Lay devotees offer new handwoven saffron and ochre robes, lotus flowers, and alms to the sangha (monastic community). A centuries-old communal ceremony fostering solidarity and merit-making.',
    likes: 33,
    shares: 6,
    comments: [
      'A deeply serene celebration of communal gratitude and ascetic practice.'
    ]
  },
  {
    media_url: '/photos/culture_14.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'south-asian',
    media_credit: 'Trans-Himalayan Cultural Society',
    source_url: 'https://leh.nic.in',
    body: 'Hemis Monastic Gathering (Spiti & Ladakh) — High-altitude congregation of Buddhist monks, lamas, and mountain communities. Adorned in crimson woolen robes and surrounded by five-colored prayer flags (lungta), the congregation gathers for monastic discourses, cham blessings, and collective prayers for universal compassion.',
    likes: 41,
    shares: 10,
    comments: [
      'The high altitude devotion and the fluttering prayer flags create a timeless aura.'
    ]
  },
  {
    media_url: '/photos/culture_15.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'japanese',
    media_credit: 'Himeji Cultural Heritage Preservation Division',
    source_url: 'https://whc.unesco.org/en/list/661',
    body: 'Himeji Castle (Hyogo Prefecture, Japan) — Regarded as the finest surviving example of early 17th-century Japanese feudal castle architecture. Featuring pristine white-plastered timber walls, tiered gables (chidori hafu), and an ingenious defensive spiral layout designed by Toyotomi Hideyoshi and Ikeda Terumasa. Recognized as Japan\'s first UNESCO World Cultural Heritage site.',
    likes: 67,
    shares: 25,
    comments: [
      'The White Heron design resembles a magnificent bird spreading its wings.',
      'The wooden joinery has survived centuries of earthquakes without modern hardware.'
    ]
  },
  {
    media_url: '/photos/culture_16.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'analog-film-photo',
    media_credit: 'Parco Archeologico del Colosseo',
    source_url: 'https://whc.unesco.org/en/list/91',
    body: 'The Colosseum (Rome, Italy) — Built under emperors Vespasian and Titus between 72 and 80 CE. Constructed of travertine limestone, tuff, and brick-faced concrete, it could seat over 50,000 spectators across three tiers of Doric, Ionic, and Corinthian arches. An enduring symbol of ancient Roman civil engineering and urban spectacle.',
    likes: 54,
    shares: 15,
    comments: [
      'Roman concrete (pozzolana) remains one of the greatest materials in human history.'
    ]
  },
  {
    media_url: '/photos/culture_17.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'japanese',
    media_credit: 'Kumano Sacred Sites Heritage Board',
    source_url: 'https://whc.unesco.org/en/list/1142',
    body: 'Seiganto-ji Pagoda & Nachi Falls (Wakayama, Japan) — Spiritual heart of the Kumano Kodo pilgrimage routes. The three-tiered vermilion pagoda stands against the dramatic 133-meter Nachi Falls, a sacred shintai (dwelling of kami) revered in both Shinto and Tendai Buddhist syncretism for over a millennium.',
    likes: 71,
    shares: 28,
    comments: [
      'The fusion of natural waterfall divinity and Buddhist architecture is breathtaking.'
    ]
  },
  {
    media_url: '/photos/culture_18.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'south-asian',
    media_credit: 'Folk Art and Ritual Heritage Survey',
    source_url: 'https://indiaculture.gov.in',
    body: 'Diwali Rangoli & Deepotsav (India) — Sacred floor art created during the Festival of Lights using colored quartz powder, flower petals, and rice flour. Intricate geometric mandalas and peacock patterns are illuminated with handmade clay oil lamps (diyas), symbolizing the triumph of light over darkness and welcoming prosperity and auspicious energy.',
    likes: 62,
    shares: 21,
    comments: [
      'The ephemerality of the rice flour rangoli is part of its philosophical beauty.'
    ]
  },
  {
    media_url: '/photos/culture_19.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'street-photography',
    media_credit: 'Société d\'Exploitation de la Tour Eiffel',
    source_url: 'https://www.toureiffel.paris',
    body: 'The Eiffel Tower (Paris, France) — Erected on the Champ de Mars for the 1889 Exposition Universelle to celebrate the centennial of the French Revolution. Built with 18,038 puddling iron parts and 2.5 million rivets by Gustave Eiffel\'s engineering atelier, rising 330 meters as an enduring icon of French industrial modernism.',
    likes: 44,
    shares: 11,
    comments: [
      'Gustave Eiffel proved that structural engineering could be pure high art.'
    ]
  },
  {
    media_url: '/photos/culture_20.jpeg',
    community_slug: 'living-heritage',
    tag_slug: 'oral-history',
    media_credit: 'European Ethnographic Living Archive',
    source_url: 'https://en.wikipedia.org/wiki/Zaduszki',
    body: 'Zaduszki & All Saints\' Night (Central & Eastern Europe) — Ancient memorial observance on November 1st and 2nd. Families gather in ancestral cemeteries to light thousands of znicze (votive glass candles) and lay fresh chrysanthemums on gravestones, transforming the twilight burial grounds into luminous seas of ancestral remembrance.',
    likes: 37,
    shares: 9,
    comments: [
      'The warmth of the candlelight in the autumn chill conveys deep familial reverence.'
    ]
  },
  {
    media_url: '/photos/culture_21.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'south-asian',
    media_credit: 'Spiti Heritage Preservation Council',
    source_url: 'https://himachaltourism.gov.in',
    body: 'Key Monastery (Spiti Valley, India) — Tibetan Buddhist monastery of the Gelugpa sect perched at 4,166 meters above sea level overlooking the Spiti River. Established in the 11th century, its fortress-like stacked architecture houses priceless thangkas, ancient manuscripts, and sacred prayer halls that have endured high-altitude Himalayan isolation.',
    likes: 59,
    shares: 19,
    comments: [
      'Standing inside the centuries-old Dukhang prayer room feels like stepping out of time.'
    ]
  },
  {
    media_url: '/photos/culture_22.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'celtic',
    media_credit: 'An Coimisiún le Rincí Gaelacha',
    source_url: 'https://www.clrg.ie',
    body: 'Irish Step Dancing (Ireland & Global Diaspora) — Traditional step dance characterized by a rigid upper torso and lightning-fast precision footwork. Dancers at regional Feis competitions wear elaborately hand-embroidered solo dresses featuring Celtic knotwork, Tara brooches, and stiffened hornpipe shoes, celebrating Gaelic cultural resurgence.',
    likes: 46,
    shares: 14,
    comments: [
      'The percussive rhythm created by the fiberglass tips is hypnotic.'
    ]
  },
  {
    media_url: '/photos/culture_23.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'workwear',
    media_credit: 'Munich City Heritage Collection',
    source_url: 'https://www.oktoberfest.de',
    body: 'Oktoberfest & Bavarian Volkstradition (Munich, Germany) — World\'s largest folk festival, held since 1810 on the Theresienwiese. Revelers in authentic Bavarian Tracht — hand-stitched leather Lederhosen and alpine Dirndl — gather beneath giant hops-wreath chandeliers in historic brewery tents to brass Blasmusik and centuries-old culinary heritage.',
    likes: 51,
    shares: 17,
    comments: [
      'The craft of traditional deerskin Lederhosen lasts generations as family heirlooms.'
    ]
  },
  {
    media_url: '/photos/culture_24.jpeg',
    community_slug: 'living-heritage',
    tag_slug: 'middle-eastern',
    media_credit: 'National Museum of Islamic Art',
    source_url: 'https://www.metmuseum.org',
    body: 'Persian & Islamic Silk Tapestries — Historic textile masterpieces featuring hand-knotted silk on silk foundations with knot densities exceeding 800 knots per square inch. Master weavers from Tabriz, Isfahan, and Kashan incorporate sacred medallion patterns, cypress trees of life, and arabesque foliage dyed with madder root, indigo, and saffron.',
    likes: 48,
    shares: 12,
    comments: [
      'Natural madder root and pomegranate rind dyes retain their brilliance for centuries.'
    ]
  },
  {
    media_url: '/photos/culture_25.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'middle-eastern',
    media_credit: 'UNESCO Intangible Cultural Heritage Registry',
    source_url: 'https://ich.unesco.org/en/RL/mevlevi-sema-ceremony-00065',
    body: 'Mevlevi Sema Ceremony (Konya, Turkey) — 13th-century Sufi spiritual ceremony inspired by mystic poet Jalaluddin Rumi. Dervishes wearing tall felt camel-hair hats (sikke) representing ego\'s tombstone and white flared skirts (tennure) spin with their right palms turned toward heaven to receive divine grace and left palms toward earth to distribute love.',
    likes: 64,
    shares: 26,
    comments: [
      'The Sema is not a dance for entertainment, but a moving meditation of divine communion.'
    ]
  },
  {
    media_url: '/photos/culture_26.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'latino',
    media_credit: 'Centro Andaluz de Flamenco',
    source_url: 'https://ich.unesco.org/en/RL/flamenco-00363',
    body: 'Andalusian Flamenco (Seville & Granada, Spain) — Deep expressive art form blending Romani, Moorish, Jewish, and traditional Andalusian roots. Featuring cante jondo (deep singing), passionate toque on Spanish cypress guitar, and explosive zapateado (percussive footwork) in ruffled bata de cola dresses expressing duende (artistic soul).',
    likes: 61,
    shares: 23,
    comments: [
      'The concept of duende is the heartbeat of genuine Andalusian Flamenco.'
    ]
  },
  {
    media_url: '/photos/culture_27.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'japanese',
    media_credit: 'Tokushima City Tourism Association',
    source_url: 'https://www.awaodori-kaikan.jp',
    body: 'Awa Odori (Tokushima Prefecture, Japan) — Japan\'s most famous Bon dance festival, dating back over 400 years to 1587. Female dance troupes (ren) wear braided amigasa straw hats, vibrant yukata, and geta sandals elevated on the front toe, executing lively choreography to shamisen, taiko drums, and the infectious refrain: \'The dancers are fools, the watchers are fools!\'',
    likes: 55,
    shares: 19,
    comments: [
      'Dancing on the tips of two-toothed wooden geta requires years of muscle memory.'
    ]
  },
  {
    media_url: '/photos/culture_28.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'japanese',
    media_credit: 'Kyoto Traditional Culture Preservation Guild',
    source_url: 'https://www.heianjingu.or.jp',
    body: 'Jidai Matsuri (Kyoto, Japan) — Grand historic pageant held each October at Heian Shrine. A two-kilometer procession of 2,000 participants dressed in museum-accurate period costumes recreates twelve centuries of Kyoto history, from the Meiji Restoration backward through the Edo, Muromachi, and Heian eras.',
    likes: 43,
    shares: 13,
    comments: [
      'Every single costume in Jidai Matsuri is handwoven using historic looms and natural dyes.'
    ]
  },
  {
    media_url: '/photos/culture_29.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'middle-eastern',
    media_credit: 'El Tannoura Egyptian Heritage Troupe',
    source_url: 'https://en.wikipedia.org/wiki/Tanoura',
    body: 'Egyptian Tanoura Dance (Cairo, Egypt) — Vibrant Sufi-derived folkloric dance performed to the rhythm of mizmar pipes and daf drums. The dancer spins continuously while manipulating heavy, layered geometric skirts weighing over 15 kilograms, creating kaleidoscopic swirling discs symbolizing the rotation of planets around the cosmic center.',
    likes: 46,
    shares: 15,
    comments: [
      'Lifting and detaching the multiple spinning skirts without pausing is a feat of pure strength.'
    ]
  },
  {
    media_url: '/photos/culture_30.jpeg',
    community_slug: 'performing-arts',
    tag_slug: 'japanese',
    media_credit: 'Gion Kobu Kabukai Foundation',
    source_url: 'https://www.miyako-odori.jp',
    body: 'Miyako Odori & Japanese Classical Dance (Gion, Kyoto) — Revered spring dance performance first staged in 1872 during the Kyoto Exhibition. Geiko and maiko in trailing hand-painted silk kimono with gold brocade obi perform stylized dances celebrating the seasons beneath blossoming cherry boughs.',
    likes: 68,
    shares: 27,
    comments: [
      'The seasonal cherry blossom choreography in Gion marks the arrival of spring across Kyoto.'
    ]
  },
  {
    media_url: '/photos/culture_31.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'japanese',
    media_credit: 'Karatsu Hikiyama Preservation Society',
    source_url: 'https://www.karatsu-kankou.jp',
    body: 'Karatsu Kunchi Festival (Saga Prefecture, Japan) — Autumn harvest festival featuring fourteen colossal Hikiyama floats dating from 1819 to 1876. Shaped like giant red and golden lions, samurai helmets, and dragons, the floats are crafted using hundreds of layers of Japanese washi paper and gold leaf lacquer, pulled through the streets to rhythmic cries of \'Enya! Enya!\'',
    likes: 57,
    shares: 20,
    comments: [
      'The urushi lacquer technique used on these century-old floats remains immaculate.'
    ]
  },
  {
    media_url: '/photos/culture_32.jpeg',
    community_slug: 'sacred-architecture',
    tag_slug: 'middle-eastern',
    media_credit: 'Sheikh Zayed Grand Mosque Centre',
    source_url: 'https://www.szgmc.gov.ae',
    body: 'Sheikh Zayed Grand Mosque (Abu Dhabi, UAE) — Landmark Islamic monument completed in 2007, blending Mamluk, Ottoman, and Fatimid architectural elements. Built with pure Macedonian Sivec white marble, it features 82 domes, 1,096 exterior columns inlaid with semi-precious amethyst and mother-of-pearl, and the world\'s largest hand-knotted Persian carpet.',
    likes: 66,
    shares: 24,
    comments: [
      'The courtyard marble floral mosaic is the largest marble mosaic design in the world.'
    ]
  },
  {
    media_url: '/photos/culture_33.jpeg',
    community_slug: 'festivals-pageantry',
    tag_slug: 'workwear',
    media_credit: 'American Folk Dance & Music Archive',
    source_url: 'https://en.wikipedia.org/wiki/Square_dance',
    body: 'Traditional American Square Dance & Barn Dance — Folk dance tradition rooted in 17th-century English country dance, French quadrilles, and Appalachian fiddle music. Four couples in colorful circle skirts and western workshirts form a square, executing synchronized promenades, do-si-dos, and swings guided by the caller\'s rhythmic rhymes.',
    likes: 35,
    shares: 8,
    comments: [
      'The caller\'s live improvisational patter keeps the barn dance electric and unpredictable.'
    ]
  }
]

async function seed() {
  console.log('Seeding 33 cultural dispatches authored by', AUTHOR_ID)

  // 1. Fetch communities and tags lookup
  const { data: communities } = await supabase.from('communities').select('id, slug')
  const { data: tags } = await supabase.from('tags').select('id, slug')

  const commMap = new Map((communities || []).map((c) => [c.slug, c.id]))
  const tagMap = new Map((tags || []).map((t) => [t.slug, t.id]))

  // Fallback community ID
  const defaultCommunityId = communities?.[0]?.id || null

  let insertedCount = 0

  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i]
    const communityId = commMap.get(p.community_slug) || defaultCommunityId
    const tagId = tagMap.get(p.tag_slug) || null

    const createdAt = new Date(Date.now() - (POSTS.length - i) * 3600 * 1000 * 4).toISOString()

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: AUTHOR_ID,
        community_id: communityId,
        body: p.body,
        media_url: p.media_url,
        media_credit: p.media_credit,
        source_url: p.source_url,
        is_editorial: true,
        status: 'approved',
        age_classification: 'all_ages',
        created_at: createdAt,
      })
      .select('id')
      .single()

    if (error) {
      console.error(`Error inserting post ${i + 1}:`, error.message)
      continue
    }

    insertedCount++

    // Associate tag
    if (tagId) {
      await supabase.from('post_tags').insert({
        post_id: post.id,
        tag_id: tagId,
        weight: 1.0,
      })
    }

    // Add comments
    for (const commentText of p.comments) {
      await supabase.from('post_comments').insert({
        post_id: post.id,
        author_id: AUTHOR_ID,
        body: commentText,
      })
    }

    // Add shares
    for (let s = 0; s < p.shares; s++) {
      await supabase.from('post_shares').insert({
        post_id: post.id,
        user_id: AUTHOR_ID,
        share_channel: 'link',
      })
    }

    // Add likes
    await supabase.from('post_reactions').insert({
      post_id: post.id,
      user_id: AUTHOR_ID,
      kind: 'like',
    })
  }

  console.log(`Successfully seeded ${insertedCount} cultural posts!`)
}

seed().catch(console.error)
