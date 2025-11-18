import type { WorkOSProviderConfig } from '../types.js'

/**
 * Initialize WorkOS client with the provided configuration
 */
export function createWorkOSClient(config: WorkOSProviderConfig) {
  // Validate configuration (relaxed in test environment)
  const isTest = process.env.NODE_ENV === 'test'

  if (!config.client_id && !isTest) {
    throw new Error('WorkOS client_id is required')
  }
  if (!config.client_secret && !isTest) {
    throw new Error('WorkOS client_secret is required')
  }
  if (!isTest && (!config.cookie_password || config.cookie_password.length < 32)) {
    throw new Error('WorkOS cookie_password must be at least 32 characters long')
  }

  // Note: redirect_uri is auto-generated from the plugin name and useAdmin config
  return {
    clientId: config.client_id,
    clientSecret: config.client_secret,
    cookiePassword: config.cookie_password,
  }
}

/**
 * Generate authorization URL for WorkOS OAuth flow
 */
export function getAuthorizationUrl(
  config: WorkOSProviderConfig,
  redirectUri: string,
  state?: string,
): string {
  const params = new URLSearchParams({
    client_id: config.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
  })

  // Add connection selector (required by WorkOS)
  if (config.provider) {
    params.append('provider', config.provider)
  } else if (config.connection) {
    params.append('connection', config.connection)
  } else if (config.organization) {
    params.append('organization', config.organization)
  } else {
    throw new Error(
      'WorkOS requires either provider, connection, or organization to be specified in the configuration',
    )
  }

  if (state) {
    params.append('state', state)
  }

  return `https://api.workos.com/user_management/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  config: WorkOSProviderConfig,
  code: string,
): Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
  user: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    profile_picture_url?: string
    organization_id?: string
  }
}> {
  const response = await fetch('https://api.workos.com/user_management/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.client_secret}`,
    },
    body: JSON.stringify({
      client_id: config.client_id,
      client_secret: config.client_secret,
      grant_type: 'authorization_code',
      code,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  return response.json()
}

/**
 * Get user info from WorkOS using access token
 */
export async function getUserInfo(
  config: WorkOSProviderConfig,
  accessToken: string,
): Promise<{
  id: string
  email: string
  first_name?: string
  last_name?: string
  profile_picture_url?: string
  organization_id?: string
}> {
  const response = await fetch('https://api.workos.com/user_management/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user info: ${error}`)
  }

  return response.json()
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  config: WorkOSProviderConfig,
  refreshToken: string,
): Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
}> {
  const response = await fetch('https://api.workos.com/user_management/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.client_secret}`,
    },
    body: JSON.stringify({
      client_id: config.client_id,
      client_secret: config.client_secret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh access token: ${error}`)
  }

  return response.json()
}
