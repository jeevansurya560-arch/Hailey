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
        url: kind === 'link' ? url.trim() : null,
        note: note.trim() || null,
        status: initialStatus,
      })
    },
    onSuccess: () => {
      setUrl('')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] max-w-lg w-full p-6 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-[var(--clay)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              {isPersonal ? 'Add Item to Collection' : 'Propose Archival Item'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-2)] hover:text-[var(--ink)] p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Kind Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setKind('link')}
            className={`flex items-center justify-center gap-1.5 p-2 border transition-all ${
              kind === 'link'
                ? 'border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] font-bold shadow-[1.5px_1.5px_0_var(--ink)]'
                : 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Link Citation</span>
          </button>

          <button
            type="button"
            onClick={() => setKind('post')}
            className={`flex items-center justify-center gap-1.5 p-2 border transition-all ${
              kind === 'post'
                ? 'border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] font-bold shadow-[1.5px_1.5px_0_var(--ink)]'
                : 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => setKind('note')}
            className={`flex items-center justify-center gap-1.5 p-2 border transition-all ${
              kind === 'note'
                ? 'border-[var(--ink)] bg-[var(--clay)] text-[var(--paper)] font-bold shadow-[1.5px_1.5px_0_var(--ink)]'
                : 'border-[var(--line)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]'
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
            <div className="space-y-1">
              <label className="block font-mono text-xs text-[var(--ink)]">
                External Resource URL (https:// only):
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://archive.org/... or https://museum.org/..."
                required
                className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
              />
            </div>
          )}

          {kind === 'post' && (
            <div className="space-y-1">
              <label className="block font-mono text-xs text-[var(--ink)]">
                Select One of Your Published Dispatches:
              </label>
              {userPosts.length === 0 ? (
                <p className="text-xs text-[var(--ink-2)] p-2 border border-dashed border-[var(--line)]">
                  You have not published any dispatches yet. Switch to Link Citation or Archival Note.
                </p>
              ) : (
                <select
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  required
                  className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
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

          <div className="space-y-1">
            <label className="block font-mono text-xs text-[var(--ink)]">
              {kind === 'note' ? 'Archival Note (required):' : 'Curation Annotation (optional note):'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain historical context, significance, or provenance of this cultural artifact..."
              maxLength={500}
              required={kind === 'note'}
              className="w-full border border-[var(--line)] bg-[var(--paper)] p-3 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            />
            <div className="flex justify-end font-mono text-[10px] text-[var(--ink-2)]">
              <span>{note.length} / 500</span>
            </div>
          </div>

          {!isPersonal && (
            <p className="font-mono text-[11px] text-[var(--ink-2)] bg-amber-50 p-2.5 border border-amber-200">
              ℹ️ Community proposals enter the <strong>curator triage queue</strong>. Upon curator approval, a cryptographic contribution record is created for onchain attestation.
            </p>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-[var(--clay)] bg-red-50 p-2.5 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs text-[var(--ink-2)] hover:text-[var(--ink)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={proposeMutation.isPending}
              className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--clay)] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-40"
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
