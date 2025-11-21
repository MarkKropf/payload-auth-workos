import { describe, it, expect, vi } from 'vitest'
import { withUsersCollection } from './withUsersCollection.js'

// Mock dependencies
vi.mock('../lib/strategy.js', () => ({
  createWorkOSStrategy: () => ({ name: 'workos' }),
}))

vi.mock('../collections/createUsersCollection.js', () => ({
  createUsersCollection: () => ({ 
    slug: 'users',
    fields: [{ name: 'workosUserId', type: 'text' }],
    admin: { useAsTitle: 'email' }
  }),
}))

vi.mock('../lib/session.js', () => ({
  getExpiredPayloadCookies: () => ['expired-cookie=; Max-Age=0'],
}))

describe('withUsersCollection', () => {
  it('should add logout endpoint', () => {
    const config = withUsersCollection({
      slug: 'users',
      auth: true,
    })

    expect(config.endpoints).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logoutEndpoint = (config.endpoints as any[])?.find((e: any) => e.path === '/logout' && e.method === 'post')
    expect(logoutEndpoint).toBeDefined()
  })

  it('should execute logout handler', async () => {
    const config = withUsersCollection({
      slug: 'users',
      auth: {
        useSessions: true,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logoutEndpoint = (config.endpoints as any[])?.find((e: any) => e.path === '/logout' && e.method === 'post')
    
    const mockReq = {
      user: { id: '123' },
      payload: {
        update: vi.fn().mockResolvedValue({}),
        config: {
            cookiePrefix: 'payload',
        },
        collections: {
            users: {
                config: {
                    auth: {}
                }
            }
        }
      },
    }

    // Execute handler
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const response = await logoutEndpoint?.handler(mockReq)
    
    expect(mockReq.payload.update).toHaveBeenCalledWith({
      collection: 'users',
      id: '123',
      data: { sessions: [] }
    })
    
    expect(response).toBeDefined()
    const body = await response?.json()
    expect(body).toEqual({ message: 'Logged out successfully.' })
    
    const headers = response?.headers
    expect(headers?.get('Set-Cookie')).toBe('expired-cookie=; Max-Age=0')
  })
})
