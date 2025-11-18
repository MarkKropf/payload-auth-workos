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
        const collection = (payload.collections as any)[collectionSlug]

        if (!collection || !collection.config.auth) {
          return { user: null }
        }

        const cookiePrefix = payload.config.cookiePrefix || 'payload'
        const cookieName = `${cookiePrefix}-token`

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
            collection: collectionSlug as any,
          },
        }
      } catch (error) {
        return { user: null }
      }
    },
  }
}
