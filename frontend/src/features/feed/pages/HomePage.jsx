import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  ArrowRight,
  Calendar,
  Globe,
  Landmark,
  Shirt,
  Palette,
  ChevronRight,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreVertical,
} from 'lucide-react'
import { fetchAllFestivals } from '@/features/festivals/services/festivalService'
import { getFestivalImage } from '@/features/festivals/data/festivalImageManifest'
import { useAuth } from '@/features/auth/hooks/useAuth'
import BlurText from '@/components/BlurText'

const HERO_PHOTO_DEFAULT = "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1600&auto=format&fit=crop"
const HERO_PHOTO_LOCAL = "/images/hero-cultural-landscape.jpg"

// Specialized Cultural Category SVG Icons matching reference
function DanceIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M9 20l3-6 4 2 3-5" />
      <path d="M6 12l6-4 4 1 3 4" />
      <path d="M9 14l-3 6" />
    </svg>
  )
}

function FoodBowlIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11c0 5 3.5 8 8 8s8-3 8-8H4z" />
      <path d="M8 7v-2M12 7v-3M16 7v-2" />
      <path d="M3 11h18" />
    </svg>
  )
}

function SunburstIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function LotusIcon({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <path d="M12 21c4-3 7-7.5 7-12-2.5 1-5 4-7 8-2-4-4.5-7-7-8 0 4.5 3 9 7 12z" />
      <path d="M12 17c-1-2.5-1.5-6 0-9 1.5 3 1 6.5 0 9z" />
      <path d="M5 14c-2-1-3-3-3-5 2.5 0 5 1.5 6 3" />
      <path d="M19 14c2-1 3-3 3-5-2.5 0-5 1.5-6 3" />
    </svg>
  )
}

