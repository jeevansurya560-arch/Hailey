import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { createCollection } from '@/features/collections/services/collectionService'
import { useAuth } from '@/features/auth/hooks/useAuth'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34252A]/40 backdrop-blur-xs">
      <div className="neu-card rounded-3xl bg-[#FAF6EF] border border-[#E0D4C5] max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E0D4C5] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#6A1F35]" />
            <h2 className="font-serif text-lg font-bold text-[#34252A]">
              {communityId ? `New ${defaultCommunityName || 'Community'} Collection` : 'New Personal Collection'}
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-[#34252A]/80 font-medium">
              Collection Title (required):
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1990s Tokyo Harajuku Archive"
              maxLength={80}
              required
              className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] px-3.5 py-2.5 text-sm text-[#34252A] placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-[#34252A]/80 font-medium">
              Description (optional):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Curated items documenting aesthetic artifacts, zines, and subcultural movements..."
              maxLength={500}
              className="w-full neu-inset-input rounded-xl border border-[#E0D4C5] p-3 text-xs text-[#34252A] placeholder:text-[#34252A]/40 focus:outline-none focus:ring-1 focus:ring-[#6A1F35]"
            />
          </div>

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
              disabled={createMutation.isPending || !title.trim()}
              className="flex items-center gap-2 neu-burgundy-pill px-5 py-2 font-mono text-xs uppercase tracking-wider text-[#FAF6EF] hover:bg-[#511528] rounded-full disabled:opacity-40 transition-all font-semibold"
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
