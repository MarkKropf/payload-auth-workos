import type { Payload } from 'payload'
import { jwtVerify } from 'jose'

/**
 * WorkOS authentication strategy for Payload v3
 * This strategy validates JWT tokens set by the OAuth flow
 */
export function createWorkOSStrategy(collectionSlug: string) {
  return {
    name: 'workos',
    authenticate: async ({ headers, payload }: { headers: Headers; payload: Payload }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload's collections object uses dynamic keys
        const collection = (payload.collections as any)[collectionSlug]

        if (!collection || !collection.config.auth) {
          return { user: null }
        }

        // Compliant CSRF/Origin check matching Payload's extractJWT behavior
        const origin = headers.get('Origin')
        if (origin && payload.config.csrf && payload.config.csrf.length > 0 && !payload.config.csrf.includes(origin)) {
          return { user: null }
        }

        const cookiePrefix = payload.config.cookiePrefix || 'payload'
        const isAdmin = payload.config.admin?.user === collectionSlug
        const cookieName = isAdmin ? `${cookiePrefix}-token` : `${cookiePrefix}-token-${collectionSlug}`

        const cookieHeader = headers.get('cookie')
        if (!cookieHeader) {
          return { user: null }
        }

        const cookies = cookieHeader.split(';').reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )

        const token = cookies[cookieName]
        if (!token) {
          return { user: null }
        }

        const secretKey = new TextEncoder().encode(payload.secret)
        const { payload: jwtPayload } = await jwtVerify(token, secretKey)

        if (!jwtPayload || !jwtPayload.id) {
          return { user: null }
        }

        const user = await payload.findByID({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter
          collection: collectionSlug as any,
          id: jwtPayload.id as string | number,
        })

        if (!user) {
          return { user: null }
        }

        return {
          user: {
            ...user,
            _strategy: 'workos',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter for user augmentation
            collection: collectionSlug as any,
          },
        }
      } catch {
        return { user: null }
      }
    },
  }
}
