/**
 * Basic Payload Auth WorkOS Configuration Example
 *
 * This example shows the minimal configuration needed to set up
 * WorkOS authentication with Payload CMS.
 */

import { buildConfig } from 'payload'
import { authPlugin, createWorkOSProviderConfig } from 'payload-auth-workos'

// Create WorkOS provider config from environment variables
// The provider is configuration (hardcoded), credentials are from env vars
const workosConfig = createWorkOSProviderConfig('GoogleOAuth', {
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
      name: 'app',

      // Collection slugs
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',

      // WorkOS configuration (reads WORKOS_CLIENT_ID, WORKOS_API_KEY, WORKOS_COOKIE_PASSWORD from env)
      workosProvider: workosConfig,

      // Optional: Allow sign-ups (default: false - secure by default)
      allowSignUp: true,

      // Optional: Redirect paths
      successRedirectPath: '/',
      errorRedirectPath: '/auth/error',
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
