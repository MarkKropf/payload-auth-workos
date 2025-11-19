import type { CollectionConfig, Field } from 'payload'
import { createWorkOSStrategy } from '../lib/strategy.js'
import { createUsersCollection } from '../collections/createUsersCollection.js'

/**
 * Higher-order function that configures a collection for WorkOS user management
 *
 * This function takes a partial collection configuration and returns a complete
 * collection config with all necessary fields and auth strategies for WorkOS.
 *
 * @param incomingCollection - Partial collection config (fields are optional)
 * @returns Complete collection configuration
 *
 * @example
 * ```ts
 * export const Users: CollectionConfig = withUsersCollection({
 *   slug: 'users',
 *   // Optional: add custom fields, hooks, access control, etc.
 * })
 * ```
 */
export const withUsersCollection = (
  incomingCollection: Omit<CollectionConfig, 'fields'> & {
    fields?: Field[]
  },
): CollectionConfig => {
  // Create the WorkOS authentication strategy for this collection
  const workosStrategy = createWorkOSStrategy(incomingCollection.slug)

  // Get base configuration from createUsersCollection helper
  // Pass false for isAdmin initially, as we merge the incoming auth config below
  const baseConfig = createUsersCollection(incomingCollection.slug, false)
  const workosFields = baseConfig.fields || []

  // Merge incoming fields with WorkOS fields
  // We prioritize incoming fields but ensure WorkOS fields exist
  const existingFieldNames = new Set((incomingCollection.fields || []).map((f) => 'name' in f ? f.name : null))
  const newFields = workosFields.filter((f) => {
    const name = 'name' in f ? f.name : null
    return name && !existingFieldNames.has(name)
  })

  const fields = [...(incomingCollection.fields || []), ...newFields]

  // Configure auth strategy
  let authConfig = incomingCollection.auth

  // If auth is not disabled (false), ensure our strategy is added
  if (authConfig !== false) {
    if (authConfig === true || authConfig === undefined) {
      // Default auth config if set to true or undefined
      authConfig = {
        strategies: [workosStrategy],
      }
    } else if (typeof authConfig === 'object') {
      // Append to existing strategies
      authConfig = {
        ...authConfig,
        strategies: [
          ...(authConfig.strategies || []),
          workosStrategy,
        ],
      }
    }
  }

  return {
    ...incomingCollection,
    fields,
    auth: authConfig,
    // Merge admin config if needed, keeping defaults if not overridden
    admin: {
      ...baseConfig.admin,
      ...incomingCollection.admin,
    },
  }
}
