import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Compass, Sparkles, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { fetchCultureTags } from '@/features/communities/services/communityService'
import { saveUserInterests } from '@/features/profile/services/profileService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TagSticker } from '@/components/ui/TagSticker'

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
    onSuccess: (_, tagIds) => {
      if (user?.id) {
        queryClient.setQueryData(['user_interests_count', user.id], tagIds.length)
        queryClient.invalidateQueries({ queryKey: ['user_interests_count', user.id] })
        queryClient.invalidateQueries({ queryKey: ['user_interests', user.id] })
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        sessionStorage.setItem(`onboarding_dismissed_${user.id}`, 'true')
      }
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
        <Loader2 className="h-8 w-8 animate-spin text-[#6A1F35]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#B08A50] font-semibold">
          Loading culture catalog...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 text-center space-y-3">
        <AlertCircle className="h-6 w-6 text-[#6A1F35] mx-auto" />
        <p className="text-sm font-medium text-[#34252A]">
          Unable to load cultural taxonomy catalog.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-[#B08A50]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#B08A50] font-bold">
            Personalize Exploration
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#34252A]">
          What are you curious about?
        </h1>

        <p className="text-sm text-[#34252A]/80 leading-relaxed max-w-2xl">
          Select <strong className="text-[#34252A]">3 to 10 cultural threads</strong> to guide your personalized feed and community recommendations. You can explore and adjust your threads anytime.
        </p>

        {/* Counter Badge */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#E0D4C5] pt-4">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs px-3 py-1 rounded-full border transition-all ${
                isValid
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'neu-inset bg-[#F0E7DA] border-[#E0D4C5] text-[#34252A]'
              }`}
            >
              <strong>{selectionCount}</strong> / 10 selected {selectionCount < 3 && '(minimum 3 required)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => saveInterestsMutation.mutate(Array.from(selectedTagIds))}
            disabled={!isValid || saveInterestsMutation.isPending}
            className="neu-burgundy-pill flex items-center gap-2 rounded-full px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-[#FAF6EF] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
          >
            {saveInterestsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#FAF6EF]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Start Exploring</span>
                <ArrowRight className="h-4 w-4 text-[#FAF6EF]" />
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[#6A1F35] bg-red-50 p-3 rounded-xl border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Category Groups Matrix */}
      <div className="space-y-6">
        {groupedBuckets.map((group) => (
          <section
            key={group.title}
            className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 space-y-4"
          >
            <div>
              <h2 className="font-serif text-lg font-bold text-[#34252A] flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#6A1F35]" />
                {group.title}
              </h2>
              <p className="text-xs text-[#34252A]/70 font-mono mt-0.5">
                {group.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF6EF]/95 backdrop-blur-md border-t border-[#E0D4C5] neu-raised md:hidden z-40 flex items-center justify-between">
        <span className="font-mono text-xs text-[#34252A]">
          <strong>{selectionCount}</strong>/10 selected
        </span>
        <button
          type="button"
          onClick={() => saveInterestsMutation.mutate(Array.from(selectedTagIds))}
          disabled={!isValid || saveInterestsMutation.isPending}
          className="neu-burgundy-pill flex items-center gap-1.5 rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF6EF] disabled:opacity-40"
        >
          <span>Continue</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
