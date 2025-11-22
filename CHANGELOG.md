# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.10] - 2025-11-22

### Added

- Dual publishing support: Package is now published to both npmjs.com and GitHub Packages
- GitHub Actions workflow now publishes to both registries automatically
- Added `.npmrc.example` file with configuration examples for GitHub Packages installation
- Package is available as `payload-auth-workos` on npmjs.com (unchanged) and `@markkropf/payload-auth-workos` on GitHub Packages

### Changed

- Updated README with installation instructions for both registries
- GitHub Actions workflow now modifies package.json temporarily to publish scoped version to GitHub Packages

### Notes

- **No breaking changes**: The package remains `payload-auth-workos` on npmjs.com for backward compatibility
- GitHub Packages uses scoped name `@markkropf/payload-auth-workos` (required by GitHub)
- Both registries contain identical code, just different package names

## [1.0.9] - 2025-11-20

### Fixed

- Allow existing users to sign in even when `allowSignUp` is set to `false`.

### Improved

- Enhanced logout support: Custom `/logout` endpoint now properly clears server-side sessions and cookies.

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
