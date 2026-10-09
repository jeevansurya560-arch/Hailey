import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AuthContext } from './types'
import { getAppUrl } from './utils/urlUtils'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
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
  const signUp = async (email, password, optionsOrHandle = {}) => {
    let metadata = {}
    if (typeof optionsOrHandle === 'string') {
      metadata = { handle: optionsOrHandle }
    } else if (optionsOrHandle && typeof optionsOrHandle === 'object') {
      metadata = optionsOrHandle
    }

    const trimmedEmail = typeof email === 'string' ? email.trim() : email
    const fallbackHandle = trimmedEmail?.split('@')[0] || 'user'
    const handle = metadata.handle ? metadata.handle.toLowerCase().trim() : fallbackHandle
    const fullName = metadata.fullName ? metadata.fullName.trim() : undefined
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
          terms_accepted_at: metadata.termsAcceptedAt || new Date().toISOString(),
          terms_version: metadata.termsVersion || 'v1.0',
          is_minor: typeof metadata.isMinor === 'boolean' ? metadata.isMinor : false,
          declared_birth_year: metadata.declaredBirthYear,
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
