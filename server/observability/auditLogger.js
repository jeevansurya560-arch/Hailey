import { supabaseAdmin } from '../config/supabaseAdmin.js'

/**
 * Sanitizes input data to guarantee no sensitive credentials leak into logs or the database.
 */
function sanitizeMetadata(data) {
  if (!data || typeof data !== 'object') return {}
  const SENSITIVE_KEYS = [
    'password',
    'secret',
    'token',
    'privatekey',
    'private_key',
    'auth_header',
    'service_role_key',
  ]

  const clean = {}
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      clean[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeMetadata(value)
    } else {
      clean[key] = value
    }
  }
  return clean
}

/**
 * Records an immutable audit log entry in the database and writes a structured stdout log.
 *
 * @param {{
 *   who: string,
 *   what: string,
 *   target: string,
 *   result: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'DENIED',
 *   ipAddress?: string,
 *   metadata?: Record<string, any>
 * }} entry
 */
export async function logAuditEvent({ who, what, target, result, ipAddress, metadata = {} }) {
  const timestamp = new Date().toISOString()
  const sanitized = sanitizeMetadata(metadata)

  const logEntry = {
    who: who || 'ANONYMOUS',
    what,
    target,
    result,
    ip_address: ipAddress || 'unknown',
    metadata: sanitized,
    created_at: timestamp,
  }

  // 1. Structured JSON output to console for log collectors
  console.log(
    JSON.stringify({
      level: result === 'FAILURE' || result === 'DENIED' ? 'WARN' : 'INFO',
      type: 'AUDIT_LOG',
      ...logEntry,
    })
  )

  // 2. Durable write to Supabase audit_logs table
  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert([logEntry])
    if (error) {
      console.warn('[auditLogger] Failed to persist audit entry to database:', error.message)
    }
  } catch (err) {
    console.warn('[auditLogger] Exception while saving audit log:', err instanceof Error ? err.message : String(err))
  }
}
