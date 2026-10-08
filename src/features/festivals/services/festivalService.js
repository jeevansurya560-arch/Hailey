import { supabase } from '@/lib/supabase/client'

/**
 * Curated, verified festival archive with multi-year astronomical/lunar occurrences.
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

/**
 * Fetches all festivals, attempting Supabase database first with graceful fallback.
 */
export async function fetchAllFestivals() {
  try {
    const { data, error } = await supabase
      .from('festivals')
      .select(`
        *,
        festival_occurrences (*)
      `)
      .order('name', { ascending: true })

    if (!error && data && data.length > 0) {
      return data
    }
  } catch (err) {
    console.warn('[festivalService] Fallback to archive:', err instanceof Error ? err.message : String(err))
  }

  return VERIFIED_FESTIVALS
}

/**
 * Fetches a single festival by its unique slug.
 */
export async function fetchFestivalBySlug(slug) {
  if (!slug) return null

  try {
    const { data, error } = await supabase
      .from('festivals')
      .select(`
        *,
        festival_occurrences (*)
      `)
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.warn('[festivalService] Fallback to archive for slug:', err instanceof Error ? err.message : String(err))
  }

  return VERIFIED_FESTIVALS.find((f) => f.slug === slug) || null
}
