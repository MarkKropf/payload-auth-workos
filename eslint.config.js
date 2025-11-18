// @ts-check

import payloadEsLintConfig from '@payloadcms/eslint-config'

export const defaultESLintIgnores = [
  '**/.temp',
  '**/.*', // ignore all dotfiles
  '**/.git',
  '**/.hg',
  '**/.pnp.*',
  '**/.svn',
  '**/playwright.config.ts',
  '**/vitest.config.js',
  '**/tsconfig.tsbuildinfo',
  '**/README.md',
  '**/eslint.config.js',
  '**/payload-types.ts',
  '**/dist/',
  '**/.yarn/',
  '**/build/',
  '**/node_modules/',
  '**/temp/',
]

export default [
  {
    ignores: [
      ...defaultESLintIgnores,
      '**/dev/.next/**',
      '**/examples/**',
    ],
  },
  ...payloadEsLintConfig,
  {
    rules: {
      'no-restricted-exports': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-intersection-types': 'off',
      'perfectionist/sort-union-types': 'off',
      'perfectionist/sort-interfaces': 'off',
      'no-console': 'warn',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        projectService: {
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 40,
          allowDefaultProject: ['scripts/*.ts', '*.js', '*.mjs', '*.spec.ts', '*.d.ts', 'vitest.config.ts'],
        },
        // projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]