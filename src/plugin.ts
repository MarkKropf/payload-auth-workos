import type { Config } from 'payload'
import type { AuthPluginConfig } from './types.js'
import { createAccountsCollection } from './collections/createAccountsCollection.js'
import { createUsersCollection } from './collections/createUsersCollection.js'
import { createAuthEndpoints } from './endpoints/index.js'
import { createWorkOSStrategy } from './lib/strategy.js'
import { createWorkOSClient } from './lib/workos.js'

/**
 * Payload authentication plugin for WorkOS
 *
 * This plugin integrates WorkOS authentication with Payload CMS,
 * allowing you to configure one or multiple user collections with OAuth-based authentication.
 *
 * @param config - Plugin configuration
 * @returns A function that extends the Payload config
 *
 * @example
 * ```ts
 * import { authPlugin } from 'payload-auth-workos'
 *
 * export default buildConfig({
 *   plugins: [
 *     authPlugin({
 *       name: 'app',
 *       usersCollectionSlug: 'users',
 *       accountsCollectionSlug: 'accounts',
 *       workosProvider: {
 *         client_id: process.env.WORKOS_CLIENT_ID,
 *         client_secret: process.env.WORKOS_API_KEY,
 *         redirect_uri: process.env.WORKOS_REDIRECT_URI,
 *         cookie_password: process.env.WORKOS_COOKIE_PASSWORD,
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export function authPlugin(pluginConfig: AuthPluginConfig) {
  return (incomingConfig: Config): Config => {
    // Validate WorkOS configuration
    createWorkOSClient(pluginConfig.workosProvider)

    // Set default values
    const config: AuthPluginConfig = {
      useAdmin: false,
      allowSignUp: false,
      successRedirectPath: '/',
      errorRedirectPath: '/auth/error',
      ...pluginConfig,
    }

    // Check if collections already exist
    const existingUserCollection = incomingConfig.collections?.find(
      (c) => c.slug === config.usersCollectionSlug,
    )
    const existingAccountCollection = incomingConfig.collections?.find(
      (c) => c.slug === config.accountsCollectionSlug,
    )

    // Create or extend collections
    const collections = [...(incomingConfig.collections || [])]

    // Create the WorkOS authentication strategy for this collection
    const workosStrategy = createWorkOSStrategy(config.usersCollectionSlug)

    if (!existingUserCollection) {
      const userCollection = createUsersCollection(config.usersCollectionSlug, config.useAdmin)

      // Add WorkOS strategy to auth config
      if (userCollection.auth && typeof userCollection.auth === 'object') {
        userCollection.auth.strategies = [
          ...(userCollection.auth.strategies || []),
          workosStrategy,
        ]
      }

      collections.push(userCollection)
    } else {
      // Extend existing collection with WorkOS fields and strategy
      const index = collections.findIndex((c) => c.slug === config.usersCollectionSlug)
      if (index !== -1) {
        const existingFields = collections[index].fields || []
        const workosFields = createUsersCollection(config.usersCollectionSlug, config.useAdmin).fields || []

        // Merge fields, avoiding duplicates
        const fieldSlugs = new Set(existingFields.map((f) => 'name' in f ? f.name : null))
        const newFields = workosFields.filter((f) => {
          const name = 'name' in f ? f.name : null
          return name && !fieldSlugs.has(name)
        })

        // Add WorkOS strategy to existing auth config
        const existingAuth = collections[index].auth
        if (existingAuth && typeof existingAuth === 'object') {
          existingAuth.strategies = [
            ...(existingAuth.strategies || []),
            workosStrategy,
          ]
        }

        collections[index] = {
          ...collections[index],
          fields: [...existingFields, ...newFields],
          auth: existingAuth,
        }
      }
    }

    if (!existingAccountCollection) {
      collections.push(createAccountsCollection(config.accountsCollectionSlug, config.usersCollectionSlug))
    }

    // Get API route prefix (defaults to /api)
    const apiPrefix = incomingConfig.routes?.api || '/api'

    // Create auth endpoints with the API prefix
    const endpoints = createAuthEndpoints(config, apiPrefix)

    // Merge with existing endpoints
    const allEndpoints = [...(incomingConfig.endpoints || []), ...endpoints]

    // Prepare admin config updates for admin auth
    let adminConfig = incomingConfig.admin

    if (config.useAdmin) {
      adminConfig = {
        ...incomingConfig.admin,
        user: config.usersCollectionSlug,
      }
    }

    return {
      ...incomingConfig,
      collections,
      endpoints: allEndpoints,
      admin: adminConfig,
    }
  }
}
