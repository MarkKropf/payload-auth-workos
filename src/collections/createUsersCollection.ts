import type { CollectionConfig } from 'payload'

/**
 * Creates or extends a users collection with WorkOS authentication fields
 */
export function createUsersCollection(
  slug: string,
  isAdmin: boolean = false,
): CollectionConfig {
  return {
    slug,
    admin: {
      useAsTitle: 'email',
    },
    auth: isAdmin
      ? {
          // For admin collections, we'll use Payload's built-in auth
          // but tie it to WorkOS for login
          tokenExpiration: 7200, // 2 hours
          verify: false,
          maxLoginAttempts: 5,
          lockTime: 600000, // 10 minutes
        }
      : false,
    fields: [
      {
        name: 'email',
        type: 'email',
        required: true,
        unique: true,
      },
      {
        name: 'firstName',
        type: 'text',
      },
      {
        name: 'lastName',
        type: 'text',
      },
      {
        name: 'profilePictureUrl',
        type: 'text',
      },
      {
        name: 'workosUserId',
        type: 'text',
        unique: true,
        index: true,
        admin: {
          readOnly: true,
        },
      },
    ],
  }
}
