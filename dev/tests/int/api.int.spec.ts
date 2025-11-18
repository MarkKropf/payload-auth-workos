import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    // Skip tests if WorkOS credentials are not configured
    if (!process.env.WORKOS_CLIENT_ID || !process.env.DATABASE_URI) {
      console.warn('Skipping integration tests: WorkOS credentials or DATABASE_URI not configured')
      return
    }

    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches admin users', async () => {
    // Skip if payload wasn't initialized
    if (!payload) {
      console.warn('Skipping test: Payload not initialized')
      return
    }

    const users = await payload.find({
      collection: 'admin-users',
    })
    expect(users).toBeDefined()
  })

  it('fetches app users', async () => {
    // Skip if payload wasn't initialized
    if (!payload) {
      console.warn('Skipping test: Payload not initialized')
      return
    }

    const users = await payload.find({
      collection: 'app-users',
    })
    expect(users).toBeDefined()
  })
})
