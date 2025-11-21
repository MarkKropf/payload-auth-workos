import { describe, it, expect } from 'vitest'
import { getExpiredPayloadCookies } from './session.js'

describe('getExpiredPayloadCookies', () => {
  const mockPayload = {
    config: {
      cookiePrefix: 'payload',
      admin: {
        user: 'users',
      },
    },
    collections: {
      users: {
        config: {
          auth: {
            cookies: {
              secure: true,
              sameSite: 'None',
              domain: 'example.com',
            },
          },
        },
      },
      'other-users': {
        config: {
          auth: {
             // Default settings
          },
        },
      },
    },
  }

  it('should generate expired cookie for admin collection', () => {
    const cookies = getExpiredPayloadCookies(mockPayload as any, 'users')
    expect(cookies).toHaveLength(1)
    expect(cookies[0]).toBe('payload-token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure; Domain=example.com')
  })

  it('should generate expired cookie for non-admin collection', () => {
    const cookies = getExpiredPayloadCookies(mockPayload as any, 'other-users')
    expect(cookies).toHaveLength(1)
    // Should use default Lax and no Secure (unless prod) and no Domain
    // Note: process.env.NODE_ENV is 'test' usually
    expect(cookies[0]).toContain('payload-token-other-users=; HttpOnly; Path=/; Max-Age=0')
    expect(cookies[0]).toContain('SameSite=Lax')
    // Secure might depend on NODE_ENV
  })

  it('should throw error if collection has no auth', () => {
    const payloadNoAuth = {
      collections: {
        'no-auth': {
          config: {},
        },
      },
    }
    expect(() => getExpiredPayloadCookies(payloadNoAuth as any, 'no-auth')).toThrow('Collection does not have auth enabled')
  })
})
