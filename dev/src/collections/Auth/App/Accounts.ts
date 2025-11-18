import { CollectionConfig } from 'payload'
import { withAccountCollection } from 'payload-auth-workos/collection'
import { AppUsers } from './Users'

export const AppAccounts: CollectionConfig = withAccountCollection(
  {
    slug: 'appAccounts',
  },
  AppUsers.slug,
)
