import React from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  Play,
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export const TRENDING_TOPICS = [
  {
    rank: 1,
    title: 'Festival Celebrations',
    count: '128 dispatches',
    thumbnail: '/photos/culture_28.jpeg',
    query: 'Festival',
  },
  {
    rank: 2,
    title: 'Sacred Architecture',
    count: '96 dispatches',
    thumbnail: '/photos/culture_05.jpeg',
    query: 'Architecture',
  },
  {
    rank: 3,
    title: 'Traditional Cuisine',
    count: '84 dispatches',
    thumbnail: '/photos/culture_30.jpeg',
    query: 'Cuisine',
  },
  {
    rank: 4,
    title: 'Folk Arts & Performance',
    count: '76 dispatches',
    thumbnail: '/photos/culture_27.jpeg',
    query: 'Dance',
  },
  {
    rank: 5,
    title: 'Rituals & Traditions',
    count: '63 dispatches',
    thumbnail: '/photos/culture_29.jpeg',
    query: 'Ritual',
  },
]

export const FEATURED_COLLECTIONS_DATA = [
  {
    id: 'sacred-sites',
    title: 'Sacred Sites',
    count: '24 dispatches',
    thumbnail: '/photos/culture_02.jpeg',
  },
  {
    id: 'harvest-festivals',
    title: 'Harvest Festivals',
    count: '18 dispatches',
    thumbnail: '/photos/culture_22.jpeg',
  },
  {
    id: 'culinary-journeys',
    title: 'Culinary Journeys',
    count: '32 dispatches',
    thumbnail: '/photos/culture_18.jpeg',
  },
]

export function ExploreSidebar({
  onSelectTopic,
  onOpenFeaturedStory,
  onOpenCollectionsTab,
}) {
  return (
    <aside className="w-full space-y-6">
      {/* ── Section A: Trending Topics ── */}
      <section className="bg-white rounded-2xl border border-[#E0D4C5]/80 p-5 neu-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0D4C5]/40">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#E65100]" />
            <h2 className="font-serif text-sm font-bold text-[#34252A]">Trending Topics</h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTopic && onSelectTopic('')}
            className="text-[11px] font-sans font-medium text-[#6A1F35] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-3">
          {TRENDING_TOPICS.map((topic) => (
            <button
              key={topic.rank}
              type="button"
              onClick={() => onSelectTopic && onSelectTopic(topic.query)}
              className="w-full flex items-center justify-between group text-left cursor-pointer hover:bg-[#F0E7DA]/30 p-1.5 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#75666B] w-3 text-center">
                  {topic.rank}
                </span>
                <img
                  src={topic.thumbnail}
                  alt={topic.title}
                  className="h-10 w-10 rounded-xl object-cover border border-[#E0D4C5]/60 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = '/photos/culture_01.jpeg'
                  }}
                />
                <div>
                  <h4 className="text-xs font-semibold text-[#34252A] group-hover:text-[#6A1F35] transition-colors line-clamp-1">
                    {topic.title}
                  </h4>
                  <p className="text-[11px] text-[#75666B] font-mono mt-0.5">
                    {topic.count}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Section B: Featured Visual Story ── */}
      <section className="bg-white rounded-2xl border border-[#E0D4C5]/80 p-5 neu-card space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0D4C5]/40">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-[#6A1F35] flex items-center justify-center text-white">
              <Play className="h-2.5 w-2.5 fill-current ml-0.2" />
            </div>
            <h2 className="font-serif text-sm font-bold text-[#34252A]">Featured Visual Story</h2>
          </div>
          <button
            type="button"
            onClick={onOpenFeaturedStory}
            className="text-[11px] font-sans font-medium text-[#6A1F35] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Big Media Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenFeaturedStory}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onOpenFeaturedStory && onOpenFeaturedStory()
          }}
          className="group block relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer shadow-xs"
        >
          <video
            src="/videos/India_Heritage_Clip_2_Culture_Festivals.mp4"
            poster="/photos/culture_24.jpeg"
            muted
            loop
            playsInline
            preload="metadata"
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => e.currentTarget.pause()}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Center Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-xs border border-white/50 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono font-medium px-1.5 py-0.5 rounded">
            0:58
          </div>
        </div>

        {/* Story Info */}
        <div className="space-y-1.5">
          <h3
            onClick={onOpenFeaturedStory}
            className="font-serif text-sm font-bold text-[#34252A] hover:text-[#6A1F35] transition-colors cursor-pointer"
          >
            Yi Peng Lantern Festival
          </h3>
          <p className="text-xs text-[#75666B] leading-relaxed">
            Thousands of lanterns light up the night sky in Chiang Mai, Thailand.
          </p>

          <div className="flex items-center gap-1.5 pt-1">
            <img
              src="https://api.dicebear.com/7.x/initials/svg?seed=Jeevan&backgroundColor=6A1F35&textColor=ffffff"
              alt="Jeevan Surya Jalli"
              className="h-5 w-5 rounded-full object-cover border border-[#E0D4C5]"
            />
            <span className="text-xs font-semibold text-[#34252A]">Jeevan Surya Jalli</span>
            <CheckCircle2 className="h-3 w-3 text-[#0284C7] fill-current" />
          </div>
        </div>

        {/* Engagement Footer */}
        <div className="pt-2 border-t border-[#E0D4C5]/40 flex items-center justify-between text-xs text-[#75666B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#6A1F35] font-semibold">
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span>1.2K</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>48</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard?.writeText(window.location.href)
              }}
              className="hover:text-[#6A1F35] transition-colors"
              title="Share story"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            className="hover:text-[#6A1F35] transition-colors"
            title="Save story"
          >
            <Bookmark className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* ── Section C: Featured Collections ── */}
      <section className="bg-white rounded-2xl border border-[#E0D4C5]/80 p-5 neu-card space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0D4C5]/40">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-[#6A1F35]" />
            <h2 className="font-serif text-sm font-bold text-[#34252A]">Featured Collections</h2>
          </div>
          <button
            type="button"
            onClick={onOpenCollectionsTab}
            className="text-[11px] font-sans font-medium text-[#6A1F35] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* 3 Horizontal/Compact Collection Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {FEATURED_COLLECTIONS_DATA.map((col) => (
            <Link
              key={col.id}
              to={`/collections/${col.id}`}
              className="group block space-y-1.5 text-center"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-[#F0E7DA] border border-[#E0D4C5]/60 shadow-xs">
                <img
                  src={col.thumbnail}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = '/photos/culture_01.jpeg'
                  }}
                />
              </div>
              <h4 className="text-[11px] font-semibold text-[#34252A] group-hover:text-[#6A1F35] transition-colors line-clamp-1 leading-tight">
                {col.title}
              </h4>
              <p className="text-[10px] text-[#75666B] font-mono leading-none">
                {col.count}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  )
}
