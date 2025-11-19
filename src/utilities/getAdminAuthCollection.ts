import configPromise from '@payload-config'

/**
 * Get the auth collection slug that is configured with useAdmin: true
 * This dynamically detects which collection is used for admin authentication
 */
export async function getAdminAuthCollection(): Promise<string> {
  const config = await configPromise

  // The admin user collection is defined in config.admin.user
  // This is automatically set by the authPlugin when useAdmin: true
  if (config.admin?.user) {
    return config.admin.user
  }

  // Fallback to 'users' if not configured
  return 'users'
}
