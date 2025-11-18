# Contributing to Payload Auth WorkOS

Thank you for your interest in contributing to the Payload Auth WorkOS plugin!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/payload-auth-workos.git
   cd payload-auth-workos
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the plugin**
   ```bash
   pnpm build
   ```

## Development Workflow

### Running in Development Mode

```bash
pnpm dev
```

This will watch for changes and rebuild automatically.

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Linting and Formatting

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

## Project Structure

```
payload-auth-workos/
├── src/
│   ├── collections/          # Payload collection definitions
│   ├── endpoints/            # Authentication endpoints
│   ├── lib/                  # Utility functions
│   │   ├── auth-handler.ts  # OAuth callback handler
│   │   ├── session.ts       # Session management
│   │   └── workos.ts        # WorkOS API integration
│   ├── types.ts             # TypeScript type definitions
│   ├── plugin.ts            # Main plugin function
│   └── index.ts             # Public exports
├── dev/                     # Development test environment
└── dist/                    # Built output (not in source control)
```

## Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm build
   pnpm test
   pnpm lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

- Use TypeScript for all code
- Follow the existing code formatting (enforced by Prettier)
- Write clear, descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose

## Testing Guidelines

- Write unit tests for utility functions
- Test error handling and edge cases
- Ensure all tests pass before submitting PR

## Documentation

When adding new features:
- Update the README.md with usage examples
- Add JSDoc comments to exported functions and types
- Update the changelog

## Pull Request Process

1. Ensure all tests pass and code is linted
2. Update documentation as needed
3. Provide a clear description of the changes
4. Reference any related issues
5. Wait for review and address feedback

## Questions or Issues?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
