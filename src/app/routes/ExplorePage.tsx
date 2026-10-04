import { useState } from 'react'
import { Search, Hash } from 'lucide-react'

// Sample tag previews for Day 1 placeholder
const SAMPLE_KINDS = [
  { kind: 'Region & Heritage', tags: ['African American', 'Japanese', 'Latino', 'Korean', 'South Asian', 'Nordic'] },
  { kind: 'Music & Sound', tags: ['Hip-Hop', 'City Pop', 'Afrobeats', 'Jazz', 'Baile Funk', 'Shoegaze'] },
  { kind: 'Style & Artifacts', tags: ['Streetwear', 'Harajuku', 'Workwear', 'Textiles', 'Ceramics'] },
  { kind: 'Culinary Traditions', tags: ['Street Food', 'Fermentation', 'Coffee Culture', 'Tea Ceremony'] },
]

export function ExplorePage() {
  const [filter, setFilter] = useState('')

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--line)] pb-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--ink)]">
          Explore Taxonomy
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          Browse cultural threads across regions, genres, styles, and traditions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-2)]" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter topics (e.g. Streetwear, Hip-Hop, Tokyo)..."
          className="w-full border border-[var(--ink)] bg-[var(--paper-2)] pl-9 pr-4 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAMPLE_KINDS.map((group) => {
          const filteredTags = group.tags.filter((t) =>
            t.toLowerCase().includes(filter.toLowerCase())
          )
          if (filteredTags.length === 0) return null

          return (
            <div key={group.kind} className="border border-[var(--line)] bg-[var(--paper-2)] p-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--clay)] font-bold mb-3">
                {group.kind}
              </h2>
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 text-xs text-[var(--ink)] hover:border-[var(--ink)] hover:text-[var(--clay)] cursor-pointer transition-colors"
                  >
                    <Hash className="h-3 w-3 text-[var(--ink-2)]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
