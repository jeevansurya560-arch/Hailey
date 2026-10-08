import { verifyAuth } from '../../security/authorization/auth.js'

/**
 * Middleware helper for route handlers to enforce authentication.
 * Attaches user to req.user on success.
 */
export async function requireAuth(req, res) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  const { user, error } = await verifyAuth(authHeader)

  if (error || !user) {
    res.status(401).json({ error: error || 'Authentication required' })
    return null
  }

  req.user = user
  return user
}

export default requireAuth
