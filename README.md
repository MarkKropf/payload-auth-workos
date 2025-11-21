# Payload Auth WorkOS

A Payload CMS authentication plugin that integrates [WorkOS](https://workos.com) for OAuth-based user authentication.

## Features

- 🔐 **OAuth Authentication** - Leverage WorkOS for secure, enterprise-grade authentication
- 🎨 **Highly Configurable** - Customize authentication flows, redirects, and user collections
- 👥 **Multi-Collection Support** - Configure different authentication for multiple user collections
- 🛡️ **Admin Panel Integration** - Optional integration with Payload's admin panel
- 🔄 **Flexible User Management** - Control sign-up permissions and user data synchronization
- 🏢 **Enterprise SSO** - Support for WorkOS organizations and connections
- 🛠️ **Manual Configuration** - Helper utilities for custom collection setup

## Installation

```bash
pnpm add payload-auth-workos
```

## Quick Start

### 1. Set up WorkOS

First, create a WorkOS account and set up an application at [workos.com](https://workos.com). You'll need:

- **Client ID** - Your WorkOS application client ID
- **API Key** (Client Secret) - Your WorkOS API key
- **Cookie Password** - Secure password for session encryption (minimum 32 characters)
- **Provider** - OAuth provider (e.g., `GoogleOAuth`, `GitHubOAuth`, `MicrosoftOAuth`)

**Note:** The OAuth redirect URI is automatically generated from your plugin's `name` configuration. You'll need to add it to your WorkOS dashboard (see Configuration section below).

### 2. Configure Environment Variables

Create a `.env` file:

```env
WORKOS_CLIENT_ID=your_client_id
WORKOS_API_KEY=your_api_key
WORKOS_COOKIE_PASSWORD=your_secure_32_character_minimum_password
WORKOS_PROVIDER=GoogleOAuth
```

You can generate a secure cookie password using:

```bash
openssl rand -base64 32
```

### 3. Add the Plugin to Your Payload Config

```typescript
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-workos'

export default buildConfig({
  // ... other config
  plugins: [
    authPlugin({
      name: 'workos-auth',
      usersCollectionSlug: 'users',
      accountsCollectionSlug: 'accounts',
      workosProvider: {
        client_id: process.env.WORKOS_CLIENT_ID!,
        client_secret: process.env.WORKOS_API_KEY!,
        cookie_password: process.env.WORKOS_COOKIE_PASSWORD!,
        provider: process.env.WORKOS_PROVIDER!, // or connection/organization
      },
    }),
  ],
})
```

### 4. Add Sign-In Links to Your App

```tsx
// In your Next.js app
export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <a href="/api/{name}/auth/signin">Sign in with WorkOS</a>
    </div>
  )
}
```
*Note: Replace `{name}` with the `name` property you defined in your plugin configuration (e.g., `workos-auth`, `app`, `admin`).*

### 5. Client-Side Session Management

To access the current user in your Next.js Client Components, use the provided `AuthProvider` and `useAuth` hook.

**Layout (Server Component):**

```tsx
// app/layout.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { AuthProvider } from 'payload-auth-workos/client'

export default async function RootLayout({ children }) {
  const payload = await getPayload({ config })
  // Verify auth using Payload's native API
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <html>
      <body>
        {/* Pass the server-verified user to the client provider */}
        <AuthProvider user={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

**Component (Client Component):**

```tsx
// components/UserProfile.tsx
'use client'
import { useAuth } from 'payload-auth-workos/client'

export function UserProfile() {
  const { user } = useAuth()

  // Assuming your plugin name is 'workos-auth'
  if (!user) return <a href="/api/workos-auth/auth/signin">Sign in</a>

  return <div>Hello, {user.email}</div>
}
```

## Configuration Options

### AuthPluginConfig

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `name` | `string` | ✅ | - | Unique identifier for this auth configuration |
| `usersCollectionSlug` | `string` | ✅ | - | Slug of the users collection |
| `accountsCollectionSlug` | `string` | ✅ | - | Slug of the accounts collection |
| `workosProvider` | `WorkOSProviderConfig` | ✅ | - | WorkOS configuration |
| `useAdmin` | `boolean` | ❌ | `false` | Use this config for admin panel auth |
| `allowSignUp` | `boolean` | ❌ | `false` | Allow new user registrations (secure by default) |
| `successRedirectPath` | `string` | ❌ | `'/'` | Redirect path after successful auth |
| `errorRedirectPath` | `string` | ❌ | `'/auth/error'` | Redirect path on auth error |
| `onSuccess` | `function` | ❌ | - | Custom callback after successful auth |
| `onError` | `function` | ❌ | - | Custom error handler |

### WorkOSProviderConfig

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `client_id` | `string` | ✅ | WorkOS Client ID |
| `client_secret` | `string` | ✅ | WorkOS API Key |
| `cookie_password` | `string` | ✅ | Cookie encryption password (min 32 chars) |
| `provider` | `string` | ❌* | OAuth provider (e.g., `GoogleOAuth`, `GitHubOAuth`) |
| `connection` | `string` | ❌* | WorkOS connection ID |
| `organization` | `string` | ❌* | WorkOS organization ID |

**Notes:**

- You must provide either `provider`, `connection`, or `organization`. WorkOS requires one of these connection selectors.
- The OAuth `redirect_uri` is automatically generated as `/api/{name}/auth/callback` and does not need to be configured.

## Advanced Usage

### Multiple User Collections

Configure different authentication for app users and admin users:

```typescript
import { buildConfig } from 'payload'
import { authPlugin, createWorkOSProviderConfig } from 'payload-auth-workos'

// Create a shared WorkOS config to avoid repetition
const workosConfig = createWorkOSProviderConfig('GoogleOAuth', {
  client_id: process.env.WORKOS_CLIENT_ID!,
  client_secret: process.env.WORKOS_API_KEY!,
  cookie_password: process.env.WORKOS_COOKIE_PASSWORD!,
})

export default buildConfig({
  admin: {
    user: 'adminUsers',
  },
  plugins: [
    // Admin users
    authPlugin({
      name: 'admin',
      useAdmin: true,
      allowSignUp: false,
      usersCollectionSlug: 'adminUsers',
      accountsCollectionSlug: 'adminAccounts',
      successRedirectPath: '/admin',
      workosProvider: workosConfig,
    }),
    // App users
    authPlugin({
      name: 'app',
      allowSignUp: true,
      usersCollectionSlug: 'appUsers',
      accountsCollectionSlug: 'appAccounts',
      successRedirectPath: '/dashboard',
      workosProvider: workosConfig,
    }),
  ],
})
```

### Client-Side Authentication for Multiple Collections

When using multiple authentication scopes (e.g., admin and app), you can create isolated client-side auth providers to prevent state conflicts:

```tsx
// lib/auth.ts
import { createAuthClient } from 'payload-auth-workos/client'

export const adminAuth = createAuthClient('admin')
export const appAuth = createAuthClient('app')
```

**Usage in Layouts:**

```tsx
// app/(app)/layout.tsx
import { appAuth } from '@/lib/auth'

// ... inside your layout
<appAuth.AuthProvider user={appUser}>
  {children}
</appAuth.AuthProvider>
```

**Usage in Components:**

```tsx
// app/(app)/components/Header.tsx
'use client'
import { appAuth } from '@/lib/auth'

export function Header() {
  const { user } = appAuth.useAuth()
  // ...
}
```

### Cookie Management in Multi-Collection Setups

When using multiple auth collections, the plugin automatically manages cookies to prevent conflicts and ensure compatibility with Payload's admin panel.

#### How It Works

The plugin uses different cookie naming strategies based on whether a collection is used for admin authentication:

- **Admin collection** (when `config.admin.user` matches your collection):
  - `payload-token` - Standard Payload cookie for admin panel compatibility

- **Non-admin collections**:
  - `payload-token-{collectionSlug}` - Collection-specific cookie

#### Example Cookie Names

With the configuration above, you'll get these cookies:

- Admin users: `payload-token`
- App users: `payload-token-appUsers`

This allows users to be authenticated to multiple collections simultaneously without conflicts, while keeping the admin authentication simple and compatible with Payload's built-in admin panel.

#### Admin Panel Integration

The plugin automatically detects which collection is used for admin authentication (via `config.admin.user`) and uses the standard `payload-token` cookie. This ensures the Payload admin panel works seamlessly without any additional configuration.

**No special configuration needed** - just set `config.admin.user` to match your admin collection slug:

```typescript
export default buildConfig({
  admin: {
    user: 'adminUsers', // Must match the admin collection slug
  },
  // ...
})
```

#### Custom Prefix

If you've configured a custom `cookiePrefix` in your Payload config, the plugin respects it:

```typescript
export default buildConfig({
  cookiePrefix: 'myapp',
  admin: {
    user: 'adminUsers',
  },
  // ...
})
```

This would create:

- `myapp-token` for admin users
- `myapp-token-appUsers` for app users

### Adding a Login Button to the Admin Panel

When using `useAdmin: true`, you can add a login button to the admin login page (`/admin/login`). Create a component file that imports the `LoginButton` from the `/client` subpath:

```typescript
// src/components/WorkOSLoginButton.tsx
'use client'

import React from 'react'
import { LoginButton } from 'payload-auth-workos/client'

const WorkOSLoginButton = () => {
  return (
    <LoginButton
      href="/api/{name}/auth/signin"
      label="Sign in with WorkOS"
    />
  )
}

export default WorkOSLoginButton
```

Then reference it in your Payload config:

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-workos'

export default buildConfig({
  admin: {
    user: 'adminUsers',
    components: {
      afterLogin: ['@/components/WorkOSLoginButton'],
    },
  },
  plugins: [
    authPlugin({
      name: 'admin',
      useAdmin: true,
      usersCollectionSlug: 'adminUsers',
      accountsCollectionSlug: 'adminAccounts',
      workosProvider: workosConfig,
    }),
  ],
})
```

**LoginButton Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `href` | `string` | ✅ | - | The signin endpoint URL (e.g., `/api/admin/auth/signin`) |
| `label` | `string` | ❌ | `'Login'` | Button text |
| `className` | `string` | ❌ | - | Additional CSS classes |
| `style` | `React.CSSProperties` | ❌ | - | Custom inline styles |

**Note:** The `LoginButton` uses Payload's native button classes by default to match the admin panel design.

#### Creating a Custom Login Button

If you need full control, you can create your own component using Payload's default button classes:

```typescript
const CustomLoginButton = () => (
  <div className="template-default__actions">
    <a
      href="/api/admin/auth/signin"
      className="btn btn--style-primary btn--icon-style-without-border btn--size-medium btn--icon-position-right"
    >
      Sign in with Google Workspace
    </a>
  </div>
)

export default buildConfig({
  admin: {
    user: 'adminUsers',
    components: {
      afterLogin: [CustomLoginButton],
    },
  },
  // ...
})
```

### Manual Collection Configuration

If you need more control over your collections, you can configure them manually using the provided utilities:

```typescript
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-workos'
import { withAccountCollection } from 'payload-auth-workos/collection'
import { deleteLinkedAccounts } from 'payload-auth-workos/collection/hooks'

// Define your users collection
const Users = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    // Add custom fields here
  ],
  hooks: {
    afterDelete: [deleteLinkedAccounts('accounts')], // Clean up accounts when user is deleted
  },
}

// Create accounts collection with sensible defaults
const Accounts = withAccountCollection(
  {
    slug: 'accounts',
    // Optional: override admin config, access control, etc.
  },
  Users.slug, // users collection slug
)

export default buildConfig({
  collections: [Users, Accounts],
  plugins: [
    authPlugin({
      name: 'workos-auth',
      usersCollectionSlug: Users.slug,
      accountsCollectionSlug: Accounts.slug,
      workosProvider: {
        client_id: process.env.WORKOS_CLIENT_ID!,
        client_secret: process.env.WORKOS_API_KEY!,
        cookie_password: process.env.WORKOS_COOKIE_PASSWORD!,
        provider: 'GoogleOAuth',
      },
    }),
  ],
})
```

### Custom Success Handler

```typescript
authPlugin({
  name: 'app',
  usersCollectionSlug: 'users',
  accountsCollectionSlug: 'accounts',
  workosProvider: { /* ... */ },
  onSuccess: async ({ user, session, req }) => {
    console.log('User authenticated:', user.email)
    // Send welcome email, log analytics, etc.
  },
})
```

### Custom Error Handler

```typescript
authPlugin({
  name: 'app',
  usersCollectionSlug: 'users',
  accountsCollectionSlug: 'accounts',
  workosProvider: { /* ... */ },
  onError: async ({ error, req }) => {
    console.error('Auth error:', error)
    // Log to error tracking service
  },
})
```

### Enterprise SSO with Organizations

For enterprise customers using WorkOS organizations:

```typescript
authPlugin({
  name: 'enterprise',
  usersCollectionSlug: 'users',
  accountsCollectionSlug: 'accounts',
  workosProvider: {
    client_id: process.env.WORKOS_CLIENT_ID!,
    client_secret: process.env.WORKOS_API_KEY!,
    cookie_password: process.env.WORKOS_COOKIE_PASSWORD!,
    organization: 'org_123456', // WorkOS organization ID
  },
})
```

### Using Specific Connections

For specific WorkOS connections (e.g., a custom SAML connection):

```typescript
authPlugin({
  name: 'saml',
  usersCollectionSlug: 'users',
  accountsCollectionSlug: 'accounts',
  workosProvider: {
    client_id: process.env.WORKOS_CLIENT_ID!,
    client_secret: process.env.WORKOS_API_KEY!,
    cookie_password: process.env.WORKOS_COOKIE_PASSWORD!,
    connection: 'conn_123456', // WorkOS connection ID
  },
})
```

## Authentication Endpoints

The plugin creates the following endpoints for each configuration:

- `GET /api/{name}/auth/signin` - Initiates OAuth flow
- `GET /api/{name}/auth/callback` - Handles OAuth callback
- `GET /api/{name}/auth/signout` - Signs out the user
- `GET /api/{name}/auth/session` - Returns current session status

(Assuming default `/api` route prefix. If you use a custom `routes.api`, adjust accordingly).

## Collections Schema

### Users Collection

The plugin adds/requires these fields in your users collection:

```typescript
{
  email: string               // User's email (unique)
  firstName?: string          // First name from WorkOS
  lastName?: string           // Last name from WorkOS
  profilePictureUrl?: string  // Profile picture URL
  workosUserId: string        // WorkOS user ID (unique)
}
```

If you're using Payload's `auth` option on your collection, the plugin will extend it with these additional fields.

### Accounts Collection

Stores OAuth account linkages:

```typescript
{
  user: relationship          // Reference to user
  provider: 'workos'         // OAuth provider
  providerAccountId: string  // WorkOS account ID
  organizationId?: string    // WorkOS organization ID
  accessToken?: string       // OAuth access token (hidden)
  refreshToken?: string      // OAuth refresh token (hidden)
  expiresAt?: Date          // Token expiration
  metadata?: object         // Additional data
}
```

## Collection Utilities

### `withAccountCollection`

A helper function that creates a complete accounts collection with sensible defaults:

```typescript
import { withAccountCollection } from 'payload-auth-workos/collection'

const Accounts = withAccountCollection(
  {
    slug: 'accounts',
    // Optional overrides:
    access: {
      // Custom access control
    },
    admin: {
      // Custom admin config
    },
    fields: [
      // Additional custom fields
    ],
  },
  'users', // users collection slug
)
```

**Features:**

- Provides all required OAuth account fields
- Sets secure default access control
- Configures admin UI with sensible defaults
- Allows custom fields and overrides
- Enables automatic timestamps

### `deleteLinkedAccounts`

A hook that automatically cleans up orphaned account records when a user is deleted:

```typescript
import { deleteLinkedAccounts } from 'payload-auth-workos/collection/hooks'

const Users = {
  slug: 'users',
  hooks: {
    afterDelete: [deleteLinkedAccounts('accounts')],
  },
  // ... rest of config
}
```

## API Reference

### Main Package Exports

```typescript
import {
  authPlugin,
  createUsersCollection,
  createAccountsCollection,
  createWorkOSProviderConfig,
  generateUserToken,
  getPayloadCookies,
  getExpiredPayloadCookies,
  getAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
  refreshAccessToken,
  withAccountCollection,
  deleteLinkedAccounts,
} from 'payload-auth-workos'
```

- `authPlugin(config)` - Main plugin function
- `createUsersCollection(slug)` - Creates a users collection
- `createAccountsCollection(slug, usersSlug)` - Creates an accounts collection
- `createWorkOSProviderConfig(provider, config)` - Creates reusable WorkOS provider config
- `generateUserToken(payload, collection, userId)` - Generates a JWT token
- `getPayloadCookies(payload, collection, token)` - Generates auth cookie strings (uses standard `payload-token` for admin collections, collection-specific cookies for others)
- `getExpiredPayloadCookies(payload, collection)` - Generates expired cookie strings for sign-out
- `getAuthorizationUrl(config)` - Generates WorkOS authorization URL
- `exchangeCodeForToken(config, code)` - Exchanges auth code for token
- `getUserInfo(config, accessToken)` - Gets user info from WorkOS
- `refreshAccessToken(config, refreshToken)` - Refreshes access token
- `withAccountCollection(config, usersSlug)` - Creates accounts collection with defaults
- `deleteLinkedAccounts(accountsSlug)` - Hook to delete linked accounts

### Client Package Exports

For client-side components (use in files with `'use client'` directive):

```typescript
import { LoginButton, AuthProvider, useAuth, createAuthClient } from 'payload-auth-workos/client'
import type { LoginButtonProps, AuthContextType, AuthProviderProps } from 'payload-auth-workos/client'
```

- `LoginButton` - Customizable login button component for admin panel
- `AuthProvider` - Context provider for user sessions
- `useAuth` - Hook to access the current user session
- `createAuthClient(slug)` - Factory to create isolated auth clients for multi-collection setups
- `LoginButtonProps` - TypeScript type for LoginButton props
- `AuthContextType` - TypeScript type for auth context
- `AuthProviderProps` - TypeScript type for auth provider props

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint
```

### Project Structure

```text
payload-auth-workos/
├── src/
│   ├── collection/          # Collection utilities
│   │   ├── index.ts        # withAccountCollection
│   │   └── hooks.ts        # deleteLinkedAccounts
│   ├── collections/        # Collection creators
│   ├── endpoints/          # API endpoints
│   ├── lib/               # Core functionality
│   ├── plugin.ts          # Main plugin
│   └── types.ts           # TypeScript types
├── dev/                   # Development environment
└── examples/             # Example configurations
```

## Troubleshooting

### Invalid Client Secret Error

Make sure you're using your WorkOS **API Key** (not Client ID) as the `client_secret`.

### Invalid Connection Selector Error

WorkOS requires either `provider`, `connection`, or `organization` in your configuration. Make sure you've specified one of these.

### Redirect URI Configuration

The plugin automatically generates OAuth redirect URIs based on your configuration. You must add these URIs to your WorkOS dashboard's allowed redirect URIs list.

**Format:**

- Standard endpoints: `{baseUrl}/api/{name}/auth/callback`
- Admin endpoints (`useAdmin: true`): `{baseUrl}/api/{name}/auth/callback`

Where `{name}` is the value you specified in your plugin's `name` configuration.

**Examples:**

- Plugin with `name: 'workos-auth'` → `http://127.0.0.1:3000/api/workos-auth/auth/callback`
- Plugin with `name: 'admin'` (even with `useAdmin: true`) → `http://127.0.0.1:3000/api/admin/auth/callback`
- Plugin with `name: 'app'` → `http://127.0.0.1:3000/api/app/auth/callback`

**Note:** All endpoints use the `/api` prefix by default (or your configured `routes.api`).

**Important:** WorkOS requires `127.0.0.1` instead of `localhost`. Make sure the redirect URIs in your WorkOS dashboard match exactly, including the protocol (http/https) and port.

### Collection Not Found Error

If you see errors about collections not existing, make sure:

1. Your collection slugs match the ones specified in the plugin config
2. Collections are defined before the plugin is loaded
3. You've run type generation: `pnpm payload generate:types`

## Examples

Check the `/examples` directory for complete working examples:

- Basic configuration
- Multi-collection setup
- Custom collections with manual configuration

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Run linter: `pnpm lint`
6. Submit a pull request

## Support

For issues and questions:

- [GitHub Issues](https://github.com/markkropf/payload-auth-workos/issues)
- [WorkOS Documentation](https://workos.com/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)

## Acknowledgments

- Built for [Payload CMS](https://payloadcms.com)
- Powered by [WorkOS](https://workos.com)
