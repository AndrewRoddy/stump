const CLIENT_ID = process.env.PATREON_CLIENT_ID
const CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET
const PORT = parseInt(process.env.PORT ?? '3001')
const REDIRECT_URI = process.env.PATREON_REDIRECT_URI ?? `http://localhost:${PORT}/api/auth/patreon/callback`
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing PATREON_CLIENT_ID or PATREON_CLIENT_SECRET in .env')
  process.exit(1)
}

export default {
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/api/auth/patreon/login') {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'identity identity[email]',
      })
      return Response.redirect(`https://www.patreon.com/oauth2/authorize?${params}`, 302)
    }

    if (url.pathname === '/api/auth/patreon/callback') {
      const code = url.searchParams.get('code')
      if (!code) return Response.redirect(`${FRONTEND_URL}?auth_error=no_code`, 302)

      try {
        const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
          }).toString(),
        })
        const tokenData = await tokenRes.json()

        if (!tokenData.access_token) {
          console.error('Token exchange failed:', tokenData)
          return Response.redirect(`${FRONTEND_URL}?auth_error=token_failed`, 302)
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
        return Response.redirect(`${FRONTEND_URL}?patreon_user=${encodeURIComponent(encoded)}`, 302)
      } catch (err) {
        console.error('OAuth callback error:', err)
        return Response.redirect(`${FRONTEND_URL}?auth_error=callback_failed`, 302)
      }
    }

    return new Response('Not found', { status: 404 })
  },
}
