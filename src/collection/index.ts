import type { CollectionConfig, Field } from 'payload'

export { withUsersCollection } from './withUsersCollection.js'

/**
 * Higher-order function that configures a collection for WorkOS account management
 *
 * This function takes a partial collection configuration and returns a complete
 * collection config with all necessary fields for storing WorkOS OAuth account data.
 *
 * @param incomingCollection - Partial collection config (fields are optional)
 * @param usersCollectionSlug - The slug of the users collection to link accounts to
 * @returns Complete collection configuration
 *
 * @example
 * ```ts
 * export const Accounts: CollectionConfig = withAccountCollection(
 *   {
 *     slug: 'accounts',
 *     // Optional: add custom fields, hooks, access control, etc.
 *   },
 *   'users', // users collection slug
 * )
 * ```
 */
export const withAccountCollection = (
  incomingCollection: Omit<CollectionConfig, 'fields'> & {
    fields?: Field[]
  },
  usersCollectionSlug: string,
): CollectionConfig => {
  // Base fields required for WorkOS account management
  const baseFields: Field[] = [
    {
      name: 'user',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from user input
      relationTo: usersCollectionSlug as any,
      required: true,
      index: true,
      admin: {
        description: 'The user this account belongs to',
      },
    },
    {
      name: 'provider',
      type: 'text',
      required: true,
      defaultValue: 'workos',
      admin: {
        description: 'OAuth provider name (e.g., workos, google, github)',
      },
    },
    {
      name: 'providerAccountId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Unique identifier from the OAuth provider',
      },
    },
    {
      name: 'organizationId',
      type: 'text',
      index: true,
      admin: {
        description: 'WorkOS organization ID (for enterprise SSO)',
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      admin: {
        hidden: true,
        description: 'OAuth access token (hidden for security)',
      },
    },
    {
      name: 'refreshToken',
      type: 'text',
      admin: {
        hidden: true,
        description: 'OAuth refresh token (hidden for security)',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'When the access token expires',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional provider-specific data',
      },
    },
  ]

  // Merge incoming fields with base fields
  const fields = [...baseFields, ...(incomingCollection.fields || [])]

  // Default access control - authenticated users can read, admin access restricted
  const defaultAccess = {
    read: ({ req }: { req: { user?: unknown } }) => !!req.user,
    create: () => false, // Only created programmatically
    update: () => false, // Only updated programmatically
    delete: ({ req }: { req: { user?: unknown } }) => !!req.user, // Allow users to unlink accounts
  }

  // Default admin config
  const defaultAdmin = {
    useAsTitle: 'providerAccountId',
    defaultColumns: ['provider', 'providerAccountId', 'user'],
    description: 'OAuth account linkages for WorkOS authentication',
  }

  return {
    ...incomingCollection,
    fields,
    access: incomingCollection.access || defaultAccess,
    admin: {
      ...defaultAdmin,
      ...incomingCollection.admin,
    },
    timestamps: incomingCollection.timestamps !== false, // Default to true
  }
}
