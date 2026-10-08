/**
 * Health check endpoint handler
 */
export default function healthRoute(_req, res) {
  res.status(200).json({ ok: true })
}
