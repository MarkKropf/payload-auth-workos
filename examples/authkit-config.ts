/**
 * AuthKit Payload Auth WorkOS Configuration Example
 *
 * This example shows the minimal configuration needed to set up
 * WorkOS AuthKit authentication with Payload CMS.
 * Note: AuthKit requires the `authkit` provider and must be enabled in your WorkOS tenant.
 */

import { buildConfig } from 'payload'
import { authPlugin, createWorkOSProviderConfig } from 'payload-auth-workos'

// Create WorkOS provider config for AuthKit
const workosConfig = createWorkOSProviderConfig('authkit', {
  client_id: process.env.WORKOS_CLIENT_ID || '',
  client_secret: process.env.WORKOS_API_KEY || '',
  cookie_password: process.env.WORKOS_COOKIE_PASSWORD || '',
})

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000',

  // Define which collection to use for admin authentication
  admin: {
    user: 'users',
  },

  // Add the WorkOS auth plugin
  plugins: [
    authPlugin({
      // Unique name for this auth configuration
      name: 'workos-auth',

      // Allow public sign-ups (optional)
      allowSignUp: true,

      // Collection slugs
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',

      // WorkOS configuration (AuthKit)
      workosProvider: workosConfig,

      // Optional: End WorkOS session on signout
      endWorkOsSessionOnSignout: true,

      // Optional: Replace the admin logout button to use /api/{name}/auth/signout
      replaceAdminLogoutButton: true,
    }),
  ],

  // Your collections, globals, etc.
  collections: [
    // The plugin will automatically create or extend the 'users' and 'accounts' collections
    // You can add additional fields to the users collection like this:
    {
      slug: 'users',
      fields: [
        {
          name: 'role',
          type: 'select',
          options: ['user', 'admin'],
          defaultValue: 'user',
        },
      ],
    },
  ],
})
