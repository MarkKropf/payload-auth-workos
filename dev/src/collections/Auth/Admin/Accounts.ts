import { CollectionConfig } from 'payload'
import { withAccountCollection } from 'payload-auth-workos/collection'
import { AdminUsers } from './Users'

export const AdminAccounts: CollectionConfig = withAccountCollection(
  {
    slug: 'adminAccounts',
  },
  AdminUsers.slug,
)
