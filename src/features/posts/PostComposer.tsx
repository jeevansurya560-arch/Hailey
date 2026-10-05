import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PenSquare, Send, Image, Link2, AlertCircle, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { TagSticker } from '@/components/TagSticker'
import type { TagKind } from '@/lib/threadColors'

interface Tag {
  id: number
  name: string
  slug: string
  kind: TagKind
}

interface Community {
  id: string
  name: string
  slug: string
}

interface PostComposerProps {
  defaultCommunityId?: string
  onPostCreated?: () => void
}

export function PostComposer({ defaultCommunityId, onPostCreated }: PostComposerProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [body, setBody] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaCredit, setMediaCredit] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState(defaultCommunityId || '')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagSearch, setTagSearch] = useState('')
  const [showExtras, setShowExtras] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fetch available tags
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await supabase.from('tags').select('*').order('name')
      return (data || []) as Tag[]
    },
  })

  // Fetch communities
  const { data: communities = [] } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data } = await supabase.from('communities').select('id, name, slug').order('name')
      return (data || []) as Community[]
    },
  })

  const toggleTag = (tagId: number) => {
    setErrorMsg(null)
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
    } else {
      if (selectedTagIds.length >= 5) {
        setErrorMsg('You can select a maximum of 5 tags per post.')
        return
      }
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be signed in to create a post.')
      const trimmedBody = body.trim()
      if (trimmedBody.length < 1 || trimmedBody.length > 2000) {
        throw new Error('Post body must be between 1 and 2,000 characters.')
      }
      if (selectedTagIds.length < 1 || selectedTagIds.length > 5) {
        throw new Error('Please select between 1 and 5 tags for this post.')
      }
      if (mediaUrl.trim() && !mediaUrl.trim().startsWith('https://')) {
        throw new Error('Media URL must be a valid https:// link.')
      }
      if (sourceUrl.trim() && !/^https?:\/\//.test(sourceUrl.trim())) {
        throw new Error('Source URL must be a valid http:// or https:// web address.')
      }

      // 1. Insert into posts
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          body: trimmedBody,
          community_id: selectedCommunityId || null,
          media_url: mediaUrl.trim() || null,
          media_credit: mediaCredit.trim() || null,
          source_url: sourceUrl.trim() || null,
          is_editorial: false,
        })
        .select('id')
        .single()

      if (postError || !post) throw postError || new Error('Failed to create post')

      // 2. Insert into post_tags
      const postTagRows = selectedTagIds.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
        weight: 1.0,
      }))

      const { error: tagError } = await supabase.from('post_tags').insert(postTagRows)
      if (tagError) throw tagError

      return post
    },
    onSuccess: () => {
      setBody('')
      setMediaUrl('')
      setMediaCredit('')
      setSourceUrl('')
      setSelectedTagIds([])
      setShowExtras(false)
      setErrorMsg(null)
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      onPostCreated?.()
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Error creating post'
      setErrorMsg(msg)
    },
  })

  if (!user) {
    return (
      <div className="border border-[var(--line)] bg-[var(--paper-2)] p-4 text-center font-mono text-xs text-[var(--ink-2)]">
        Sign in to post cultural dispatches and archival findings.
      </div>
    )
  }

  const charCount = body.length
  const filteredTagSuggestions = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  ).slice(0, 8)

  return (
    <div className="border border-[var(--ink)] bg-[var(--paper-2)] p-5 shadow-[var(--shadow-hard)] space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
        <PenSquare className="h-4 w-4 text-[var(--clay)]" />
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--clay)] font-bold">
          Dispatch Composer
        </span>
      </div>

      {/* Body textarea */}
      <div className="space-y-1">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Document a cultural movement, aesthetic history, or subcultural tradition..."
          maxLength={2000}
          className="w-full border border-[var(--ink)] bg-[var(--paper)] p-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-2)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
        />
        <div className="flex justify-end font-mono text-[10px] text-[var(--ink-2)]">
          <span>{charCount} / 2000</span>
        </div>
      </div>

      {/* Tag Selector (1-5 tags) */}
      <div className="space-y-2">
        <label className="block font-mono text-xs text-[var(--ink)]">
          Select Cultural Threads ({selectedTagIds.length}/5 selected, min 1):
        </label>

        {/* Selected Tags Pill Display */}
        {selectedTagIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTagIds.map((id) => {
              const tag = tags.find((t) => t.id === id)
              if (!tag) return null
              return (
                <div key={id} className="inline-flex items-center gap-1">
                  <TagSticker
                    id={tag.id}
                    name={tag.name}
                    kind={tag.kind}
                    selected={true}
                    onClick={() => toggleTag(tag.id)}
                    size="sm"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="text-[var(--ink-2)] hover:text-red-600 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Tag Search filter */}
        <input
          type="text"
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          placeholder="Filter tags to add (e.g. Hip-Hop, Streetwear, Fermentation)..."
          className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
        />

        {tagSearch.trim() && (
          <div className="flex flex-wrap gap-1.5 pt-1 max-h-32 overflow-y-auto">
            {filteredTagSuggestions.map((t) => (
              <TagSticker
                key={t.id}
                id={t.id}
                name={t.name}
                kind={t.kind}
                selected={selectedTagIds.includes(t.id)}
                onClick={() => toggleTag(t.id)}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Optional Community Selector */}
      <div className="space-y-1">
        <label className="block font-mono text-xs text-[var(--ink)]">
          Target Community (optional):
        </label>
        <select
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
          className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
        >
          <option value="">None (Personal Global Feed)</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle extras (Image & Source URL) */}
      <div>
        <button
          type="button"
          onClick={() => setShowExtras(!showExtras)}
          className="font-mono text-xs text-[var(--clay)] hover:underline flex items-center gap-1"
        >
          <span>{showExtras ? '− Hide image & source links' : '+ Add image & source citation'}</span>
        </button>
      </div>

      {showExtras && (
        <div className="space-y-3 border-t border-[var(--line)] pt-3">
          <div className="space-y-1">
            <label className="flex items-center gap-1 font-mono text-xs text-[var(--ink)]">
              <Image className="h-3.5 w-3.5 text-[var(--ink-2)]" />
              <span>Image URL (https:// only):</span>
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://upload.wikimedia.org/..."
              className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs text-[var(--ink)]">
              Media Credit / Attribution:
            </label>
            <input
              type="text"
              value={mediaCredit}
              onChange={(e) => setMediaCredit(e.target.value)}
              placeholder="Wikimedia Commons / Photographer Name (CC BY-SA 4.0)"
              className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1 font-mono text-xs text-[var(--ink)]">
              <Link2 className="h-3.5 w-3.5 text-[var(--ink-2)]" />
              <span>Source URL / Citation:</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-[var(--clay)] bg-red-50 p-2.5 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => createPostMutation.mutate()}
          disabled={createPostMutation.isPending || body.trim().length === 0 || selectedTagIds.length === 0}
          className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--clay)] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Publish Dispatch</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
