import type { Config } from 'payload'

/**
 * WorkOS provider configuration
 */
export interface WorkOSProviderConfig {
  /**
   * WorkOS Client ID
   */
  client_id: string

  /**
   * WorkOS API Key (client secret)
   */
  client_secret: string

  /**
   * Cookie password for encrypting session cookies (minimum 32 characters)
   */
  cookie_password: string

  /**
   * OAuth provider to use (e.g., 'GoogleOAuth', 'GitHubOAuth', 'MicrosoftOAuth')
   * Alternative to connection or organization ID
   * @see https://workos.com/docs/reference/user-management/authentication/authorize
   */
  provider?: string

  /**
   * WorkOS connection ID (alternative to provider)
   */
  connection?: string

  /**
   * WorkOS organization ID (alternative to provider)
   */
  organization?: string
}

/**
 * Authentication plugin configuration
 */
export interface AuthPluginConfig {
  /**
   * Unique name for this auth configuration
   * Used to namespace routes and identify the auth instance
   */
  name: string

  /**
   * Whether to use this configuration for admin panel authentication
   * @default false
   */
  useAdmin?: boolean

  /**
   * Whether to allow new user sign-ups
   * @default false
   */
  allowSignUp?: boolean

  /**
   * Slug of the users collection
   */
  usersCollectionSlug: string

  /**
   * Slug of the accounts collection (stores WorkOS account linkages)
   */
  accountsCollectionSlug: string

  /**
   * Path to redirect to after successful authentication
   * @default '/'
   */
  successRedirectPath?: string

  /**
   * Path to redirect to on authentication error
   * @default '/auth/error'
   */
  errorRedirectPath?: string

  /**
   * WorkOS provider configuration
   */
  workosProvider: WorkOSProviderConfig

  /**
   * Custom callback handler for after user is authenticated
   * Receives the user object and WorkOS session
   */
  onSuccess?: (args: {
    user: Record<string, unknown>
    session: Record<string, unknown>
    req: Request
  }) => Promise<void> | void

  /**
   * Custom error handler
   */
  onError?: (args: {
    error: Error
    req: Request
  }) => Promise<void> | void
}

/**
 * Plugin function type
 */
export type AuthPlugin = (config: AuthPluginConfig) => (incomingConfig: Config) => Config
