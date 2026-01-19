import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'
import { withUsersCollection } from 'payload-auth-workos/collection'
import { deleteLinkedAccounts } from 'payload-auth-workos/collection/hooks'
export const AppUsers: CollectionConfig = withUsersCollection({
  slug: 'appUsers',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['id', 'name', 'email'],
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
    useSessions: true,
    cookies: {
      secure: true,
      sameSite: true,
    }
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
  hooks: {
    beforeDelete: [deleteLinkedAccounts('appAccounts')],
  },
})
