import React, { useState, useRef, useCallback } from 'react'
import { X, Loader2, User, Globe, MapPin, Check, Upload, Camera, AtSign, Tag, AlertCircle } from 'lucide-react'
import { updateProfile, uploadAvatar, deleteAvatar, validateAvatarFile, checkHandleAvailability } from '../services/profileService'
import { UserAvatar } from '@/components/ui/UserAvatar'

const ROLE_OPTIONS = [
  'Curator',
  'Contributor',
  'Archivist',
  'Researcher',
  'Artist',
  'Collector',
  'Educator',
  'Observer',
]

const CULTURAL_INTEREST_SUGGESTIONS = [
  'Traditional Crafts',
  'Performing Arts',
  'Culinary Heritage',
  'Textile & Weaving',
  'Architecture',
  'Oral Traditions',
  'Music & Rhythm',
  'Festivals & Rituals',
  'Visual Arts',
  'Indigenous Knowledge',
  'Folk Traditions',
  'Dance',
]

export function EditProfileModal({ profile, isOpen, onClose, onUpdated }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [handle, setHandle] = useState(profile?.handle || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [website, setWebsite] = useState(profile?.website || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [roles, setRoles] = useState(profile?.roles || [])
  const [culturalInterests, setCulturalInterests] = useState(profile?.cultural_interests || [])
  const [newInterest, setNewInterest] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [handleStatus, setHandleStatus] = useState(null) // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef(null)
  const handleCheckTimerRef = useRef(null)

  // ── Synchronize state when opened with fresh profile ────
  const [prevOpen, setPrevOpen] = useState(false)
  const [prevProfileId, setPrevProfileId] = useState(profile?.id)

  if ((!prevOpen && isOpen) || (profile?.id && profile.id !== prevProfileId)) {
    setPrevOpen(isOpen)
    setPrevProfileId(profile?.id)
    if (profile) {
      setDisplayName(profile.display_name || '')
      setHandle(profile.handle || '')
      setBio(profile.bio || '')
      setWebsite(profile.website || '')
      setLocation(profile.location || '')
      setAvatarUrl(profile.avatar_url || '')
      setRoles(Array.isArray(profile.roles) ? profile.roles : [])
      setCulturalInterests(Array.isArray(profile.cultural_interests) ? profile.cultural_interests : [])
      setErrorMsg('')
      setHandleStatus(null)
    }
  } else if (prevOpen && !isOpen) {
    setPrevOpen(false)
  }

  // Clean up debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (handleCheckTimerRef.current) clearTimeout(handleCheckTimerRef.current)
    }
  }, [])

  const currentHandle = profile?.handle
  const currentProfileId = profile?.id

  // ── Handle availability check (debounced) ────────────────
  const checkHandle = useCallback((value) => {
    if (handleCheckTimerRef.current) clearTimeout(handleCheckTimerRef.current)

    const cleaned = value.toLowerCase().trim().replace(/^@/, '')

    // Same handle as current — no check needed
    if (cleaned === currentHandle) {
      setHandleStatus(null)
      return
    }

    if (cleaned.length < 3) {
      setHandleStatus(cleaned.length > 0 ? 'invalid' : null)
      return
    }

    if (!/^[a-z0-9_]{3,20}$/.test(cleaned)) {
      setHandleStatus('invalid')
      return
    }

    setHandleStatus('checking')
    handleCheckTimerRef.current = setTimeout(async () => {
      try {
        const { available } = await checkHandleAvailability(cleaned, currentProfileId)
        setHandleStatus(available ? 'available' : 'taken')
      } catch {
        setHandleStatus(null)
      }
    }, 500)
  }, [currentHandle, currentProfileId])

  const onHandleChange = (e) => {
    const val = e.target.value
    setHandle(val)
    checkHandle(val)
  }

  // ── File Upload ────────────────────────────────────
  const handleFileSelect = async (file) => {
    if (!file || !profile?.id) return
    setIsUploading(true)
    setErrorMsg('')
    try {
      validateAvatarFile(file)

      // Delete old avatar if it was a Supabase-hosted file
      if (avatarUrl) {
        await deleteAvatar(avatarUrl, profile.id)
      }

      const newUrl = await uploadAvatar(file, profile.id)
      setAvatarUrl(newUrl)
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = '' // Reset so same file can be re-selected
  }

  // ── Drag & Drop ────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  // ── Role toggle ────────────────────────────────────
  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  // ── Cultural interests ─────────────────────────────
  const addInterest = (interest) => {
    const trimmed = interest.trim()
    if (trimmed && !culturalInterests.includes(trimmed)) {
      setCulturalInterests((prev) => [...prev, trimmed])
    }
    setNewInterest('')
  }

  const removeInterest = (interest) => {
    setCulturalInterests((prev) => prev.filter((i) => i !== interest))
  }

  // ── Save ───────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')

    try {
      const updates = {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        roles,
        cultural_interests: culturalInterests,
      }

      // Only include handle if changed
      const cleanedHandle = handle.toLowerCase().trim().replace(/^@/, '')
      if (cleanedHandle !== profile?.handle) {
        updates.handle = cleanedHandle
      }

      await updateProfile(profile.id, updates)
      onUpdated?.()
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const isHandleBlocked = handleStatus === 'taken' || handleStatus === 'invalid'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[var(--shadow-hard)] space-y-5">
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
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          {/* Avatar Upload */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative shrink-0">
                <UserAvatar
                  src={avatarUrl}
                  handle={handle || profile?.handle}
                  displayName={displayName || profile?.display_name}
                  size="xl"
                  border
                />
                {isUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Upload Zone */}
              <div
                className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[var(--clay)] bg-[var(--clay)]/5'
                    : 'border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--ink-2)]'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFileInputChange}
                />
                <div className="flex flex-col items-center gap-1.5">
                  {isDragging ? (
                    <Camera className="h-5 w-5 text-[var(--clay)]" />
                  ) : (
                    <Upload className="h-5 w-5 text-[var(--ink-2)]" />
                  )}
                  <span className="text-[10px] text-[var(--ink-2)]">
                    {isDragging ? 'Drop image here' : 'Click or drag to upload'}
                  </span>
                  <span className="text-[9px] text-[var(--ink-2)]/60">
                    JPEG, PNG, or WebP · Max 5 MB
                  </span>
                </div>
              </div>
            </div>

            {/* Fallback URL input */}
            <details className="mt-1">
              <summary className="text-[10px] text-[var(--ink-2)] cursor-pointer hover:text-[var(--ink)]">
                Or paste image URL
              </summary>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 w-full border border-[var(--line)] bg-[var(--paper-2)] px-3 py-2 text-xs font-sans text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </details>
          </div>

          {/* Handle */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
              Public Handle
            </label>
            <div className="relative">
              <AtSign className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-[var(--ink-2)]" />
              <input
                type="text"
                value={handle}
                onChange={onHandleChange}
                placeholder="your_handle"
                maxLength={20}
                className="w-full pl-8 pr-8 py-2 text-xs font-sans border border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
              {/* Status indicator */}
              <div className="absolute right-2.5 top-2 text-[10px]">
                {handleStatus === 'checking' && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--ink-2)]" />
                )}
                {handleStatus === 'available' && (
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <Check className="h-3 w-3" /> Available
                  </span>
                )}
                {handleStatus === 'taken' && (
                  <span className="text-red-600 font-bold">Taken</span>
                )}
                {handleStatus === 'invalid' && (
                  <span className="text-amber-600 font-bold">Invalid</span>
                )}
              </div>
            </div>
            <p className="text-[9px] text-[var(--ink-2)]/70">
              3–20 characters: lowercase letters, numbers, underscores only.
            </p>
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

          {/* Roles */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px]">
              Roles
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`border px-2.5 py-1 text-[10px] font-mono uppercase font-bold transition-all ${
                    roles.includes(role)
                      ? 'border-[var(--clay)] bg-[var(--clay)] text-[var(--paper)] shadow-[1px_1px_0_var(--ink)]'
                      : 'border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink-2)] hover:border-[var(--ink-2)]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Cultural Interests */}
          <div className="space-y-1.5">
            <label className="block text-[var(--ink-2)] uppercase font-bold text-[10px] flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Cultural Identity & Interests
            </label>

            {/* Current tags */}
            {culturalInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {culturalInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 border border-[var(--clay)]/30 bg-[var(--clay)]/5 text-[var(--clay)] px-2 py-0.5 text-[10px] font-mono font-bold"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add custom interest */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addInterest(newInterest)
                  }
                }}
                placeholder="Type and press Enter..."
                maxLength={40}
                className="flex-1 border border-[var(--line)] bg-[var(--paper-2)] px-3 py-1.5 text-xs font-sans text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1">
              {CULTURAL_INTEREST_SUGGESTIONS.filter((s) => !culturalInterests.includes(s))
                .slice(0, 8)
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addInterest(suggestion)}
                    className="border border-dashed border-[var(--line)] bg-transparent text-[var(--ink-2)] px-2 py-0.5 text-[9px] font-mono hover:border-[var(--clay)] hover:text-[var(--clay)] transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
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
              disabled={isSaving || isUploading || isHandleBlocked}
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
