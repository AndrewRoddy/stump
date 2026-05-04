export default function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] ?? 'http'
  const redirectUri = process.env.PATREON_REDIRECT_URI
    ?? `${protocol}://${req.headers.host}/api/auth/patreon/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.PATREON_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'identity identity[email]',
  })
  res.redirect(302, `https://www.patreon.com/oauth2/authorize?${params}`)
}
