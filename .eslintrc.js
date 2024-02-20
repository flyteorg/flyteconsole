/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  root: true,
  globals: {
    // global variables, that should be assumed by eslint as defined
    JSX: true,
    RequiredNonNullable: true,
    Dictionary: true,
    NodeJS: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['plugin:react/recommended', 'airbnb', 'prettier'],
  plugins: ['custom-rules', 'react', '@typescript-eslint', 'import'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/core-modules': [
      '@clients/locale',
      '@clients/ui-atoms',
      '@clients/primitives',
      '@clients/theme',
      '@clients/common',
      '@clients/db',
    ],
  },
  rules: {
    // "off" or 0 - turn the rule off; "warn" or 1; "error" or 2
    'arrow-body-style': 'off',
    'consistent-return': 'off',
    'no-use-before-define': 'warn',
    'no-shadow': 'off',
    'no-nested-ternary': 'off',
    'no-unused-vars': 'off',
    'no-redeclare': 'off',
    'prefer-destructuring': 'warn',
    'prefer-promise-reject-errors': 'warn',
    'no-restricted-syntax': 'warn',
    'guard-for-in': 'warn',
    'no-param-reassign': 'warn',
    'no-unused-expressions': 'warn',
    'no-continue': 'warn',
    'no-restricted-globals': 'warn',
    'default-case': 'warn',
    'no-underscore-dangle': 'warn',
    'no-return-assign': 'warn',
    'no-throw-literal': 'warn',

    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@mui/styles', '@naterial/styles'],
            importNames: ['makeStyles'],
            message:
              "MUIv5 styles are incompatible with JSS, use 'styled' pattern or  'sx' prop instead.",
          },
        ],
      },
    ],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    // typescript specific
    '@typescript-eslint/no-shadow': 'off',
    // disabled to let "@typescript-eslint/*" rules do it's job
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-redeclare': ['warn', { ignoreDeclarationMerge: true }], // still will warn on exporting enums :(

    // classic
    'no-plusplus': 'off',
    'array-callback-return': 'off',
    // import
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-cycle': 2,
    'import/no-unresolved': 'off',
    'import/no-unused-modules': [1, { unusedExports: true }],

    // up for discussion
    'react/function-component-definition': 'off',
    eqeqeq: 'warn', // 12

    // react
    'react/destructuring-assignment': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-filename-extension': [
      2,
      {
        extensions: ['.jsx', '.tsx'],
      },
    ],
    'react/button-has-type': 'off', // 5
    'react/jsx-no-useless-fragment': 'off', // 15
    'react/no-access-state-in-setstate': 'warn', // 2
    'react/jsx-no-bind': 'warn', // 3
    'react/prop-types': 'off', // 69
    'react/self-closing-comp': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/no-unescaped-entities': 'off',
    'react/require-default-props': 'off',
    'react/no-unused-prop-types': 'off', // 15
    'react/no-array-index-key': 'warn', // 2
    'react/static-property-placement': 'warn', // 1
    'react/state-in-constructor': 'warn', // 2
    'react/no-children-prop': 'warn', // 1

    // jsx-a11y
    'jsx-a11y/anchor-is-valid': 'off', // 4
    'jsx-a11y/no-noninteractive-element-interactions': 'off', // 1
    'jsx-a11y/click-events-have-key-events': 'off', // 7
    'jsx-a11y/no-static-element-interactions': 'off', // 6
    'jsx-a11y/control-has-associated-label': 'warn',

    // custom-rules
    'custom-rules/enforce-path': 'error',
  },
  overrides: [
    {
      // overrides for test files
      files: ['*.spec.*', '*.test.*', 'scripts/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      // overrides for test files
      files: ['*.json'],
      rules: {
        bracketSpacing: 2,
      },
    },
  ],
};
