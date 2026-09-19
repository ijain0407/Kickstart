import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly', console: 'readonly', fetch: 'readonly',
        sessionStorage: 'readonly', localStorage: 'readonly', Intl: 'readonly', requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', crypto: 'readonly',
        URLSearchParams: 'readonly', process: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly',
        vi: 'readonly', URL: 'readonly', File: 'readonly', performance: 'readonly', __dirname: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', Headers: 'readonly', Response: 'readonly',
      },
    },
    rules: { ...reactHooks.configs.recommended.rules, 'no-undef': 'error' },
  },
];
