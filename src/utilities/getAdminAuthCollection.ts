
let adminAuthCollectionSlug: string | undefined

export function setAdminAuthCollectionSlug(slug: string): void {
  adminAuthCollectionSlug = slug
}

/**
 * Get the auth collection slug that is configured with useAdmin: true
 * This dynamically detects which collection is used for admin authentication
 */
export async function getAdminAuthCollection(): Promise<string> {
  if (adminAuthCollectionSlug) {
    return adminAuthCollectionSlug
  }

  // Fallback to 'users' if not configured
  return 'users'
}
