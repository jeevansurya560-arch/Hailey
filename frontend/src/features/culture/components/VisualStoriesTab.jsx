import React, { useState } from 'react'
import { Play, Sparkles, MapPin, Heart, MessageCircle } from 'lucide-react'
import { VisualStoryViewer } from './VisualStoryViewer'

export const VISUAL_STORIES_DATA = [
  {
    id: 'story-1',
    title: 'Yi Peng Lantern Festival',
    description: 'Thousands of paper lanterns released into the Chiang Mai night sky.',
    category: 'Festivals',
    creator: 'Jeevan Surya Jalli',
    location: 'Chiang Mai, Thailand',
    duration: '0:58',
    thumbnail: '/photos/culture_24.jpeg',
    video_url: '/videos/India_Heritage_Clip_2_Culture_Festivals.mp4',
    is_video: true,
    likes: 1240,
    comments: 48,
    timeAgo: '1d ago',
  },
  {
    id: 'story-2',
    title: 'Sheikh Zayed Grand Mosque Lighting',
    description: 'Lunar illumination system reflecting moon phases across white marble domes.',
    category: 'Sacred Architecture',
    creator: 'Dr. Karim Hassan',
    location: 'Abu Dhabi, UAE',
    duration: '0:58',
    thumbnail: '/photos/culture_32.jpeg',
    video_url: '/videos/Islamic_Culture_Clip_1_Mosque_Architecture.mp4',
    is_video: true,
    likes: 840,
    comments: 28,
    timeAgo: '3d ago',
  },
  {
    id: 'story-3',
    title: 'Onam Sadhya Preparation',
    description: 'Traditional 26-dish vegetarian feast arranged meticulously on plantain leaves.',
    category: 'Cuisine',
    creator: 'Ananya Rao',
    location: 'Kerala, India',
    duration: '1:12',
    thumbnail: '/photos/culture_30.jpeg',
    video_url: '/videos/India_Heritage_Clip_4_Nature_and_Living_Heritage.mp4',
    is_video: true,
    likes: 670,
    comments: 18,
    timeAgo: '4d ago',
  },
  {
    id: 'story-4',
    title: 'Sacred Mahastupa & Monastic Heritage',
    description: 'Ancient Buddhist stupas and cosmic stone gateways in high-relief sandstone.',
    category: 'Sacred Architecture',
    creator: 'Jeevan Surya Jalli',
    location: 'Telangana & Sanchi, India',
    duration: '0:46',
    thumbnail: '/photos/culture_02.jpeg',
    video_url: '/videos/Buddhavanam_Clip_1_Stupa_and_Monastery.mp4',
    is_video: true,
    likes: 910,
    comments: 32,
    timeAgo: '5d ago',
  },
  {
    id: 'story-5',
    title: 'Sacred River Traditions & Ghats',
    description: 'Living heritage ceremonies, dawn prayers, and ancestral music along the sacred riverbanks.',
    category: 'Living Heritage',
    creator: 'Priya Mehta',
    location: 'Varanasi, India',
    duration: '1:24',
    thumbnail: '/photos/culture_27.jpeg',
    video_url: '/videos/India_Heritage_Clip_3_Traditions_Scenery.mp4',
    is_video: true,
    likes: 530,
    comments: 21,
    timeAgo: '1w ago',
  },
  {
    id: 'story-6',
    title: 'Egyptian Tanoura & Sacred Dervish Spinning',
    description: 'Liturgical Sufi meditation and geometric spinning with multi-layered heavy skirts.',
    category: 'Rituals',
    creator: 'Dr. Karim Hassan',
    location: 'Cairo, Egypt',
    duration: '1:05',
    thumbnail: '/photos/culture_29.jpeg',
    video_url: '/videos/Islamic_Culture_Clip_2_Prayer_and_Heritage.mp4',
    is_video: true,
    likes: 480,
    comments: 14,
    timeAgo: '1w ago',
  },
]

export function VisualStoriesTab({ onOpenStory, selectedStoryIndex, setSelectedStoryIndex }) {
  const [activeStoryIdx, setActiveStoryIdx] = useState(null)

  const currentIdx = selectedStoryIndex !== undefined ? selectedStoryIndex : activeStoryIdx
  const setIdx = setSelectedStoryIndex || setActiveStoryIdx

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {VISUAL_STORIES_DATA.map((story, idx) => (
          <div
            key={story.id}
            onClick={() => setIdx(idx)}
            className="group relative aspect-[9/14] bg-[#1A1215] rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all border border-[#E0D4C5]/80 flex flex-col justify-between p-4"
          >
            {/* Background Video with Poster Fallback */}
            {story.video_url ? (
              <video
                src={story.video_url}
                poster={story.thumbnail}
                muted
                loop
                playsInline
                preload="metadata"
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => e.currentTarget.pause()}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
              />
            ) : (
              <img
                src={story.thumbnail}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/photos/culture_01.jpeg'
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50 pointer-events-none" />

            {/* Top Category Badge & Duration */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="bg-white/90 backdrop-blur-xs text-[#6A1F35] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#E0D4C5]/70 flex items-center gap-1 shadow-xs">
                <Sparkles className="h-2.5 w-2.5 text-[#B08A50]" />
                {story.category}
              </span>
              <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20">
                {story.duration}
              </span>
            </div>

            {/* Center Play Icon */}
            <div className="relative z-10 self-center h-12 w-12 rounded-full bg-black/50 border border-white/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>

            {/* Bottom Info */}
            <div className="relative z-10 space-y-1.5">
              <h3 className="font-serif text-sm font-bold text-white group-hover:text-[#F0E7DA] transition-colors line-clamp-1">
                {story.title}
              </h3>
              <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                {story.description}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-white/15 text-[10px] text-white/70">
                <span className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-[#B08A50]" />
                  {story.location}
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Heart className="h-2.5 w-2.5 fill-current text-[#E65100]" />
                    {story.likes}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {currentIdx !== null && (
        <VisualStoryViewer
          posts={VISUAL_STORIES_DATA}
          initialPostId={VISUAL_STORIES_DATA[currentIdx].id}
          onClose={() => setIdx(null)}
        />
      )}
    </div>
  )
}
