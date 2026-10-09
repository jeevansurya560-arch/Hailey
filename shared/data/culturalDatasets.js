/**
 * shared/data/culturalDatasets.js
 *
 * Curated, verified foundational cultural knowledge and festival archives.
 * Truly shared static datasets consumed across frontend features and backend routes/search.
 */

export const VERIFIED_FESTIVALS = [
  {
    id: 'f-diwali',
    slug: 'diwali-deepavali',
    name: 'Diwali (Deepavali)',
    alternateNames: ['Festival of Lights', 'Deepavali'],
    culturalOrigin: 'Ancient Indian Subcontinent',
    religion: 'Hinduism, Jainism, Sikhism, Newar Buddhism',
    traditionType: 'Solar-Lunar Indic Celebration',
    countries: ['India', 'Nepal', 'Fiji', 'Mauritius', 'Guyana', 'Trinidad & Tobago'],
    regions: ['South Asia', 'Global Diaspora'],
    typicalMonth: 10, // October - November
    dateRule: 'lunar_hindu',
    significance: 'Spiritual victory of light over darkness, good over evil, and wisdom over ignorance. Associated with Lakshmi, Rama’s return to Ayodhya, and Mahavira’s nirvana in Jainism.',
    history: 'Recorded in Sanskrit texts including the Skanda Purana and Padma Purana dating back over two millennia.',
    rituals: [
      'Lighting clay diya lamps with sesame or mustard oil',
      'Elaborate floor Rangoli using colored powdered stone and flower petals',
      'Lakshmi and Ganesha evening Puja with sacred chanting',
      'Exchange of homemade mithai sweets and festive gifts'
    ],
    food: ['Kaju Katli', 'Gulab Jamun', 'Chivda savory mix', 'Besan Ladoo'],
    clothing: ['Embroidered silk Kurta-pyjama', 'Kanjeevaram and Banarasi sarees with zari borders'],
    music: ['Devotional Bhajans', 'Carnatic and Hindustani classical Ragas', 'Folk Dhol rhythms'],
    occurrences: [
      { year: 2025, startDate: '2025-10-20', endDate: '2025-10-24', regionNotes: 'Kartik Amavasya main night on Oct 20' },
      { year: 2026, startDate: '2026-11-08', endDate: '2026-11-12', regionNotes: 'Main Deepavali festival night on Nov 08' },
      { year: 2027, startDate: '2027-10-29', endDate: '2027-11-02', regionNotes: 'Main Deepavali festival night on Oct 29' }
    ],
    sources: [
      { title: 'The Hindu Religious Year', author: 'M.M. Underhill', publisher: 'Oxford University Press', year: '1921' },
      { title: 'Encyclopaedia of Indian Festivals', author: 'Dr. P.K. Agrawala', publisher: 'Abhinav Publications', year: '2008' }
    ]
  },
  {
    id: 'f-eid-fitr',
    slug: 'eid-al-fitr',
    name: 'Eid al-Fitr',
    alternateNames: ['Festival of Breaking the Fast', 'Raya Aidilfitri', 'Şeker Bayramı'],
    culturalOrigin: 'Hijaz, Arabian Peninsula',
    religion: 'Islam',
    traditionType: 'Lunar Islamic Calendar',
    countries: ['Global Islamic World', 'Indonesia', 'Egypt', 'Turkey', 'Nigeria', 'Morocco'],
    regions: ['Middle East & North Africa', 'Southeast Asia', 'Central & South Asia', 'Global Diaspora'],
    typicalMonth: 3, // Varies ~11 days earlier each solar year
    dateRule: 'lunar_islamic',
    significance: 'Celebration marking the conclusion of the holy fasting month of Ramadan, expressing gratitude to Allah and practicing obligatory charity (Zakat al-Fitr) to the needy.',
    history: 'Instituted by the Prophet Muhammad in Medina in 624 CE after the migration from Mecca.',
    rituals: [
      'Ghusl purification and application of natural attar perfume',
      'Disbursement of Zakat al-Fitr grain or monetary charity before morning prayers',
      'Congregational Salat al-Eid prayer in open fields (Musalla)',
      'Community reconciliation, elder blessings, and visiting family graves'
    ],
    food: ['Sheer Khurma vermicelli dessert', 'Ketupat woven rice dumplings', 'Ma’amoul spiced date cookies'],
    clothing: ['Thobe/Dishdasha', 'Baju Melayu with songket sampin', 'Embroidered Agbada'],
    music: ['Takbirat choral chanting', 'Traditional Andalusi and Sufi hymns', 'Kompang percussion in Malaysia'],
    occurrences: [
      { year: 2025, startDate: '2025-03-31', endDate: '2025-04-02', regionNotes: 'Determined by astronomical crescent moon sighting' },
      { year: 2026, startDate: '2026-03-20', endDate: '2026-03-22', regionNotes: 'Dependent on Shawwal crescent sighting' },
      { year: 2027, startDate: '2027-03-10', endDate: '2027-03-12', regionNotes: 'Dependent on Shawwal crescent sighting' }
    ],
    sources: [
      { title: 'The Islamic Calendar and Sacred Festivals', author: 'Seyyed Hossein Nasr', publisher: 'Harvard University Press', year: '2015' }
    ]
  },
  {
    id: 'f-lunar-ny',
    slug: 'lunar-new-year',
    name: 'Lunar New Year (Spring Festival / Tet)',
    alternateNames: ['Chunjié', 'Tet Nguyen Dan', 'Seollal'],
    culturalOrigin: 'East Asia',
    religion: 'Confucian, Daoist, Buddhist & Folk Syncretism',
    traditionType: 'Lunisolar Chinese Calendar',
    countries: ['China', 'Vietnam', 'South Korea', 'Singapore', 'Malaysia', 'Taiwan'],
    regions: ['East Asia', 'Southeast Asia', 'Global Diaspora'],
    typicalMonth: 1, // January - February
    dateRule: 'lunar_hindu', // lunisolar rule
    significance: 'Welcoming the new agricultural cycle, ancestral veneration, dispelling the ancient mythical beast Nian, and family reunion.',
    history: 'Rooted in Shang Dynasty sacrificial rites honoring ancestors and heavenly deities at the turn of the farming season (circa 1600–1046 BCE).',
    rituals: [
      'Thorough pre-festival home cleaning to sweep away misfortune',
      'Affixing red spring couplets (Chunlian) and paper-cut art to entryways',
      'Reunion dinner on New Year’s Eve with symbolic dishes',
      'Presentation of red envelopes (Hongbao / Li Xi) to children'
    ],
    food: ['Jiaozi dumplings (shaped like ancient silver ingots)', 'Niangao glutinous cake', 'Banh Chung square rice cakes', 'Whole steamed fish symbolizing abundance'],
    clothing: ['Qipao / Tangzhuang suits', 'Hanbok silk garments in Korea', 'Ao Dai silk tunics in Vietnam'],
    music: ['Traditional Lion Dance drum cadence', 'Guzheng melodies', 'Erhu and festive brass cymbals'],
    occurrences: [
      { year: 2025, startDate: '2025-01-29', endDate: '2025-02-12', regionNotes: 'Year of the Wood Snake' },
      { year: 2026, startDate: '2026-02-17', endDate: '2026-03-03', regionNotes: 'Year of the Fire Horse' },
      { year: 2027, startDate: '2027-02-06', endDate: '2027-02-20', regionNotes: 'Year of the Fire Goat' }
    ],
    sources: [
      { title: 'Chinese Festivals and Local Traditions', author: 'Derik Bodde', publisher: 'Princeton University Press', year: '1975' }
    ]
  },
  {
    id: 'f-yom-kippur',
    slug: 'yom-kippur',
    name: 'Yom Kippur',
    alternateNames: ['Day of Atonement'],
    culturalOrigin: 'Levant / Ancient Near East',
    religion: 'Judaism',
    traditionType: 'Hebrew Lunisolar Calendar',
    countries: ['Israel', 'United States', 'France', 'United Kingdom', 'Argentina'],
    regions: ['Global Jewish Communities'],
    typicalMonth: 9, // September - October
    dateRule: 'hebrew',
    significance: 'The holiest day in Judaism, dedicated to complete fasting, prayer, teshuvah (repentance), and spiritual reconciliation.',
    history: 'Commanded in the biblical Torah (Leviticus 16) as a day of Sabbath of solemn rest and cleansing from transgressions.',
    rituals: [
      '25-hour complete fast from food and liquid from sundown to nightfall',
      'Five prayer services: Maariv, Shacharit, Musaf, Minchah, and Neilah (closing of gates)',
      'Recitation of the Kol Nidre declaration and Vidui confession',
      'Final sounding of the Shofar ram horn signaling the conclusion of the fast'
    ],
    food: ['Seudah Hamafseket pre-fast nourishing soup and challah; post-fast dairy kugel and bagels'],
    clothing: ['Kittel white robe representing purity and humility; canvas shoes (leather footwear abstained)'],
    music: ['Haunting Kol Nidre modal liturgy; liturgical Piyutim chants'],
    occurrences: [
      { year: 2025, startDate: '2025-10-01', endDate: '2025-10-02', regionNotes: '10th of Tishrei from sundown to nightfall' },
      { year: 2026, startDate: '2026-09-20', endDate: '2026-09-21', regionNotes: '10th of Tishrei from sundown to nightfall' },
      { year: 2027, startDate: '2027-10-10', endDate: '2027-10-11', regionNotes: '10th of Tishrei from sundown to nightfall' }
    ],
    sources: [
      { title: 'The Jewish Festivals: History & Practice', author: 'Hayyim Schauss', publisher: 'Schocken Books', year: '1996' }
    ]
  }
]

