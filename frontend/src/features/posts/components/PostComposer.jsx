import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PenSquare, Send, Image, Link2, AlertCircle, Loader2, X, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { createPost } from '@/features/feed/services/feedService'
import {
  fetchCultureTags,
  fetchCommunities,
} from '@/features/communities/services/communityService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TagSticker } from '@/components/ui/TagSticker'

export function PostComposer({ defaultCommunityId, onPostCreated }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  const [body, setBody] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaCredit, setMediaCredit] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState(defaultCommunityId || '')
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [tagSearch, setTagSearch] = useState('')
  const [showExtras, setShowExtras] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch available tags via communityService
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchCultureTags,
  })

  // Fetch communities via communityService
  const { data: communities = [] } = useQuery({
    queryKey: ['communities'],
    queryFn: () => fetchCommunities(),
  })

  const toggleTag = (tagId) => {
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

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Only JPEG, PNG, and WebP images are permitted.')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 5MB limit.')
      return
    }

    if (!user) {
      setErrorMsg('Please sign in to upload media.')
      return
    }

    try {
      setUploadingImage(true)
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${user.id}/${Date.now()}_${cleanFileName}`

      const { data, error: uploadError } = await supabase.storage
        .from('cultural-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message || 'Image upload failed.')
      }

      const { data: publicUrlData } = supabase.storage
        .from('cultural-media')
        .getPublicUrl(data.path)

      if (publicUrlData?.publicUrl) {
        setMediaUrl(publicUrlData.publicUrl)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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

      return createPost({
        authorId: user.id,
        body: trimmedBody,
        communityId: selectedCommunityId || null,
        mediaUrl: mediaUrl.trim() || null,
        mediaCredit: mediaCredit.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        tagIds: selectedTagIds,
      })
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
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Error creating post'
      setErrorMsg(msg)
    },
  })

  if (!user) {
    return (
      <div className="neu-card rounded-2xl bg-[#FAF6EF] border border-[#E0D4C5] p-5 text-center font-mono text-xs text-[#34252A]/70">
        Sign in to post cultural dispatches and archival findings.
      </div>
    )
  }

  const charCount = body.length
  const filteredTagSuggestions = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  ).slice(0, 8)

  return (
    <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-[#E0D4C5] pb-3">
        <PenSquare className="h-4 w-4 text-[#6A1F35]" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#B08A50] font-bold">
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
          className="w-full neu-inset-input rounded-2xl bg-[#F0E7DA] border border-[#E0D4C5] p-4 text-sm text-[#34252A] placeholder:text-[#34252A]/50 focus:outline-none focus:border-[#6A1F35] transition-all resize-y"
        />
        <div className="flex justify-end font-mono text-[10px] text-[#34252A]/60 pr-1">
          <span>{charCount} / 2000</span>
        </div>
      </div>

      {/* Tag Selector (1-5 tags) */}
      <div className="space-y-2">
        <label className="block font-mono text-xs text-[#34252A] font-semibold">
          Select Cultural Threads ({selectedTagIds.length}/5 selected, min 1):
        </label>

        {/* Selected Tags Pill Display */}
        {selectedTagIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
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
                    className="text-[#34252A]/60 hover:text-red-700 p-0.5 cursor-pointer"
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
          className="w-full neu-inset-input rounded-xl bg-[#F0E7DA] border border-[#E0D4C5] px-3.5 py-2 text-xs text-[#34252A] placeholder:text-[#34252A]/50 focus:border-[#6A1F35] focus:outline-none transition-all"
        />

        {tagSearch.trim() && (
          <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
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
      <div className="space-y-1.5">
        <label className="block font-mono text-xs text-[#34252A] font-semibold">
          Target Community (optional):
        </label>
        <select
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
          className="w-full neu-inset rounded-xl bg-[#F0E7DA] border border-[#E0D4C5] px-3.5 py-2 text-xs font-mono text-[#34252A] focus:border-[#6A1F35] focus:outline-none transition-all cursor-pointer"
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
          className="font-mono text-xs text-[#6A1F35] hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          <span>{showExtras ? '− Hide image & source links' : '+ Add image & source citation'}</span>
        </button>
      </div>

      {showExtras && (
        <div className="space-y-3.5 border-t border-[#E0D4C5] pt-3.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-mono text-xs text-[#34252A]">
                <Image className="h-3.5 w-3.5 text-[#B08A50]" />
                <span>Media & Artifact Visual:</span>
              </label>
              {mediaUrl && (
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="font-mono text-[11px] text-[#6A1F35] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="media-file-input"
              />
              <label
                htmlFor="media-file-input"
                className="cursor-pointer inline-flex items-center gap-1.5 border border-[#E0D4C5] bg-[#FAF6EF] px-3.5 py-1.5 rounded-xl font-mono text-xs uppercase tracking-wider text-[#34252A] neu-pill hover:bg-[#F0E7DA] transition-all"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6A1F35]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 text-[#6A1F35]" />
                    <span>Upload Image (Max 5MB)</span>
                  </>
                )}
              </label>
              <span className="font-mono text-[10px] text-[#34252A]/60">or enter image URL below</span>
            </div>

            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://upload.wikimedia.org/... or https://..."
              className="w-full neu-inset-input rounded-xl bg-[#F0E7DA] border border-[#E0D4C5] px-3.5 py-2 text-xs text-[#34252A] focus:border-[#6A1F35] focus:outline-none transition-all"
            />

            {mediaUrl && (
              <div className="mt-2 border border-[var(--line)] p-2 max-w-[200px] bg-[var(--paper-2)]">
                <img
                  src={mediaUrl}
                  alt="Post visual attachment preview"
                  className="w-full h-24 object-cover border border-[var(--line)]"
                  onError={() => setErrorMsg('Failed to preview image from URL.')}
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs text-[#34252A]">
              Media Credit / Attribution:
            </label>
            <input
              type="text"
              value={mediaCredit}
              onChange={(e) => setMediaCredit(e.target.value)}
              placeholder="Wikimedia Commons / Photographer Name (CC BY-SA 4.0)"
              className="w-full neu-inset-input rounded-xl bg-[#F0E7DA] border border-[#E0D4C5] px-3.5 py-2 text-xs text-[#34252A] focus:border-[#6A1F35] focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-mono text-xs text-[#34252A]">
              <Link2 className="h-3.5 w-3.5 text-[#B08A50]" />
              <span>Source URL / Citation:</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full neu-inset-input rounded-xl bg-[#F0E7DA] border border-[#E0D4C5] px-3.5 py-2 text-xs text-[#34252A] focus:border-[#6A1F35] focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-[#6A1F35] bg-red-50 p-3 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => createPostMutation.mutate()}
          disabled={createPostMutation.isPending || body.trim().length === 0 || selectedTagIds.length === 0}
          className="neu-burgundy-pill flex items-center gap-2 rounded-full px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-[#FAF6EF] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#FAF6EF]" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5 text-[#FAF6EF]" />
              <span>Publish Dispatch</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
