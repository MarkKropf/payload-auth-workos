import type { CollectionConfig } from 'payload'

/**
 * Creates an accounts collection to store WorkOS account linkages
 * This allows tracking OAuth connections and provider-specific data
 */
export function createAccountsCollection(
  slug: string,
  usersCollectionSlug: string,
): CollectionConfig {
  return {
    slug,
    admin: {
      useAsTitle: 'providerAccountId',
      hidden: true, // Usually not needed in admin UI
    },
    fields: [
      {
        name: 'user',
        type: 'relationship',
        relationTo: usersCollectionSlug as any,
        required: true,
        index: true,
      },
      {
        name: 'provider',
        type: 'text',
        required: true,
        defaultValue: 'workos',
      },
      {
        name: 'providerAccountId',
        type: 'text',
        required: true,
        index: true,
      },
      {
        name: 'organizationId',
        type: 'text',
        index: true,
      },
      {
        name: 'accessToken',
        type: 'text',
        admin: {
          hidden: true,
        },
      },
      {
        name: 'refreshToken',
        type: 'text',
        admin: {
          hidden: true,
        },
      },
      {
        name: 'expiresAt',
        type: 'date',
      },
      {
        name: 'metadata',
        type: 'json',
      },
    ],
  }
}
