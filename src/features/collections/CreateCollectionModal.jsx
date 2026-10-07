import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { createCollection } from '@/features/collections/services/collectionService'
import { useAuth } from '@/features/auth/useAuth'

export function CreateCollectionModal({ isOpen, onClose, communityId, defaultCommunityName }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be signed in to create a collection.')
      const trimmedTitle = title.trim()
      if (!trimmedTitle || trimmedTitle.length > 80) {
        throw new Error('Title is required and must be 1 to 80 characters.')
      }
      if (description.trim().length > 500) {
        throw new Error('Description must be 500 characters or less.')
      }

      return createCollection({
        communityId: communityId || null,
        ownerId: user.id,
        title: trimmedTitle,
        description: description.trim() || '',
      })
    },
    onSuccess: () => {
      setTitle('')
      setDescription('')
      setErrorMsg(null)
      queryClient.invalidateQueries({ queryKey: ['community_collections'] })
      queryClient.invalidateQueries({ queryKey: ['user_collections'] })
      onClose()
    },
    onError: (err) => {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create collection')
    },
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="border border-[var(--ink)] bg-[var(--paper-2)] max-w-md w-full p-6 shadow-[var(--shadow-hard)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--clay)]" />
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              {communityId ? `New ${defaultCommunityName || 'Community'} Collection` : 'New Personal Collection'}
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="block font-mono text-xs text-[var(--ink)]">
              Collection Title (required):
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1990s Tokyo Harajuku Archive"
              maxLength={80}
              required
              className="w-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--clay)]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs text-[var(--ink)]">
              Description (optional):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Curated items documenting aesthetic artifacts, zines, and subcultural movements..."
              maxLength={500}
              className="w-full border border-[var(--line)] bg-[var(--paper)] p-3 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            />
          </div>

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
              disabled={createMutation.isPending || !title.trim()}
              className="flex items-center gap-2 border border-[var(--ink)] bg-[var(--clay)] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] shadow-[2px_2px_0_var(--ink)] hover:opacity-90 disabled:opacity-40"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Collection</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
