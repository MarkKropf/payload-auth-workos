import type { AccessArgs } from 'payload'

type isAuthenticated = (args: AccessArgs) => boolean

export const authenticated: isAuthenticated = ({ req: { user } }) => {
  return Boolean(user)
}
