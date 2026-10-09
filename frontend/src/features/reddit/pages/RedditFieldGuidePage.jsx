import React from 'react'
import { RedditCulturalDispatches } from '../components/RedditCulturalDispatches'
import { RedditErrorBoundary } from '../components/RedditErrorBoundary'
import { Globe, Compass } from 'lucide-react'

export function RedditFieldGuidePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#FF4500] text-white flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Decentralized Community Archives
          </span>
          <span className="font-mono text-[10px] text-[var(--ink-2)] border border-[var(--line)] px-2 py-0.5 rounded flex items-center gap-1">
            <Compass className="h-3 w-3 text-[var(--clay)]" />
            Field Dispatches
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)]">
          Reddit Cultural Field Dispatches
        </h1>
        <p className="text-xs md:text-sm text-[var(--ink-2)] max-w-3xl leading-relaxed">
          Explore peer-reviewed historical debates, living folklore transmissions, and anthropological fieldwork discussions sourced from verified cultural subreddits worldwide.
        </p>
      </div>

      {/* Main Reddit Dispatches Feed wrapped in Error Boundary */}
      <RedditErrorBoundary>
        <RedditCulturalDispatches initialSubreddit="Folklore" />
      </RedditErrorBoundary>
    </div>
  )
}

export default RedditFieldGuidePage