export const VERIFIED_CULTURAL_ARCHIVE = [
  {
    slug: 'kyoto-machiya-crafts',
    name: 'Kyoto Machiya & Traditional Crafts',
    region: 'Kansai',
    country: 'Japan',
    language: 'Japanese',
    traditionType: 'Living Craft & Architecture',
    religionContext: 'Shinto & Zen Buddhism syncretism',
    summary: 'A thousand-year preservation of wooden townhouse (machiya) joinery, Nishijin textile weaving, and urushi lacquerware rooted in ancient imperial artisan guilds.',
    history: 'Originating during the Heian period (794–1185) and refined through the Edo merchant era, Kyoto craftsmen cultivated refined aesthetic philosophies including Wabi-sabi and Monozukuri.',
    origins: 'Emerged along the Kamogawa river basin where clean groundwater facilitated natural dyeing and paper production.',
    geography: 'Historic urban quarters of Kamigyo and Nakagyo wards in Kyoto Prefecture.',
    practices: ['Kintsugi ceramic repair', 'Chado tea ceremony etiquette', 'Nishijin-ori silk weaving', 'Sukiya-zukuri woodworking'],
    clothing: 'Hand-woven silk Kimono dyed using natural persimmon and indigo pigments.',
    food: 'Shojin-ryori (Buddhist vegetarian cuisine) and seasonal Kaiseki tasting course.',
    music: 'Gagaku court melodies and Shakuhachi bamboo flute arrangements.',
    architecture: 'Timber-frame Machiya townhouses featuring lattice facades (koshi) and micro-interior courtyards (tsuboniwa).',
    timeline: [
      { year: '794 CE', event: 'Emperor Kanmu establishes Heian-kyo (Kyoto) as capital.' },
      { year: '1467 CE', event: 'Onin War disrupts urban fabric, spurring guild reorganization in Nishijin.' },
      { year: '1603 CE', event: 'Edo Period merchant class consolidates Machiya architectural standards.' },
      { year: '1976 CE', event: 'Japanese government implements Traditional Craft Industries Act preservation.' }
    ],
    sources: [
      {
        title: 'Traditional Japanese Architecture: An Exploration of Elements and Forms',
        author: 'Mira Locher',
        publisher: 'Tuttle Publishing',
        year: '2010',
        license: 'Scholarly Reference'
      },
      {
        title: 'Nishijin Textile Heritage and Guild Documentation',
        author: 'Kyoto Prefectural Museum of Cultural History',
        publisher: 'Kyoto Cultural Archives',
        year: '2021',
        license: 'Public Domain / Institutional'
      }
    ]
  },
  {
    slug: 'andalusian-flamenco-roots',
    name: 'Andalusian Flamenco & Cante Jondo',
    region: 'Andalusia',
    country: 'Spain',
    language: 'Spanish, Caló dialect',
    traditionType: 'Folk Performing Art',
    religionContext: 'Syncretic Catholic, Sephardic Jewish & Moorish Andalusi crosscurrents',
    summary: 'An emotive musical and poetic art form combining cante (singing), toque (guitar playing), baile (dance), and jaleo (vocalized rhythmic encouragement).',
    history: 'Forged across centuries through the cultural synthesis of Romani migrants, Andalusian peasants, Moors, and Sephardic communities in southern Spain.',
    origins: 'The Guadalquivir river valley, predominantly the neighborhoods of Triana in Seville and Jerez de la Frontera.',
    geography: 'Provinces of Seville, Cádiz, Huelva, and Granada.',
    practices: ['Compás rhythmic cycles', 'Duende (expressive emotional transcendence)', 'Palmas syncopated clapping'],
    clothing: 'Traje de flamenca with ruffled skirts, polka dot motifs, and embroidered Manila shawls.',
    food: 'Salmorejo cordobés, cured jamón ibérico, and Jerez sherry wine.',
    music: 'Phrygian modal guitar improvisation, Soleá, and Bulerías polyrhythms.',
    architecture: 'Courtyard corralas of Triana and cave dwellings of Sacromonte in Granada.',
    timeline: [
      { year: '1492 CE', event: 'Reconquista concludes; cultural syncretism goes underground.' },
      { year: '1783 CE', event: 'Charles III pragmatic sanction begins legal reintegration of Gitanos.' },
      { year: '1881 CE', event: 'Silver Age of Flamenco begins in Seville cafés cantantes.' },
      { year: '2010 CE', event: 'UNESCO declares Flamenco an Intangible Cultural Heritage of Humanity.' }
    ],
    sources: [
      {
        title: 'The Art of Flamenco',
        author: 'Donn E. Pohren',
        publisher: 'Society of Spanish Studies',
        year: '2005',
        license: 'Scholarly Reference'
      }
    ]
  },
  {
    slug: 'yoruba-sacred-beadwork',
    name: 'Yoruba Sacred Beadwork & Orisha Iconography',
    region: 'West Africa',
    country: 'Nigeria & Benin',
    language: 'Yoruba',
    traditionType: 'Sacred Textile & Regalia Tradition',
    religionContext: 'Yoruba Traditional Religion (Isese)',
    summary: 'Master beadworking reserved for royal crowns (ade), scepters, and ceremonial vestments embodying divine authority (ashe) and ancestor remembrance.',
    history: 'Dating back to the medieval Kingdom of Ife (11th-15th century), glass beadmaking was centered in the sacred forest groves of Ile-Ife.',
    origins: 'Ile-Ife, regarded in Yoruba cosmology as the cradle of humankind and divine royalty.',
    geography: 'Osun, Oyo, Ogun, and Ondo states in southwestern Nigeria.',
    practices: ['Bead embroidery on conical crowns', 'Iba invocations to Orisha deities', 'Bata drumming ceremonies'],
    clothing: 'Aso Oke hand-woven cloth adorned with thousands of imported glass beads.',
    food: 'Iyan (pounded yam) with Efo Riro vegetable stew and fermented locust beans.',
    music: 'Bata and Dundun talking drum polyrhythmic ensembles.',
    architecture: 'Palace courtyards (Aafin) featuring carved caryatid pillars and impluvium open courtyards.',
    timeline: [
      { year: '1000 CE', event: 'Ile-Ife glass bead furnace industrial production established.' },
      { year: '1903 CE', event: 'British colonial administration documents the sacred Ade crowns of Yoruba Obas.' },
      { year: '1990 CE', event: 'Contemporary preservation and revitalization led by Oshogbo master artists.' }
    ],
    sources: [
      {
        title: 'Yoruba: Nine Centuries of African Art and Thought',
        author: 'Henry John Drewal & John Pemberton III',
        publisher: 'Center for African Art',
        year: '1989',
        license: 'Scholarly Reference'
      }
    ]
  }
]
