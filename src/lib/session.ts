import type { Payload } from 'payload'
import { getFieldsToSign, jwtSign } from 'payload'

/**
 * Generate a Payload JWT token for a user
 * This is a helper to create authenticated sessions using Payload v3 API
 */
export async function generateUserToken(
  payload: Payload,
  collectionSlug: string,
  userId: string | number,
): Promise<{ token: string; exp: number }> {
  try {
    // Get the user document
    const user = await payload.findByID({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter
      collection: collectionSlug as any,
      id: userId,
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get the collection config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload's collections object uses dynamic keys
    const collection = (payload.collections as any)[collectionSlug]

    if (!collection || !collection.config.auth) {
      throw new Error('Collection does not have auth enabled')
    }

    // Get fields to sign using Payload's helper
    // Augment user object with collection property required by Payload
    const userWithCollection = {
      ...user,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter
      collection: collectionSlug as any,
    }

    const fieldsToSign = getFieldsToSign({
      collectionConfig: collection.config,
      email: user.email as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload's getFieldsToSign requires augmented user type
      user: userWithCollection as any,
    })

    // Sign the JWT using Payload's jwtSign function
    const { token, exp } = await jwtSign({
      fieldsToSign,
      secret: payload.secret,
      tokenExpiration: collection.config.auth.tokenExpiration || 7200, // 2 hours default
    })

    return { token, exp }
  } catch (error) {
    // eslint-disable-next-line no-console -- Legitimate error logging for debugging
    console.error('Error generating user token:', error)
    throw error
  }
}

/**
 * Generate Payload session cookie strings
 * Creates cookies compatible with Payload v3's auth system
 *
 * For admin collections (config.admin.user), this creates the standard `payload-token` cookie.
 * For non-admin collections, creates a collection-specific `payload-token-{collectionSlug}` cookie.
 */
export function getPayloadCookies(
  payload: Payload,
  collectionSlug: string,
  token: string,
): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload's collections object uses dynamic keys
  const collection = (payload.collections as any)[collectionSlug]

  if (!collection || !collection.config.auth) {
    throw new Error('Collection does not have auth enabled')
  }

  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const authConfig = collection.config.auth
  const tokenExpiration = authConfig.tokenExpiration || 7200 // 2 hours default
  const isAdminCollection = payload.config.admin?.user === collectionSlug

  // Helper to build cookie string
  const buildCookie = (cookieName: string): string => {
    const attributes: string[] = [
      `${cookieName}=${token}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${tokenExpiration}`,
    ]

    // Add SameSite attribute
    if (authConfig.cookies?.sameSite) {
      attributes.push(`SameSite=${authConfig.cookies.sameSite}`)
    } else {
      attributes.push('SameSite=Lax')
    }

    // Add Secure attribute (true in production or if explicitly configured)
    const isSecure =
      authConfig.cookies?.secure !== undefined
        ? authConfig.cookies.secure
        : process.env.NODE_ENV === 'production'

    if (isSecure) {
      attributes.push('Secure')
    }

    // Add Domain if configured
    if (authConfig.cookies?.domain) {
      attributes.push(`Domain=${authConfig.cookies.domain}`)
    }

    return attributes.join('; ')
  }

  const cookies: string[] = []

  // For admin collection, use standard payload-token
  // For non-admin collections, use collection-specific cookie
  const cookieName = isAdminCollection
    ? `${cookiePrefix}-token`
    : `${cookiePrefix}-token-${collectionSlug}`

  cookies.push(buildCookie(cookieName))

  return cookies
}

/**
 * Generate a Payload session cookie string
 * Creates a cookie compatible with Payload v3's auth system
 *
 * @deprecated Use getPayloadCookies instead to support multiple auth collections
 */
export function getPayloadCookie(
  payload: Payload,
  collectionSlug: string,
  token: string,
): string {
  // Return the first cookie for backward compatibility
  return getPayloadCookies(payload, collectionSlug, token)[0]
}

/**
 * Generate expired Payload cookies for sign-out
 * Creates expired cookies to clear the session
 *
 * For admin collections, clears the standard `payload-token` cookie.
 * For non-admin collections, clears the collection-specific `payload-token-{collectionSlug}` cookie.
 */
export function getExpiredPayloadCookies(
  payload: Payload,
  collectionSlug: string,
): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload's collections object uses dynamic keys
  const collection = (payload.collections as any)[collectionSlug]

  if (!collection || !collection.config.auth) {
    throw new Error('Collection does not have auth enabled')
  }

  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const authConfig = collection.config.auth
  const isAdminCollection = payload.config.admin?.user === collectionSlug

  // Helper to build expired cookie string (must match attributes from buildCookie)
  const buildExpiredCookie = (cookieName: string): string => {
    const attributes: string[] = [
      `${cookieName}=`,
      'HttpOnly',
      'Path=/',
      'Max-Age=0',
    ]

    // Add SameSite attribute (must match the original cookie)
    if (authConfig.cookies?.sameSite) {
      attributes.push(`SameSite=${authConfig.cookies.sameSite}`)
    } else {
      attributes.push('SameSite=Lax')
    }

    // Add Secure attribute if it was set on the original cookie
    const isSecure =
      authConfig.cookies?.secure !== undefined
        ? authConfig.cookies.secure
        : process.env.NODE_ENV === 'production'

    if (isSecure) {
      attributes.push('Secure')
    }

    // Add Domain if configured (must match the original cookie)
    if (authConfig.cookies?.domain) {
      attributes.push(`Domain=${authConfig.cookies.domain}`)
    }

    return attributes.join('; ')
  }

  const cookies: string[] = []

  // For admin collection, use standard payload-token
  // For non-admin collections, use collection-specific cookie
  const cookieName = isAdminCollection
    ? `${cookiePrefix}-token`
    : `${cookiePrefix}-token-${collectionSlug}`

  cookies.push(buildExpiredCookie(cookieName))

  return cookies
}

/**
 * Generate an expired Payload cookie for sign-out
 * Creates an expired cookie to clear the session
 *
 * @deprecated Use getExpiredPayloadCookies instead to support multiple auth collections
 */
export function getExpiredPayloadCookie(
  payload: Payload,
  collectionSlug: string,
): string {
  // Return the first cookie for backward compatibility
  return getExpiredPayloadCookies(payload, collectionSlug)[0]
}
