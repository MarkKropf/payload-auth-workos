import type { Endpoint, PayloadRequest } from 'payload'
import type { AuthPluginConfig } from '../types.js'
import { handleAuthCallback } from '../lib/auth-handler.js'
import { generateUserToken, getExpiredPayloadCookies, getPayloadCookies } from '../lib/session.js'
import { getAuthorizationUrl } from '../lib/workos.js'

/**
 * Get the base URL from the request
 */
function getBaseUrl(req: PayloadRequest): string {
  // Try to get from headers first
  const host = req.headers.get('host')
  const protocol = req.headers.get('x-forwarded-proto') || 'http'

  if (host) {
    return `${protocol}://${host}`
  }

  // Fallback to 127.0.0.1 (WorkOS requires this instead of localhost)
  return 'http://127.0.0.1:3000'
}

/**
 * Construct the OAuth redirect URI for this auth configuration
 */
function getRedirectUri(req: PayloadRequest, config: AuthPluginConfig, apiPrefix: string): string {
  const baseUrl = getBaseUrl(req)
  // Endpoints are accessed through the API prefix (e.g., /api/admin/auth/callback)
  return `${baseUrl}${apiPrefix}/${config.name}/auth/callback`
}

/**
 * Create authentication endpoints for the plugin
 */
export function createAuthEndpoints(config: AuthPluginConfig, apiPrefix: string = '/api'): Endpoint[] {
  // Endpoints are registered WITHOUT the API prefix
  // Payload automatically handles matching against the full path
  const namespace = config.name

  const endpoints: Endpoint[] = [
    // Sign in endpoint - redirects to WorkOS
    {
      path: `/${namespace}/auth/signin`,
      method: 'get',
      handler: async (req) => {
        try {
          // Generate secure random state for CSRF protection
          const state = crypto.randomUUID()

          const redirectUri = getRedirectUri(req, config, apiPrefix)
          const authUrl = getAuthorizationUrl(config.workosProvider, redirectUri, state)

          // Store state in httpOnly cookie for verification
          const headers = new Headers({
            Location: authUrl,
            'Set-Cookie': `workos_state_${config.name}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`, // 10 minute expiry
          })

          return new Response(null, {
            status: 302,
            headers,
          })
        } catch (error) {
          const baseUrl = getBaseUrl(req)
          const errorPath = config.errorRedirectPath || '/auth/error'
          const errorMessage = error instanceof Error ? error.message : 'Failed to initiate authentication'
          const returnUrl = `${apiPrefix}/${namespace}/auth/signin`
          const errorUrl = `${baseUrl}${errorPath}?error=signin_failed&message=${encodeURIComponent(errorMessage)}&returnUrl=${encodeURIComponent(returnUrl)}`
          return Response.redirect(errorUrl, 302)
        }
      },
    },

    // Callback endpoint - handles OAuth redirect
    {
      path: `/${namespace}/auth/callback`,
      method: 'get',
      handler: async (req) => {
        try {
          const { code, state } = req.query as { code?: string; state?: string }

          if (!code) {
            throw new Error('Missing authorization code')
          }

          // Verify state parameter for CSRF protection
          const cookieHeader = req.headers.get('cookie')
          const cookies = cookieHeader ? Object.fromEntries(
            cookieHeader.split('; ').map(c => {
              const [key, ...values] = c.split('=')
              return [key, values.join('=')]
            })
          ) : {}
          const storedState = cookies[`workos_state_${config.name}`]

          if (!state || !storedState || state !== storedState) {
            throw new Error('Invalid state parameter - possible CSRF attack')
          }

          // Handle the callback and create/update user
          const result = await handleAuthCallback(
            req.payload,
            config,
            code,
            req as unknown as Request,
          )

          // Prepare redirect with optional cookie
          const baseUrl = getBaseUrl(req)
          const redirectPath = config.successRedirectPath || '/'
          const redirectUrl = `${baseUrl}${redirectPath}`
          const headers = new Headers({
            Location: redirectUrl,
          })

          // Clear the state cookie
          headers.append('Set-Cookie', `workos_state_${config.name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)

          // Generate and set authentication token for all auth instances
          try {
            const { token } = await generateUserToken(
              req.payload,
              config.usersCollectionSlug,
              result.user.id,
            )

            // Generate Payload cookies using Payload v3's cookie generation
            // For admin collections, this creates both collection-specific and default cookies
            const cookies = getPayloadCookies(
              req.payload,
              config.usersCollectionSlug,
              token,
            )

            // Set cookie headers (may be multiple for admin collections)
            cookies.forEach((cookie) => {
              headers.append('Set-Cookie', cookie)
            })
          } catch (_error) {
            // Continue without token - user is still created/updated
          }

          return new Response(null, {
            status: 302,
            headers,
          })
        } catch (error) {

          if (config.onError) {
            await config.onError({
              error: error as Error,
              req: req as unknown as Request,
            })
          }

          const baseUrl = getBaseUrl(req)
          const errorPath = config.errorRedirectPath || '/auth/error'
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed'

          // Determine error type from the error message
          let errorType = 'callback_error'
          if (errorMessage.includes('Missing authorization code')) {
            errorType = 'missing_code'
          } else if (errorMessage.includes('Sign-up is not allowed')) {
            errorType = 'signup_disabled'
          } else if (errorMessage.includes('token') || errorMessage.includes('exchange')) {
            errorType = 'token_exchange_failed'
          }

          const returnUrl = `${apiPrefix}/${namespace}/auth/signin`
          const errorUrl = `${baseUrl}${errorPath}?error=${errorType}&message=${encodeURIComponent(errorMessage)}&returnUrl=${encodeURIComponent(returnUrl)}`
          return Response.redirect(errorUrl, 302)
        }
      },
    },

    // Sign out endpoint
    {
      path: `/${namespace}/auth/signout`,
      method: 'get',
      handler: async (req) => {
        try {
          // Generate expired cookies using Payload's cookie generation
          // For admin collections, this clears both collection-specific and default cookies
          const expiredCookies = getExpiredPayloadCookies(
            req.payload,
            config.usersCollectionSlug,
          )

          // Redirect to home or login page with cookies cleared
          const baseUrl = getBaseUrl(req)
          const redirectPath = config.useAdmin ? '/admin/login' : '/'
          const redirectUrl = `${baseUrl}${redirectPath}`
          const headers = new Headers({
            Location: redirectUrl,
          })

          // Clear all cookies (may be multiple for admin collections)
          expiredCookies.forEach((cookie) => {
            headers.append('Set-Cookie', cookie)
          })

          return new Response(null, {
            status: 302,
            headers,
          })
        } catch (error) {
          const baseUrl = getBaseUrl(req)
          const errorPath = config.errorRedirectPath || '/auth/error'
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign out'
          const returnUrl = config.useAdmin ? '/admin/login' : '/'
          const errorUrl = `${baseUrl}${errorPath}?error=signout_failed&message=${encodeURIComponent(errorMessage)}&returnUrl=${encodeURIComponent(returnUrl)}`
          return Response.redirect(errorUrl, 302)
        }
      },
    },

    // Session endpoint - check if user is authenticated
    {
      path: `/${namespace}/auth/session`,
      method: 'get',
      handler: async (req) => {
        try {
          // Check if user is authenticated via Payload
          if (req.user) {
            return Response.json({
              user: req.user,
              authenticated: true,
            })
          } else {
            return Response.json({
              authenticated: false,
            })
          }
        } catch {
          return Response.json(
            {
              error: 'Failed to check session',
            },
            { status: 500 },
          )
        }
      },
    },
  ]

  // Note: Logout endpoint is now handled at the collection level
  // See createUsersCollection.ts for the collection-level logout endpoint override

  return endpoints
}
