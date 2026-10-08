/**
 * api/cultures.js
 *
 * Serverless handler for /api/cultures and /api/cultures/master
 */

import { handleCultureMasterQuery } from '../server/api/routes/cultureMaster.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleCultureMasterQuery(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
