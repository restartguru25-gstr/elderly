/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    // Product codebase: allow pragmatic typing where needed.
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'react/no-unescaped-entities': 'off',
    'prefer-const': 'off',

    // Keep unused-vars as warnings (not blocking).
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'coverage/',
    'next-env.d.ts',
    'tailwind.config.ts',
    'postcss.config.*',
    'firestore.indexes.json',
  ],
};

