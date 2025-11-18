import type { CollectionAfterDeleteHook } from 'payload'

/**
 * Hook to delete linked accounts when a user is deleted
 * This ensures orphaned account records are cleaned up
 *
 * @param accountsSlug - The slug of the accounts collection to clean up
 * @returns A Payload after-delete hook
 *
 * @example
 * ```ts
 * export const Users: CollectionConfig = {
 *   slug: 'users',
 *   hooks: {
 *     afterDelete: [deleteLinkedAccounts('accounts')],
 *   },
 *   // ... rest of config
 * }
 * ```
 */
export const deleteLinkedAccounts =
  (accountsSlug: string): CollectionAfterDeleteHook =>
  async (args) => {
    const { payload } = args.req
    const { doc: user } = args

    // Delete all accounts linked to this user
    await payload.delete({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from user input
      collection: accountsSlug as any,
      where: {
        user: { equals: user.id },
      },
    })
  }
