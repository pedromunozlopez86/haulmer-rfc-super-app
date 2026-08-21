const DOMAIN_PACKAGES = ['core', 'payments', 'identity', 'banking'];

/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Enforce module boundary rules — no cross-domain imports
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // core cannot import from any domain package
          ...DOMAIN_PACKAGES.filter(p => p !== 'core').map(domain => ({
            target: './packages/core',
            from: `./packages/${domain}`,
            message: `@haulmer/core cannot import from @haulmer/${domain}. Core has no upstream dependencies.`,
          })),
          // payments cannot import from loyalty or consumer
          {
            target: './packages/payments',
            from: './packages/loyalty',
            message: '@haulmer/payments cannot import from @haulmer/loyalty. Move shared code to @haulmer/core.',
          },
          // identity cannot import from banking or payments
          {
            target: './packages/identity',
            from: './packages/payments',
            message: '@haulmer/identity cannot import from @haulmer/payments.',
          },
          {
            target: './packages/identity',
            from: './packages/banking',
            message: '@haulmer/identity cannot import from @haulmer/banking.',
          },
          // banking cannot import from payments or identity
          {
            target: './packages/banking',
            from: './packages/payments',
            message: '@haulmer/banking cannot import from @haulmer/payments.',
          },
          {
            target: './packages/banking',
            from: './packages/identity',
            message: '@haulmer/banking cannot import from @haulmer/identity.',
          },
        ],
      },
    ],
  },
};
