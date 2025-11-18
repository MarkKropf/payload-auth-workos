# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of payload-auth-workos plugin
- WorkOS OAuth integration for Payload CMS
- Support for multiple user collections with separate auth configurations
- Automatic user and account collection creation/extension
- Admin panel authentication support
- Session management utilities
- Customizable success and error handlers
- TypeScript support with full type definitions
- Comprehensive documentation and examples

### Features
- `authPlugin()` - Main plugin function for configuring WorkOS authentication
- Auto-generated authentication endpoints:
  - `/auth/{name}/signin` - Initiate OAuth flow
  - `/auth/{name}/callback` - Handle OAuth callback
  - `/auth/{name}/signout` - Sign out user
  - `/auth/{name}/session` - Check session status
- Collections:
  - Users collection with WorkOS integration fields
  - Accounts collection for OAuth provider linkage
- Utilities:
  - Session token generation
  - Cookie management
  - WorkOS API helpers

## [0.1.0] - 2025-11-18

Initial development release.
