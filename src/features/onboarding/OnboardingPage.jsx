import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Compass, Sparkles, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { fetchCultureTags } from '@/features/communities/services/communityService'
import { saveUserInterests } from '@/features/profile/services/profileService'
import { useAuth } from '@/features/auth/useAuth'
import { TagSticker } from '@/components/TagSticker'

// Visual category grouping for pleasant onboarding layout
const KIND_GROUPS = [
  {
    title: 'Heritage & Regional Traditions',
    subtitle: 'Living roots, ancestral practices, and geographic homelands',
    kinds: ['culture', 'place', 'heritage', 'language'],
  },
  {
    title: 'Music & Sonic Movements',
    subtitle: 'Underground rhythms, electronic synthesis, and vocal traditions',
    kinds: ['music'],
  },
  {
    title: 'Style, Garments & Artifacts',
    subtitle: 'Subcultural silhouettes, tailoring, and textile arts',
    kinds: ['fashion'],
  },
  {
    title: 'Culinary Arts & Preservation',
    subtitle: 'Fermentation, street food rituals, and ancestral recipes',
    kinds: ['food'],
  },
  {
    title: 'Visual Arts, Film & Print',
    subtitle: 'Cinema traditions, muralism, photography, and riso publishing',
    kinds: ['art', 'film'],
  },
  {
    title: 'Digital & Youth Culture',
    subtitle: 'Microgenres, skateboard architecture, and net aesthetics',
    kinds: ['internet'],
  },
]

export function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedTagIds, setSelectedTagIds] = useState(new Set())
  const [errorMsg, setErrorMsg] = useState(null)

  // 1. Fetch tags via communityService
  const {
    data: tags = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchCultureTags,
  })

  // Group tags into visual buckets
  const groupedBuckets = useMemo(() => {
    return KIND_GROUPS.map((group) => {
      const matchingTags = tags.filter((t) => group.kinds.includes(t.kind))
      return {
        ...group,
        tags: matchingTags,
      }
    }).filter((g) => g.tags.length > 0)
  }, [tags])

  // Toggle selection handler
  const handleToggle = (tagId) => {
    setErrorMsg(null)
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        if (next.size >= 10) {
          setErrorMsg('You can select a maximum of 10 threads during onboarding.')
          return prev
        }
        next.add(tagId)
      }
      return next
    })
  }

  // 2. Submit mutation via profileService
  const saveInterestsMutation = useMutation({
    mutationFn: async (tagIds) => {
      if (!user) throw new Error('You must be signed in to save interests.')
      if (tagIds.length < 3) throw new Error('Please select at least 3 interests.')
      if (tagIds.length > 10) throw new Error('Maximum 10 interests allowed.')

      return saveUserInterests({
        userId: user.id,
        tagIds,
        weight: 5,
        source: 'onboarding',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_interests', user?.id] })
      navigate('/', { replace: true })
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Failed to save interests'
      setErrorMsg(msg)
    },
  })

  const selectionCount = selectedTagIds.size
  const isValid = selectionCount >= 3 && selectionCount <= 10

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--clay)]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--ink-2)]">
          Loading culture catalog...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border border-[var(--clay)] bg-[var(--paper-2)] p-6 text-center space-y-3">
        <AlertCircle className="h-6 w-6 text-[var(--clay)] mx-auto" />
        <p className="text-sm font-medium text-[var(--ink)]">
          Unable to load cultural taxonomy catalog.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-6 md:p-8 shadow-[var(--shadow-hard)]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[var(--saffron)]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--clay)] font-bold">
            Personalize Exploration
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[var(--ink)]">
          What are you curious about?
        </h1>

        <p className="mt-2 text-sm text-[var(--ink-2)] leading-relaxed">
          Select <strong>3 to 10 cultural threads</strong> to guide your personalized feed and community recommendations. You can explore and adjust your threads anytime.
        </p>

        {/* Counter Badge */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs px-2.5 py-1 border ${
                isValid
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]'
              }`}
            >
              <strong>{selectionCount}</strong> / 10 selected {selectionCount < 3 && '(minimum 3 required)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => saveInterestsMutation.mutate(Array.from(selectedTagIds))}
            disabled={!isValid || saveInterestsMutation.isPending}
            className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--clay)] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {saveInterestsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Start Exploring</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--clay)] bg-red-50 p-2.5 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Category Groups Matrix */}
      <div className="space-y-8">
        {groupedBuckets.map((group) => (
          <section
            key={group.title}
            className="border border-[var(--line)] bg-[var(--paper-2)] p-6 space-y-4"
          >
            <div>
              <h2 className="font-serif text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                <Compass className="h-4 w-4 text-[var(--clay)]" />
                {group.title}
              </h2>
              <p className="text-xs text-[var(--ink-2)] font-mono mt-0.5">
                {group.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {group.tags.map((tag) => (
                <TagSticker
                  key={tag.id}
                  id={tag.id}
                  name={tag.name}
                  slug={tag.slug}
                  kind={tag.kind}
                  selected={selectedTagIds.has(tag.id)}
                  onClick={() => handleToggle(tag.id)}
                  size="md"
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Bottom Sticky Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--paper)]/95 backdrop-blur border-t border-[var(--line)] md:hidden z-40 flex items-center justify-between">
        <span className="font-mono text-xs">
          <strong>{selectionCount}</strong>/10 selected
        </span>
        <button
          type="button"
          onClick={() => saveInterestsMutation.mutate(Array.from(selectedTagIds))}
          disabled={!isValid || saveInterestsMutation.isPending}
          className="flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] disabled:opacity-40"
        >
          <span>Continue</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
