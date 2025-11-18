import { postgresAdapter } from '@payloadcms/db-postgres' // database-adapter-import

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

// Auth Imports
import { authPlugin, createWorkOSProviderConfig } from 'payload-auth-workos'
import { AdminAccounts } from './collections/Auth/Admin/Accounts'
import { AdminUsers } from './collections/Auth/Admin/Users'
import { AppAccounts } from './collections/Auth/App/Accounts'
import { AppUsers } from './collections/Auth/App/Users'

// Create a shared WorkOS configuration
const workosConfig = createWorkOSProviderConfig('GoogleOAuth', {
  client_id: process.env.WORKOS_CLIENT_ID || '',
  client_secret: process.env.WORKOS_API_KEY || '',
  cookie_password: process.env.WORKOS_COOKIE_PASSWORD || '',
})

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
      // WorkOS login button for admin authentication
      afterLogin: ['@/components/WorkOSLoginButton'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: AdminUsers.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // database-adapter-config-start
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  // database-adapter-config-end
  collections: [AdminAccounts, AdminUsers, AppAccounts ,AppUsers ,Pages, Posts, Media, Categories],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    authPlugin({
      name: 'admin',
      useAdmin: true,
      usersCollectionSlug: AdminUsers.slug,
      accountsCollectionSlug: AdminAccounts.slug,
      successRedirectPath: '/admin',
      workosProvider: workosConfig,
    }),
    authPlugin({
      name: 'app',
      allowSignUp: true,
      usersCollectionSlug: AppUsers.slug,
      accountsCollectionSlug: AppAccounts.slug,
      workosProvider: workosConfig,
    }),
    ...plugins,
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