function BotanicalBranchWatermark({ className = "text-[#B08A50]/25" }) {
  return (
    <svg className={className} width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M120 70C90 55 60 48 30 52C15 54 5 45 0 35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M45 49C40 38 46 28 58 24C48 24 40 30 35 42" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <path d="M75 42C78 30 88 22 100 20C90 18 78 24 72 34" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

export function HomePage() {
  const { user } = useAuth()
  const [likedStories, setLikedStories] = useState({})
  const [savedStories, setSavedStories] = useState({})
  const [heroPhotoSrc, setHeroPhotoSrc] = useState(HERO_PHOTO_LOCAL)
  const [copyFeedback, setCopyFeedback] = useState(null)

  const handleShare = (story) => {
    const url = window.location.origin + `/explore?story=${story.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopyFeedback(story.id)
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  // Fetch real verified festivals from archive
  const { data: allFestivals = [] } = useQuery({
    queryKey: ['festivals_archive'],
    queryFn: fetchAllFestivals,
  })

  // Dynamic upcoming festivals computed from verified archive dates
  const upcomingFestivals = useMemo(() => {
    const fallbackList = [
      {
        id: 'f-spring-festival',
        month: 'FEB',
        day: '17',
        name: 'Chinese New Year (Spring Festival)',
        origin: 'China — Shang Dynasty (circa 1600–1046 BCE)',
        image: '/festivals/spring_festival.jpg',
        to: '/festivals',
      },
      {
        id: 'f-lantern-festival',
        month: 'MAR',
        day: '03',
        name: 'Lantern Festival',
        origin: 'China — Han Dynasty (206 BCE – 220 CE)',
        image: '/festivals/lantern_festival.jpg',
        to: '/festivals',
      },
      {
        id: 'f-qingming',
        month: 'APR',
        day: '05',
        name: 'Qingming Festival',
        origin: 'China — Tang Dynasty (618–907 CE)',
        image: '/festivals/qingming_festival.jpg',
        to: '/festivals',
      },
      {
        id: 'f-dragon-boat',
        month: 'JUN',
        day: '19',
        name: 'Dragon Boat Festival',
        origin: 'China — Warring States Period (475–221 BCE)',
        image: '/festivals/dragon_boat_festival.jpg',
        to: '/festivals',
      },
    ]

    if (!allFestivals || allFestivals.length === 0) {
      return fallbackList
    }

    const festivalImages = {
      'chinese-new-year-spring-festival': '/festivals/spring_festival.jpg',
      'lantern-festival-yuanxiao': '/festivals/lantern_festival.jpg',
      'qingming-festival': '/festivals/qingming_festival.jpg',
      'dragon-boat-festival-duanwu': '/festivals/dragon_boat_festival.jpg',
      'diwali-deepavali': '/festivals/diwali.jpg',
      'eid-al-fitr': '/festivals/eid_al_fitr.jpg',
      'dia-de-los-muertos': 'https://images.unsplash.com/photo-1572945759243-7f254e2d316e?q=80&w=300&auto=format&fit=crop',
      'nowruz': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=300&auto=format&fit=crop',
      'hanami': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=300&auto=format&fit=crop',
      'sukkot': '/festivals/sukkot.jpg',
      'navratri': '/festivals/navratri.jpg',
      'double-ninth-festival': '/festivals/double_ninth.jpg',
    }

    return allFestivals.slice(0, 4).map((f) => {
      const occ = f.occurrences?.find((o) => o.year === 2026) || f.occurrences?.[0]
      let monthStr = 'FEB'
      let dayStr = '17'
      if (occ?.startDate) {
        const d = new Date(occ.startDate)
        monthStr = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        dayStr = String(d.getDate()).padStart(2, '0')
      }
      return {
        id: f.id,
        month: monthStr,
        day: dayStr,
        name: f.name,
        origin: f.culturalOrigin || f.traditionType,
        image: festivalImages[f.slug] || getFestivalImage(f)?.assetPath || f.image || fallbackList[0].image,
        to: '/festivals',
      }
    })
  }, [allFestivals])

  // Category shortcuts configuration matching reference
  const categories = [
    { label: 'Cultures', icon: Globe, to: '/explore?kind=culture' },
    { label: 'Structures', icon: Landmark, to: '/explore?kind=place' },
    { label: 'Dance', customIcon: DanceIcon, to: '/explore?kind=art' },
    { label: 'Festivals', customIcon: SunburstIcon, to: '/festivals' },
    { label: 'Food', customIcon: FoodBowlIcon, to: '/explore?kind=food' },
    { label: 'Clothing', icon: Shirt, to: '/explore?kind=fashion' },
    { label: 'Art', icon: Palette, to: '/explore?kind=art' },
    { label: 'Rituals', customIcon: LotusIcon, to: '/explore?kind=heritage' },
  ]

  // Reference featured stories data
  const referenceStories = [
    {
      id: 'ref-1',
      title: 'Hanami – The Beauty of New Beginnings',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
      tags: ['Japan', 'Festival'],
      authorName: 'Aiko Tanaka',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120&auto=format&fit=crop',
      timeAgo: '2 days ago',
      likes: '1.2K',
      comments: '64',
    },
    {
      id: 'ref-2',
      title: 'The Lantern Festival',
      imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      tags: ['China', 'Tradition'],
      authorName: 'Li Wei',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
      timeAgo: '4 days ago',
      likes: '980',
      comments: '32',
    },
    {
      id: 'ref-3',
      title: 'Kuchipudi – A Living Tradition',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
      tags: ['India', 'Dance'],
      authorName: 'Priya Sharma',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
      timeAgo: '1 week ago',
      likes: '1.5K',
      comments: '48',
    },
    {
      id: 'ref-4',
      title: 'The Colosseum – A Story in Stone',
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop',
      tags: ['Italy', 'Structure'],
      authorName: 'Marco Rossi',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
      timeAgo: '1 week ago',
      likes: '1.1K',
      comments: '41',
    },
  ]

  // Featured community categories matching reference
  const communityCategories = [
    {
      id: 'collectives',
      name: 'Collectives',
      desc: 'Find and join cultural collectives',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop',
      to: '/communities',
    },
    {
      id: 'markets',
      name: 'Markets',
      desc: 'Discover unique cultural products',
      image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=300&auto=format&fit=crop',
      to: '/markets',
    },
    {
      id: 'passes',
      name: 'Passes',
      desc: 'Access events, experiences and more',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=300&auto=format&fit=crop',
      to: '/tickets',
    },
  ]

  const toggleStoryLike = (storyId) => {
    setLikedStories((prev) => ({ ...prev, [storyId]: !prev[storyId] }))
  }

  const toggleStorySave = (storyId) => {
    setSavedStories((prev) => ({ ...prev, [storyId]: !prev[storyId] }))
  }

  return (
    <div className="space-y-10">
      {/* 2-Column Master Layout: Left Main Column & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Hero Banner + Category Shortcuts + Stories */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Large Cultural Hero Banner */}
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-[#E0D4C5]/40 bg-[#34252A]">
            {/* Background Image: Cultural landscape panorama */}
            <div className="relative aspect-[16/10] sm:aspect-[2/1] lg:aspect-[2.3/1] min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] w-full flex flex-col justify-between p-6 sm:p-10 z-10">
              <img
                src={heroPhotoSrc}
                alt="Cultures Connect Us - Cultural landscape panorama"
                onError={() => setHeroPhotoSrc(HERO_PHOTO_DEFAULT)}
                className="absolute inset-0 w-full h-full object-cover object-[70%_30%] sm:object-center z-0 transition-opacity duration-300"
                loading="eager"
                fetchPriority="high"
              />

              {/* Sophisticated Dark Vignette Overlay for Crisp Legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0" />

              {/* Top Banner Content: Eyebrow & Title */}
              <div className="relative z-10 max-w-lg space-y-2 pt-2">
                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#B08A50] font-bold block">
                  DISCOVER
                </span>
                <BlurText
                  as="h1"
                  text="Cultures Connect Us"
                  delay={120}
                  animateBy="words"
                  direction="top"
                  className="font-serif text-[clamp(2.2rem,4.4vw,4.5rem)] text-white font-normal leading-[1.08] tracking-tight"
                />
                <p className="font-sans text-sm sm:text-base text-white/90 max-w-md pt-2 leading-relaxed font-normal">
                  Explore traditions, stories, and people from around the world.
                </p>

                {/* Primary CTA Button */}
                <div className="pt-4">
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 bg-[#6A1F35] hover:bg-[#511528] active:bg-[#511528] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95 group focus-visible:ring-2 focus-visible:ring-[#B08A50]"
                  >
                    <span>Start Exploring</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Bottom Row: Carousel Dots (Left) & Quotation (Right) */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-6">
                {/* 4 Carousel Dots */}
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#A96849]" />
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                </div>

                {/* Quotation text */}
                <div className="text-right sm:text-right w-full sm:w-auto">
                  <p className="font-serif italic text-white/90 text-sm md:text-base font-light">
                    “Different cultures, one human story.”
                  </p>
                  <div className="w-16 h-[1px] bg-white/40 ml-auto mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Culture Category Shortcuts (8 Circular Buttons) */}
          <section className="w-full">
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const IconComponent = cat.customIcon || cat.icon
                return (
                  <Link
                    key={cat.label}
                    to={cat.to}
                    className="flex flex-col items-center group shrink-0 focus:outline-none"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F0E7DA] hover:bg-[#E8DDD0] border border-[#E0D4C5]/80 flex items-center justify-center text-[#6A1F35] transition-all duration-200 group-hover:scale-105 neu-circle active:neu-inset group-focus:ring-2 group-focus:ring-[#6A1F35]">
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 transition-colors group-hover:text-[#511528]" />
                    </div>
                    <span className="font-sans text-xs font-medium text-[#34252A] mt-2 text-center group-hover:text-[#6A1F35] transition-colors">
                      {cat.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* 3. Featured Cultural Stories Section Header */}
          <section className="space-y-4">
            <div className="flex items-end justify-between border-b border-transparent pb-1">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#34252A] tracking-tight">
                  Featured Cultural Stories
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#75666B] mt-0.5">
                  Real people. Rich traditions. Global perspectives.
                </p>
              </div>
              <Link
                to="/explore"
                className="font-sans text-xs sm:text-sm font-semibold text-[#6A1F35] hover:text-[#511528] flex items-center gap-1 hover:underline transition-colors shrink-0"
              >
                <span>See All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 4-Card Image-First Grid Matching Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {referenceStories.map((story) => {
                const isStoryLiked = likedStories[story.id]
                const isStorySaved = savedStories[story.id]

                return (
                  <article
                    key={story.id}
                    className="bg-white rounded-2xl border border-[#E0D4C5]/70 overflow-hidden neu-card hover:translate-y-[-2px] transition-all flex flex-col group"
                  >
                    {/* Cultural Photograph with Tags & Save Button */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F0E7DA]">
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Floating Bookmark/Heart Button (Top Right) */}
                      <button
                        type="button"
                        onClick={() => toggleStorySave(story.id)}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                          isStorySaved
                            ? 'bg-[#6A1F35] text-white'
                            : 'bg-black/35 text-white hover:bg-black/55'
                        }`}
                        title="Save story"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            isStorySaved ? 'fill-white' : ''
                          }`}
                        />
                      </button>

                      {/* Overlaid Country & Category Pills (Bottom Left) */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        {story.tags.map((tag) => (
                          <Link
                            key={tag}
                            to="/explore"
                            className="bg-white/95 hover:bg-white backdrop-blur-sm text-[#34252A] hover:text-[#6A1F35] text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs transition-colors"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            to="/explore"
                            className="font-serif font-bold text-sm text-[#34252A] group-hover:text-[#6A1F35] transition-colors leading-snug line-clamp-2"
                          >
                            {story.title}
                          </Link>
                          <Link
                            to="/explore"
                            className="text-[#75666B] hover:text-[#34252A] p-0.5"
                            title="Story options"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Link>
                        </div>

                        {/* Author Info */}
                        <Link to="/explore" className="flex items-center gap-2 mt-2 group/author">
                          <img
                            src={story.authorAvatar}
                            alt={story.authorName}
                            className="h-6 w-6 rounded-full object-cover border border-[#E0D4C5]"
                          />
                          <div className="flex flex-col">
                            <span className="font-sans text-[11px] font-semibold text-[#34252A] group-hover/author:text-[#6A1F35] leading-none transition-colors">
                              {story.authorName}
                            </span>
                            <span className="font-sans text-[10px] text-[#75666B] leading-none mt-0.5">
                              {story.timeAgo}
                            </span>
                          </div>
                        </Link>
                      </div>

                      {/* Card Footer: Engagement Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E0D4C5]/40 text-[#75666B] text-[11px] relative">
                        <button
                          type="button"
                          onClick={() => toggleStoryLike(story.id)}
                          aria-label={`Like ${story.title}`}
                          className="flex items-center gap-1 hover:text-[#6A1F35] transition-colors p-1 -m-1 focus-visible:ring-1 focus-visible:ring-[#6A1F35] rounded"
                        >
                          <Heart
                            className={`h-3.5 w-3.5 text-[#6A1F35] ${
                              isStoryLiked ? 'fill-[#6A1F35]' : ''
                            }`}
                          />
                          <span>{isStoryLiked ? '1.3K' : story.likes}</span>
                        </button>

                        <Link
                          to="/explore"
                          aria-label={`View comments on ${story.title}`}
                          className="flex items-center gap-1 hover:text-[#6A1F35] transition-colors p-1 -m-1 focus-visible:ring-1 focus-visible:ring-[#6A1F35] rounded"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{story.comments}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleShare(story)}
                          aria-label={`Share ${story.title}`}
                          className="hover:text-[#6A1F35] transition-colors p-1 -m-1 focus-visible:ring-1 focus-visible:ring-[#6A1F35] rounded relative"
                          title="Share story"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          {copyFeedback === story.id && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#34252A] text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap z-20">
                              Copied!
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStorySave(story.id)}
                          aria-label={`Bookmark ${story.title}`}
                          className="hover:text-[#6A1F35] transition-colors p-1 -m-1 focus-visible:ring-1 focus-visible:ring-[#6A1F35] rounded"
                          title="Bookmark"
                        >
                          <Bookmark
                            className={`h-3.5 w-3.5 ${
                              isStorySaved ? 'fill-[#6A1F35] text-[#6A1F35]' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Upcoming Festivals + Featured Community + Global Community Banner */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Panel 1: Upcoming Festivals */}
          <div className="bg-white rounded-2xl border border-[#E0D4C5]/80 p-5 neu-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0D4C5]/40 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#6A1F35]" />
                <h3 className="font-serif text-base font-bold text-[#34252A]">
                  Upcoming Festivals
                </h3>
              </div>
              <Link
                to="/festivals"
                className="text-xs font-semibold text-[#6A1F35] hover:text-[#511528] flex items-center gap-1 hover:underline transition-colors"
              >
                <span>View Calendar</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* List of 4 Upcoming Festivals */}
            <div className="space-y-3">
              {upcomingFestivals.map((fest) => (
                <Link
                  key={fest.id}
                  to={fest.to}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#F0E7DA]/50 transition-colors group"
                >
                  {/* Left: Date Block + Image + Info */}
                  <div className="flex items-center gap-3">
                    <div className="text-center w-8 shrink-0">
                      <span className="font-sans text-[10px] font-bold text-[#75666B] uppercase block leading-tight">
                        {fest.month}
                      </span>
                      <span className="font-serif text-lg font-bold text-[#6A1F35] leading-tight block">
                        {fest.day}
                      </span>
                    </div>

                    <img
                      src={fest.image}
                      alt={fest.name}
                      className="w-14 h-11 rounded-lg object-cover border border-[#E0D4C5]/60 shrink-0"
                    />

                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#34252A] group-hover:text-[#6A1F35] transition-colors leading-snug">
                        {fest.name}
                      </h4>
                      <p className="font-sans text-xs text-[#75666B]">
                        {fest.origin}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#75666B] group-hover:text-[#6A1F35] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Panel 2: Featured Community */}
          <div className="bg-white rounded-2xl border border-[#E0D4C5]/80 p-5 neu-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0D4C5]/40 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#6A1F35]" />
                <h3 className="font-serif text-base font-bold text-[#34252A]">
                  Featured Community
                </h3>
              </div>
              <Link
                to="/communities"
                className="text-xs font-semibold text-[#6A1F35] hover:text-[#511528] flex items-center gap-1 hover:underline transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* List of 3 Featured Community Links */}
            <div className="space-y-3">
              {communityCategories.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#F0E7DA]/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-11 rounded-lg object-cover border border-[#E0D4C5]/60 shrink-0"
                    />

                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#34252A] group-hover:text-[#6A1F35] transition-colors leading-snug">
                        {item.name}
                      </h4>
                      <p className="font-sans text-xs text-[#75666B] line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#75666B] group-hover:text-[#6A1F35] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Panel 3: Global Community Promotional Banner */}
          <div className="relative rounded-2xl overflow-hidden neu-card border border-[#E0D4C5]/60 min-h-[220px] flex flex-col justify-between p-6 bg-[#34252A]">
            <img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop"
              alt="A Global Community"
              className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-80"
            />
            {/* Dark warm gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 z-0" />

            {/* Decorative Botanical Branch Watermark in bottom right */}
            <div className="absolute right-0 bottom-0 pointer-events-none z-10">
              <BotanicalBranchWatermark />
            </div>

            <div className="relative z-10 space-y-1">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#B08A50] font-bold block">
                BECOME A PART OF
              </span>
              <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                A Global Community
              </h3>
              <p className="font-sans text-xs text-white/85 pt-1 max-w-[220px]">
                Share, learn and celebrate cultures together.
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <Link
                to={user ? '/communities' : '/login'}
                className="inline-flex items-center gap-1.5 bg-[#6A1F35] hover:bg-[#511528] text-white px-5 py-2.5 rounded-full text-xs font-medium transition-all shadow-md group"
              >
                <span>Join Hailey</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

