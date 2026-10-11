import React, { useState } from 'react'
import { X, Loader2, User, Globe, MapPin, Check } from 'lucide-react'
import { updateProfile } from '../services/profileService'

export function EditProfileModal({ profile, isOpen, onClose, onUpdated }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [website, setWebsite] = useState(profile?.website || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')

    try {
      await updateProfile(profile.id, {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      onUpdated?.()
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[var(--shadow-hard)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--clay)]" />
            <h3 className="font-serif text-lg font-bold text-[var(--ink)]">Edit Profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-2)] hover:text-[var(--ink)] p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          {/* Avatar Preview & URL */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
              Profile Photo URL
            </label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full border border-[var(--ink)] bg-[var(--paper-2)] shrink-0 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-[var(--ink-2)]" />
                )}
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2 text-xs font-sans text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya Lin"
              maxLength={50}
              className="w-full border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2 text-xs font-sans text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
                Bio & Background
              </label>
              <span className="text-[10px] text-[var(--ink-2)]">{bio.length}/500</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about your cultural explorations, research, or artistic movements..."
              maxLength={500}
              rows={3}
              className="w-full border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2 text-xs font-sans text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
              Location / Region
            </label>
            <div className="relative">
              <MapPin className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-[var(--ink-2)]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kyoto, Japan · Oaxaca, Mexico"
                maxLength={60}
                className="w-full pl-8 pr-3 py-2 text-xs font-sans border border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
              Website / Portfolio
            </label>
            <div className="relative">
              <Globe className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-[var(--ink-2)]" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myarchive.org"
                className="w-full pl-8 pr-3 py-2 text-xs font-sans border border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--line)] bg-[var(--paper-2)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="border border-[var(--ink)] bg-[var(--clay)] px-5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--paper)] font-bold flex items-center gap-1.5 shadow-[1.5px_1.5px_0_var(--ink)] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>Save Changes</span>
                  <Check className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
