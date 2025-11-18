import type { WorkOSProviderConfig } from '../types.js'

/**
 * Create a WorkOS provider configuration
 *
 * @param provider - The OAuth provider to use (e.g., 'GoogleOAuth', 'GitHubOAuth', 'MicrosoftOAuth')
 * @param config - WorkOS credentials (typically from environment variables)
 * @returns Validated WorkOS provider configuration object
 *
 * @example
 * ```ts
 * import { createWorkOSProviderConfig } from 'payload-auth-workos'
 *
 * // Create a shared WorkOS config from environment variables
 * const workosConfig = createWorkOSProviderConfig('GoogleOAuth', {
 *   client_id: process.env.WORKOS_CLIENT_ID!,
 *   client_secret: process.env.WORKOS_API_KEY!,
 *   cookie_password: process.env.WORKOS_COOKIE_PASSWORD!,
 * })
 *
 * // Use it in multiple auth instances
 * export default buildConfig({
 *   plugins: [
 *     authPlugin({
 *       name: 'admin',
 *       useAdmin: true,
 *       usersCollectionSlug: 'admin-users',
 *       accountsCollectionSlug: 'admin-accounts',
 *       workosProvider: workosConfig,
 *     }),
 *     authPlugin({
 *       name: 'app',
 *       usersCollectionSlug: 'app-users',
 *       accountsCollectionSlug: 'app-accounts',
 *       workosProvider: workosConfig,
 *     }),
 *   ],
 * })
 * ```
 */
export function createWorkOSProviderConfig(
  provider: string,
  config: {
    client_id: string
    client_secret: string
    cookie_password: string
    connection?: string
    organization?: string
  },
): WorkOSProviderConfig {
  // Validate required fields (relaxed in test environment)
  const isTest = process.env.NODE_ENV === 'test'

  if (!config.client_id && !isTest) {
    throw new Error(
      'client_id is required. Get your client ID from https://dashboard.workos.com/api-keys',
    )
  }

  if (!config.client_secret && !isTest) {
    throw new Error(
      'client_secret is required. Get your API key from https://dashboard.workos.com/api-keys',
    )
  }

  if (!isTest && (!config.cookie_password || config.cookie_password.length < 32)) {
    throw new Error('cookie_password is required and must be at least 32 characters long')
  }

  return {
    client_id: config.client_id,
    client_secret: config.client_secret,
    cookie_password: config.cookie_password,
    provider,
    connection: config.connection,
    organization: config.organization,
  }
}
