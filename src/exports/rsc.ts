/**
 * React Server Component exports for the Payload Auth WorkOS plugin
 * These exports are used for server-side rendering in Next.js
 */

// Re-export plugin configuration and types
export { authPlugin } from '../plugin.js'
export type { AuthPluginConfig, WorkOSProviderConfig, AuthPlugin } from '../types.js'

// Re-export server-side utilities
export {
  generateUserToken,
  getExpiredPayloadCookie,
  getPayloadCookie,
} from '../lib/session.js'
export { createWorkOSStrategy } from '../lib/strategy.js'
export {
  exchangeCodeForToken,
  getAuthorizationUrl,
  getUserInfo,
  refreshAccessToken,
} from '../lib/workos.js'
