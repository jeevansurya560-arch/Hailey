import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, PlusCircle, AlertCircle, Loader2, FileText, Link2, StickyNote } from 'lucide-react'
import { proposeCollectionItem } from '@/features/collections/services/collectionService'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function ProposeItemModal({ isOpen, onClose, collectionId, isPersonal, userPosts = [] }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [kind, setKind] = useState('link')
  const [postId, setPostId] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [note, setNote] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)

  const proposeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be signed in to propose an item.')

      if (kind === 'post' && !postId) {
        throw new Error('Please select a dispatch from your published posts.')
      }

      if (kind === 'link') {
        const trimmedUrl = url.trim()
        if (!trimmedUrl || !/^https?:\/\//.test(trimmedUrl)) {
          throw new Error('Please enter a valid web URL starting with http:// or https://')
        }
      }

      if (kind === 'note' && !note.trim()) {
        throw new Error('Note text is required.')
      }

      if (note.trim().length > 500) {
        throw new Error('Note must be 500 characters or less.')
      }

      const initialStatus = isPersonal ? 'approved' : 'pending'

      return proposeCollectionItem({
        collectionId,
        addedBy: user.id,
        kind,
        postId: kind === 'post' ? postId : null,
        url: kind === 'link' ? url.trim() : imageUrl.trim() || null,
        note: note.trim() || null,
        status: initialStatus,
      })
    },
    onSuccess: () => {
      setUrl('')
      setImageUrl('')
      setNote('')
      setPostId('')
      setErrorMsg(null)
      queryClient.invalidateQueries({ queryKey: ['collection_detail', collectionId] })
      onClose()
    },
    onError: (err) => {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to propose item')
    },
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34252A]/40 backdrop-blur-xs">
      <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-[#6A1F35]" />
            <h2 className="font-serif text-lg font-bold text-[#34252A]">
              {isPersonal ? 'Add Item to Collection' : 'Propose Archival Item'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#34252A]/50 hover:text-[#34252A] p-1.5 rounded-full hover:bg-[#F0E7DA] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Kind Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setKind('link')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border transition-all ${
              kind === 'link'
                ? 'neu-burgundy-pill border-[#6A1F35] text-[#FAF6EF] font-semibold'
                : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Link Citation</span>
          </button>

          <button
            type="button"
            onClick={() => setKind('post')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border transition-all ${
              kind === 'post'
                ? 'neu-burgundy-pill border-[#6A1F35] text-[#FAF6EF] font-semibold'
                : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => setKind('note')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border transition-all ${
              kind === 'note'
                ? 'neu-burgundy-pill border-[#6A1F35] text-[#FAF6EF] font-semibold'
                : 'neu-pill bg-[#FAF6EF] text-[#34252A]/70 border-[#E0D4C5] hover:border-[#6A1F35]/40'
            }`}
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span>Archival Note</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            proposeMutation.mutate()
          }}
          className="space-y-4"
        >
          {kind === 'link' && (
            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#34252A]/80 font-medium">
                External Resource URL (https:// only):
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://archive.org/... or https://museum.org/..."
                required
                className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] px-3.5 py-2.5 text-xs font-mono text-[#34252A] placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
              />
            </div>
          )}

          {kind === 'post' && (
            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-[#34252A]/80 font-medium">
                Select One of Your Published Dispatches:
              </label>
              {userPosts.length === 0 ? (
                <p className="text-xs text-[#34252A]/60 p-3 rounded-xl border border-dashed border-[#E0D4C5]">
                  You have not published any dispatches yet. Switch to Link Citation or Archival Note.
                </p>
              ) : (
                <select
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  required
                  className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] px-3.5 py-2.5 text-xs font-mono text-[#34252A] focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
                >
                  <option value="">-- Choose a dispatch --</option>
                  {userPosts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.body?.slice(0, 60)}... ({new Date(p.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Artifact Photo URL */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-[#34252A]/80 font-medium">
              Artifact Photo / Image URL (optional):
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or direct image link"
              className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] px-3.5 py-2 text-xs font-mono text-[#34252A] placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-[#34252A]/80 font-medium">
              {kind === 'note' ? 'Archival Note (required):' : 'Curation Annotation (optional note):'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain historical context, significance, or provenance of this cultural artifact..."
              maxLength={500}
              required={kind === 'note'}
              className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] p-3 text-xs text-[#34252A] placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
            />
            <div className="flex justify-end font-mono text-[10px] text-[#34252A]/50">
              <span>{note.length} / 500</span>
            </div>
          </div>

          {!isPersonal && (
            <p className="font-mono text-[11px] text-[#34252A]/70 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
              ℹ️ Community proposals enter the <strong>curator triage queue</strong>. Upon curator approval, a cryptographic contribution record is created for onchain attestation.
            </p>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs neu-pill rounded-full text-[#34252A]/70 hover:text-[#34252A] border border-[#E0D4C5] bg-[#FAF6EF] transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={proposeMutation.isPending}
              className="flex items-center gap-2 neu-burgundy-pill px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF6EF] hover:bg-[#511528] rounded-full disabled:opacity-40 transition-all font-semibold"
            >
              {proposeMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>{isPersonal ? 'Add Item' : 'Submit Proposal'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
