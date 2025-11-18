/**
 * Client-side exports for the Payload Auth WorkOS plugin
 * These exports are used in the Payload admin UI and client-side code
 */

// Re-export main plugin types for client-side use
export type { AuthPluginConfig, WorkOSProviderConfig, AuthPlugin } from '../types.js'

// Client-side components
export { LoginButton } from '../components/LoginButton.js'
export type { LoginButtonProps } from '../components/LoginButton.js'
