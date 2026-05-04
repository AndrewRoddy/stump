export default async function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] ?? 'http'
  const baseUrl = `${protocol}://${req.headers.host}`
  const redirectUri = process.env.PATREON_REDIRECT_URI
    ?? `${baseUrl}/api/auth/patreon/callback`

  const { code } = req.query
  if (!code) {
    res.redirect(302, `${baseUrl}/?auth_error=no_code`)
    return
  }

  try {
    const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.PATREON_CLIENT_ID,
        client_secret: process.env.PATREON_CLIENT_SECRET,
        redirect_uri: redirectUri,
      }).toString(),
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData)
      res.redirect(302, `${baseUrl}/?auth_error=token_failed`)
      return
    }

    const userRes = await fetch(
      'https://www.patreon.com/api/oauth2/v2/identity?fields[user]=full_name,image_url,email',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    )
    const userData = await userRes.json()

    const user = {
      id: userData.data.id,
      name: userData.data.attributes.full_name,
      avatar: userData.data.attributes.image_url ?? null,
      email: userData.data.attributes.email ?? null,
    }

    const encoded = Buffer.from(JSON.stringify(user)).toString('base64')
    res.redirect(302, `${baseUrl}/?patreon_user=${encodeURIComponent(encoded)}`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect(302, `${baseUrl}/?auth_error=callback_failed`)
  }
}
