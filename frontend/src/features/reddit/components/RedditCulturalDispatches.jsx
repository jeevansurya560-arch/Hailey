import React, { useState } from 'react'
import {
  MessageSquare,
  ArrowUp,
  ExternalLink,
  Search,
  Loader2,
  AlertCircle,
  Share2,
  Check,
  Globe,
  Sparkles,
  Info,
} from 'lucide-react'
import { useRedditDispatches } from '../hooks/useRedditDispatches'
import { CURATED_CULTURAL_SUBREDDITS } from '../services/redditService'

export function RedditCulturalDispatches({
  initialSubreddit = 'Folklore',
  defaultQuery = '',
  culturalTopic = '',
}) {
  const [selectedSubreddit, setSelectedSubreddit] = useState(initialSubreddit)
  const [searchQuery, setSearchQuery] = useState(defaultQuery)
  const [activeQuery, setActiveQuery] = useState(defaultQuery)
  const [sortOrder, setSortOrder] = useState('hot')
  const [copiedId, setCopiedId] = useState(null)

  const { data, isLoading, error, refetch } = useRedditDispatches({
    subreddit: selectedSubreddit,
    query: activeQuery,
    sort: sortOrder,
  })

  const posts = data?.posts || []
  const isFallback = Boolean(data?.isFallback)
  const noticeError = data?.error || (error instanceof Error ? error.message : null)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setActiveQuery(searchQuery.trim())
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setActiveQuery('')
  }

  const handleCopyCitation = (post) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${post.title} — ${post.permalink}`)
      setCopiedId(post.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-5 md:p-6 shadow-[var(--shadow-hard)] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#FF4500] text-white flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Reddit Field Dispatches
              </span>
              <span className="font-mono text-[10px] text-[var(--ink-2)] border border-[var(--line)] px-2 py-0.5 rounded">
                Living Community Citations
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink)]">
              {culturalTopic
                ? `Field Inquiries & Discussions on ${culturalTopic}`
                : 'Living Folklore & Anthropological Archives'}
            </h2>
            <p className="text-xs text-[var(--ink-2)] max-w-2xl leading-relaxed">
              Discover primary anthropological field notes, living oral folklore, and peer-reviewed
              historical threads curated directly from verified cultural communities across Reddit.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="self-start md:self-auto border border-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper-2)] transition-all flex items-center gap-1.5"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[var(--clay)]" />}
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Curated Subreddit Pills */}
        <div className="border-t border-[var(--line)] pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-2)] font-bold">
              Select Cultural Community Archive:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CURATED_CULTURAL_SUBREDDITS.map((sub) => {
              const isSelected = selectedSubreddit.toLowerCase() === sub.slug.toLowerCase()
              return (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => {
                    setSelectedSubreddit(sub.slug)
                    // Reset query if switching subreddits without explicit topic
                    if (!culturalTopic) {
                      setSearchQuery('')
                      setActiveQuery('')
                    }
                  }}
                  className={`font-mono text-xs px-2.5 py-1 rounded transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] font-bold shadow-[1.5px_1.5px_0_var(--ink)]'
                      : 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
                  }`}
                  title={sub.topic}
                >
                  <span>{sub.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-2)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search within r/${selectedSubreddit} (e.g. ritual, calendar, folklore)...`}
              className="w-full border border-[var(--ink)] bg-[var(--paper)] pl-9 pr-8 py-2 text-xs md:text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-2)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-mono uppercase text-[var(--ink)] focus:outline-none"
            >
              <option value="hot">🔥 Hot</option>
              <option value="top">⭐ Top</option>
              <option value="new">✨ New</option>
            </select>

            <button
              type="submit"
              className="border border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider shadow-[2px_2px_0_var(--ink)] hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Fallback / Rate-Limit / Error Notice */}
      {noticeError && (
        <div className="border border-[var(--saffron)] bg-[var(--saffron)]/10 p-3 rounded text-xs font-mono text-[var(--ink)] flex items-start gap-2">
          <Info className="h-4 w-4 text-[var(--saffron)] shrink-0 mt-0.5" />
          <span>{noticeError}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--clay)] mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
            Fetching verified community dispatches from r/{selectedSubreddit}...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && posts.length === 0 && (
        <div className="border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-center space-y-2 font-mono">
          <AlertCircle className="h-6 w-6 text-[var(--ink-2)] mx-auto" />
          <p className="text-sm font-bold text-[var(--ink)]">No discussions found</p>
          <p className="text-xs text-[var(--ink-2)]">
            No matching cultural dispatches found for "{activeQuery}" in r/{selectedSubreddit}. Try broadening your search or switching subreddits.
          </p>
        </div>
      )}

      {/* Posts List */}
      {!isLoading && posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-2)]">
            <span>
              Showing {posts.length} field dispatches from <strong>r/{selectedSubreddit}</strong>
              {isFallback && ' (Curated Archive Mode)'}
            </span>
            {activeQuery && <span>Filtered by: "{activeQuery}"</span>}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[var(--shadow-hard)] hover:border-[var(--ink)] transition-colors space-y-3"
              >
                {/* Post Metadata Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2 text-[11px] font-mono text-[var(--ink-2)]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[var(--clay)]">{post.subreddit}</span>
                    <span>·</span>
                    <span>Posted by {post.author}</span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  {post.flair && (
                    <span className="bg-[var(--paper-2)] border border-[var(--line)] px-2 py-0.5 rounded text-[10px] font-semibold text-[var(--ink)]">
                      {post.flair}
                    </span>
                  )}
                </div>

                {/* Post Title */}
                <h3 className="font-serif text-lg md:text-xl font-bold text-[var(--ink)] leading-snug">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--clay)] transition-colors"
                  >
                    {post.title}
                  </a>
                </h3>

                {/* Excerpt Body */}
                {post.selftext && (
                  <p className="text-xs md:text-sm text-[var(--ink-2)] leading-relaxed line-clamp-3">
                    {post.selftext}
                  </p>
                )}

                {/* Footer Controls & Stats */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--line)] font-mono text-xs">
                  <div className="flex items-center gap-3">
                    {/* Upvotes */}
                    <div className="flex items-center gap-1 text-[var(--clay)] font-bold">
                      <ArrowUp className="h-3.5 w-3.5" />
                      <span>{post.score}</span>
                    </div>

                    {/* Comments */}
                    <div className="flex items-center gap-1 text-[var(--ink-2)]">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{post.numComments} comments</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCitation(post)}
                      className="border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors flex items-center gap-1"
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-700" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3 w-3" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>

                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[var(--ink)] bg-[var(--paper-2)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-all flex items-center gap-1"
                    >
                      <span>View on Reddit</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RedditCulturalDispatches
