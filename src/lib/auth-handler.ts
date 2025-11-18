import type { Payload } from 'payload'
import type { AuthPluginConfig } from '../types.js'
import { exchangeCodeForToken } from './workos.js'

/**
 * Handle OAuth callback and create/update user
 */
export async function handleAuthCallback(
  payload: Payload,
  config: AuthPluginConfig,
  code: string,
  req: Request,
): Promise<{
  user: Record<string, unknown> & { id: string | number }
  token?: string
}> {
  try {
    // Exchange code for token and get user info
    const authResult = await exchangeCodeForToken(config.workosProvider, code)
    const workosUser = authResult.user

    // Check if user already exists by WorkOS user ID
    const existingUsers = await payload.find({
      collection: config.usersCollectionSlug as any,
      where: {
        workosUserId: {
          equals: workosUser.id,
        },
      },
      limit: 1,
    })

    let userId: string | number
    let user: Record<string, unknown> & { id: string | number }

    if (existingUsers.docs.length > 0) {
      // Update existing user
      userId = existingUsers.docs[0].id
      user = (await payload.update({
        collection: config.usersCollectionSlug as any,
        id: userId,
        data: {
          email: workosUser.email,
          firstName: workosUser.first_name,
          lastName: workosUser.last_name,
          profilePictureUrl: workosUser.profile_picture_url,
        },
      })) as Record<string, unknown> & { id: string | number }
    } else {
      // Check if sign-up is allowed
      if (config.allowSignUp === false) {
        throw new Error('Sign-up is not allowed')
      }

      // Check if user exists by email
      const existingUserByEmail = await payload.find({
        collection: config.usersCollectionSlug as any,
        where: {
          email: {
            equals: workosUser.email,
          },
        },
        limit: 1,
      })

      if (existingUserByEmail.docs.length > 0) {
        // Link WorkOS account to existing user
        userId = existingUserByEmail.docs[0].id
        user = (await payload.update({
          collection: config.usersCollectionSlug as any,
          id: userId,
          data: {
            workosUserId: workosUser.id,
            firstName: workosUser.first_name,
            lastName: workosUser.last_name,
            profilePictureUrl: workosUser.profile_picture_url,
          },
        })) as Record<string, unknown> & { id: string | number }
      } else {
        // Create new user
        user = (await payload.create({
          collection: config.usersCollectionSlug as any,
          data: {
            email: workosUser.email,
            firstName: workosUser.first_name,
            lastName: workosUser.last_name,
            profilePictureUrl: workosUser.profile_picture_url,
            workosUserId: workosUser.id,
          },
        })) as Record<string, unknown> & { id: string | number }
        userId = user.id
      }
    }

    // Create or update account record
    const existingAccount = await payload.find({
      collection: config.accountsCollectionSlug as any,
      where: {
        and: [
          {
            user: {
              equals: userId,
            },
          },
          {
            provider: {
              equals: 'workos',
            },
          },
        ],
      },
      limit: 1,
    })

    const expiresAt = authResult.expires_in
      ? new Date(Date.now() + authResult.expires_in * 1000)
      : undefined

    if (existingAccount.docs.length > 0) {
      await payload.update({
        collection: config.accountsCollectionSlug as any,
        id: existingAccount.docs[0].id,
        data: {
          accessToken: authResult.access_token,
          refreshToken: authResult.refresh_token,
          expiresAt,
          providerAccountId: workosUser.id,
          organizationId: workosUser.organization_id,
        },
      })
    } else {
      await payload.create({
        collection: config.accountsCollectionSlug as any,
        data: {
          user: userId,
          provider: 'workos',
          providerAccountId: workosUser.id,
          organizationId: workosUser.organization_id,
          accessToken: authResult.access_token,
          refreshToken: authResult.refresh_token,
          expiresAt,
        },
      })
    }

    // For admin collections, we need to handle Payload's authentication
    // We'll let the endpoint handler manage the session/token setting
    // since Payload's auth system expects specific request handling
    let token: string | undefined
    if (config.useAdmin) {
      // The user object will be attached to the request by the endpoint handler
      // Payload's auth middleware will handle token generation
      token = undefined // Will be set by the endpoint handler
    }

    // Call custom success handler if provided
    if (config.onSuccess) {
      await config.onSuccess({
        user,
        session: authResult,
        req,
      })
    }

    return {
      user,
      token,
    }
  } catch (error) {
    // Call custom error handler if provided
    if (config.onError) {
      await config.onError({
        error: error as Error,
        req,
      })
    }
    throw error
  }
}
