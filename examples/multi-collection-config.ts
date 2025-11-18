/**
 * Multi-Collection Payload Auth WorkOS Configuration Example
 *
 * This example demonstrates how to configure separate authentication
 * for different user types (e.g., app users and admin users).
 */

import { buildConfig } from 'payload'
import { authPlugin, createWorkOSProviderConfig } from 'payload-auth-workos'

// Create a shared WorkOS config - DRY principle!
// Define once, reuse across multiple auth instances
const workosConfig = createWorkOSProviderConfig('GoogleOAuth', {
  client_id: process.env.WORKOS_CLIENT_ID || '',
  client_secret: process.env.WORKOS_API_KEY || '',
  cookie_password: process.env.WORKOS_COOKIE_PASSWORD || '',
})

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000',

  // Use the admin collection for admin panel
  admin: {
    user: 'admins',
  },

  plugins: [
    // App users configuration
    authPlugin({
      name: 'app',

      // Allow public sign-ups for app users
      allowSignUp: true,

      // Don't use for admin panel
      useAdmin: false,

      usersCollectionSlug: 'app-users',
      accountsCollectionSlug: 'app-accounts',

      successRedirectPath: '/dashboard',
      errorRedirectPath: '/auth/error',

      // Reuse the shared WorkOS config
      workosProvider: workosConfig,

      // Custom success handler
      onSuccess: async ({ user, session }) => {
        console.log(`App user ${user.email} signed in`)
        // Send welcome email, log analytics, etc.
      },
    }),

    // Admin users configuration
    authPlugin({
      name: 'admin',

      // Restrict admin sign-ups (default is false, but being explicit here)
      allowSignUp: false,

      // Use for admin panel authentication
      useAdmin: true,

      usersCollectionSlug: 'admins',
      accountsCollectionSlug: 'admin-accounts',

      successRedirectPath: '/admin',
      errorRedirectPath: '/admin/login',

      // Reuse the same WorkOS config - no repetition!
      workosProvider: workosConfig,

      // Custom success handler for admins
      onSuccess: async ({ user, session }) => {
        console.log(`Admin ${user.email} signed in`)
        // Log admin access, send notifications, etc.
      },

      // Custom error handler
      onError: async ({ error }) => {
        console.error('Admin auth error:', error)
        // Alert security team, log to monitoring service, etc.
      },
    }),
  ],

  collections: [
    // App users collection
    {
      slug: 'app-users',
      fields: [
        {
          name: 'subscription',
          type: 'select',
          options: ['free', 'pro', 'enterprise'],
          defaultValue: 'free',
        },
        {
          name: 'preferences',
          type: 'json',
        },
      ],
    },

    // Admin users collection
    {
      slug: 'admins',
      fields: [
        {
          name: 'permissions',
          type: 'select',
          hasMany: true,
          options: [
            'manage-users',
            'manage-content',
            'view-analytics',
            'system-settings',
          ],
        },
      ],
    },
  ],
})
