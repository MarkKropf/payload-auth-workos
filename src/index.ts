/**
 * Payload CMS Authentication Plugin for WorkOS
 *
 * This plugin provides seamless integration between Payload CMS and WorkOS authentication,
 * allowing you to add OAuth-based user authentication to your Payload applications.
 *
 * @packageDocumentation
 */

export { authPlugin } from './plugin.js'
export type { AuthPluginConfig, WorkOSProviderConfig, AuthPlugin } from './types.js'
export { createUsersCollection } from './collections/createUsersCollection.js'
export { createAccountsCollection } from './collections/createAccountsCollection.js'
export {
  generateUserToken,
  getExpiredPayloadCookie,
  getExpiredPayloadCookies,
  getPayloadCookie,
  getPayloadCookies,
} from './lib/session.js'
export { createWorkOSStrategy } from './lib/strategy.js'
export {
  exchangeCodeForToken,
  getAuthorizationUrl,
  getUserInfo,
  refreshAccessToken,
} from './lib/workos.js'
export { createWorkOSProviderConfig } from './lib/helpers.js'

// Collection utilities for manual configuration
export { withAccountCollection } from './collection/index.js'
export { deleteLinkedAccounts } from './collection/hooks.js'
