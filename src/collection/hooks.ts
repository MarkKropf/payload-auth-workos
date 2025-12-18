import type { CollectionBeforeDeleteHook } from 'payload'

/**
 * Hook to delete linked accounts when a user is deleted
 * This ensures orphaned account records are cleaned up
 *
 * @param accountsSlug - The slug of the accounts collection to clean up
 * @returns A Payload before-delete hook
 *
 * @example
 * ```ts
 * export const Users: CollectionConfig = {
 *   slug: 'users',
 *   hooks: {
 *     beforeDelete: [deleteLinkedAccounts('accounts')],
 *   },
 *   // ... rest of config
 * }
 * ```
 */

export const deleteLinkedAccounts =
  (accountsSlug: string): CollectionBeforeDeleteHook =>
    async ({ req, id }) => {
      await req.payload.delete({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from user input
        collection: accountsSlug as any,
        where: {
          user: {
            equals: id,
          },
        },
        req,
      })
    }
