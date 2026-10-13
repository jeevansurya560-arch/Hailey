import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AuthContext } from './types'
import { getAppUrl } from './utils/urlUtils'

import { ensureUserProfile } from '@/features/profile/services/profileService'

function getInitialOAuthError() {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash ? window.location.hash.substring(1) : ''
  const hashParams = new URLSearchParams(hash)
  const searchParams = new URLSearchParams(window.location.search)
  const errorDesc = hashParams.get('error_description') || searchParams.get('error_description')
  const errCode = hashParams.get('error_code') || searchParams.get('error_code')
  const err = hashParams.get('error') || searchParams.get('error')

  if (errorDesc || err) {
    return errorDesc
      ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
      : `Authentication failed (${errCode || err})`
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [oauthError, setOauthError] = useState(getInitialOAuthError)

  useEffect(() => {

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          ensureUserProfile(session.user).catch(() => {})
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setOauthError(null)
        ensureUserProfile(session.user).catch(() => {})
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * Registers a new user with Supabase Auth.
   *
   * @param {string} email
   * @param {string} password
   * @param {string | {
   *   handle?: string,
   *   fullName?: string,
   *   termsAcceptedAt?: string,
   *   termsVersion?: string,
   *   isMinor?: boolean,
   *   declaredBirthYear?: number,
   *   emailRedirectTo?: string,
   *   redirectTo?: string
   * }} [optionsOrHandle]
   * @returns {Promise<{ data?: any, error: any }>}
   */
  const signUp = async (email, password, optionsOrHandle = {}, legacyName) => {
    let metadata = {}
    if (typeof optionsOrHandle === 'string') {
      metadata = { handle: optionsOrHandle, fullName: legacyName }
    } else if (optionsOrHandle && typeof optionsOrHandle === 'object') {
      metadata = optionsOrHandle
    }

    const trimmedEmail = typeof email === 'string' ? email.trim() : email
    const fallbackHandle = trimmedEmail?.split('@')[0] || 'user'
    const handle = metadata.handle ? metadata.handle.toLowerCase().trim() : fallbackHandle
    const rawName = metadata.fullName || metadata.name || legacyName
    const fullName = rawName ? String(rawName).trim() : undefined
    const emailRedirectTo =
      metadata.emailRedirectTo ||
      metadata.redirectTo ||
      getAppUrl('/login')

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          handle,
          full_name: fullName,
          name: fullName,
          display_name: fullName,
          terms_accepted_at: metadata.termsAcceptedAt || new Date().toISOString(),
          terms_version: metadata.termsVersion || 'v1.0',
          is_minor: typeof metadata.isMinor === 'boolean' ? metadata.isMinor : false,
          declared_birth_year: metadata.declaredBirthYear,
          ...(metadata.birthDate || metadata.birth_date || metadata.date_of_birth
            ? {
                birth_date: metadata.birthDate || metadata.birth_date || metadata.date_of_birth,
                date_of_birth: metadata.birthDate || metadata.birth_date || metadata.date_of_birth,
              }
            : {}),
        },
      },
    })
    return { data, error }
  }

  /**
   * Signs in an existing user with email and password.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ data?: any, error: any }>}
   */
  const signIn = async (email, password) => {
    const trimmedEmail = typeof email === 'string' ? email.trim() : email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    return { data, error }
  }

  /**
   * Initiates Google OAuth authentication flow.
   *
   * @param {Object} [options]
   * @param {string} [options.redirectTo]
   * @returns {Promise<{ data: any, error: any }>}
   */
  const signInWithGoogle = async (options = {}) => {
    const redirectTo = options.redirectTo || getAppUrl('/')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { data, error }
  }

  /**
   * Sends a real password reset email via Supabase Auth.
   *
   * @param {string} email
   * @param {Object} [options]
   * @param {string} [options.redirectTo]
   * @returns {Promise<{ data: any, error: any }>}
   */
  const resetPasswordForEmail = async (email, options = {}) => {
    const trimmedEmail = typeof email === 'string' ? email.trim() : email
    const redirectTo = options.redirectTo || getAppUrl('/reset-password')

    const { data, error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    })
    return { data, error }
  }

  /**
   * Updates the password for the current authenticated recovery session.
   *
   * @param {string} newPassword
   * @returns {Promise<{ data: any, error: any }>}
   */
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }

  /**
   * Validates whether a contributor handle is already taken.
   *
   * @param {string} handle
   * @returns {Promise<{ available: boolean, error: any }>}
   */
  const checkHandleAvailability = async (handle) => {
    if (!handle || typeof handle !== 'string') {
      return { available: false, error: null }
    }
    const normalized = handle.toLowerCase().trim()
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', normalized)
        .maybeSingle()

      if (error) {
        return { available: false, error }
      }
      return { available: !data, error: null }
    } catch (err) {
      return { available: false, error: err }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        oauthError,
        clearOAuthError: () => setOauthError(null),
        signUp,
        signIn,
        signInWithGoogle,
        resetPasswordForEmail,
        updatePassword,
        checkHandleAvailability,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
