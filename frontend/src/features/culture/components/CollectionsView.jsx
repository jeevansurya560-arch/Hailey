import React from 'react'
import { Link } from 'react-router-dom'
import { Layers, ArrowRight, Sparkles } from 'lucide-react'

export const CULTURAL_COLLECTIONS_CATALOG = [
  {
    id: 'sacred-sites',
    title: 'Sacred Sites & Living Architecture',
    description: 'Cathedrals, stupas, rock sanctuaries, and mosques preserving ancestral geometry and devotion.',
    count: '24 dispatches',
    cover: '/photos/culture_02.jpeg',
    category: 'Architecture',
  },
  {
    id: 'harvest-festivals',
    title: 'Harvest Festivals & Seasonal Equinoxes',
    description: 'Celebrations of agricultural bounty, lunar cycles, and thanksgiving across world cultures.',
    count: '18 dispatches',
    cover: '/photos/culture_22.jpeg',
    category: 'Festivals',
  },
  {
    id: 'culinary-journeys',
    title: 'Culinary Journeys & Living Feasts',
    description: 'Ancient fermentation, sacred ceremonial banquets, and heritage spices passed across generations.',
    count: '32 dispatches',
    cover: '/photos/culture_18.jpeg',
    category: 'Cuisine',
  },
  {
    id: 'folk-arts-performance',
    title: 'Folk Arts & Ritual Performance',
    description: 'Traditional masked dramas, sacred dances, and classical oral storytelling traditions.',
    count: '29 dispatches',
    cover: '/photos/culture_04.jpeg',
    category: 'Performing Arts',
  },
  {
    id: 'festival-celebrations',
    title: 'Festival Pageantry & Sacred Processions',
    description: 'Colossal papier-mâché floats, lantern processions, and seasonal carnival masquerades.',
    count: '41 dispatches',
    cover: '/photos/culture_31.jpeg',
    category: 'Festivals',
  },
  {
    id: 'nature-heritage',
    title: 'Nature & Sacred Landscapes',
    description: 'Mount Fuji, sacred groves, monsoon pilgrimages, and botanical veneration traditions.',
    count: '22 dispatches',
    cover: '/photos/culture_25.jpeg',
    category: 'Heritage',
  },
  {
    id: 'craft-traditions',
    title: 'Ancestral Craft Traditions',
    description: 'Handwoven textiles, indigo vats, woodblock printing, and master ceramic kilns.',
    count: '27 dispatches',
    cover: '/photos/culture_16.jpeg',
    category: 'Crafts',
  },
  {
    id: 'rituals-traditions',
    title: 'Spiritual Rituals & Living Devotions',
    description: 'Temple ceremonies, sacred fire rituals, and philosophical observances worldwide.',
    count: '35 dispatches',
    cover: '/photos/culture_29.jpeg',
    category: 'Rituals',
  },
]

export function CollectionsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CULTURAL_COLLECTIONS_CATALOG.map((col) => (
          <Link
            key={col.id}
            to={`/collections/${col.id}`}
            className="group bg-white rounded-2xl border border-[#E0D4C5]/80 overflow-hidden neu-card flex flex-col justify-between hover:border-[#6A1F35] transition-all"
          >
            {/* Cover Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#F0E7DA]">
              <img
                src={col.cover}
                alt={col.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/photos/culture_01.jpeg'
                }}
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#6A1F35] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#E0D4C5]/60 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-[#B08A50]" />
                <span>{col.category}</span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20">
                {col.count}
              </div>
            </div>

            {/* Collection Details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#34252A] group-hover:text-[#6A1F35] transition-colors leading-snug">
                  {col.title}
                </h3>
                <p className="text-xs text-[#75666B] mt-1 leading-relaxed line-clamp-2">
                  {col.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E0D4C5]/40 flex items-center justify-between text-xs font-medium text-[#6A1F35]">
                <span>View Collection Archive</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
