module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
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
  plugins: ['react', '@typescript-eslint'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // "off" or 0: turn off the rule completely; "warn" or 1;  "error" or 2
    'arrow-body-style': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-boolean-value': 'off',
    'react/jsx-filename-extension': [2, { extensions: ['.jsx', '.tsx'] }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    // up for discussion
    'react/function-component-definition': 'off',
    'react/destructuring-assignment': 'off',

    /**
     * temporarily off or warn
     * */
    // some setup of eslint or prettier needed
    'no-undef': 'off', // 1066
    'import/no-unresolved': 'off', // 1275
    'import/no-extraneous-dependencies': 'off', // 715 - !important
    'react/jsx-props-no-spreading': 'off', // 119

    // classic
    'no-unused-vars': 'off', // 364
    'no-use-before-define': 'off', // 49 - warn
    'no-shadow': 'off', // 104
    'no-redeclare': 'off', // 16 - warn
    'no-param-reassign': 'off', // 28
    'no-unused-expressions': 'off', // 6 - warn
    'prefer-destructuring': 'off', // 34
    'max-classes-per-file': 'off', // 2 - warn

    // import

    // react
    'react/button-has-type': 'off', // 5
    'react/jsx-no-useless-fragment': 'off', // 15 - warn
    'react/no-access-state-in-setstate': 'off', // 2- warn
    'react/jsx-no-bind': 'off', // 3 - warn

    // jsx-a11y

    // 910 -> 725
    'no-else-return': 'off',
    'no-console': 'off',
    eqeqeq: 'off',
    'no-plusplus': 'off',
    'object-shorthand': 'off',
    // 725 -> 460
    'operator-assignment': 'off',
    'array-callback-return': 'off',
    'global-require': 'off',
    'no-restricted-syntax': 'off',
    'dot-notation': 'off',
    'guard-for-in': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/prop-types': 'off',
    'no-useless-computed-key': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/self-closing-comp': 'off',
    // 460 -> 287
    'react/no-unstable-nested-components': 'off',
    'react/sort-comp': 'off',
    'no-empty-function': 'off',
    'no-useless-constructor': 'off',
    'one-var': 'off',
    'consistent-return': 'off',
    'jsx-a11y/aria-role': 'off',
    'jest/valid-title': 'off',
    'react/no-unescaped-entities': 'off',
    'react/require-default-props': 'off',
    'no-restricted-globals': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'import/order': 'off',
    // 287 -> 107
    'react/no-unused-prop-types': 'off',
    'react/no-array-index-key': 'off',
    'no-unneeded-ternary': 'off',
    camelcase: 'off',
    'import/no-useless-path-segments': 'off',
    'no-return-await': 'off',
    'no-nested-ternary': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-return-assign': 'off',
    'no-await-in-loop': 'off',
    'no-undef-init': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'vars-on-top': 'off',
    'no-var': 'off',
    'import/no-dynamic-require': 'off',
    'prefer-arrow-callback': 'off',
    'func-names': 'off',
    'no-continue': 'off',
    'valid-typeof': 'off',
    'no-unsafe-optional-chaining': 'off',
    'default-case': 'off',
    'no-throw-literal': 'off',
    'react/no-unused-state': 'off',
    'react/static-property-placement': 'off',
    'react/state-in-constructor': 'off',
    'react/no-children-prop': 'off',
    'prefer-object-spread': 'off',
    'no-lonely-if': 'off',
    'prefer-template': 'off',
    'no-useless-return': 'off',
  },
  overrides: [
    {
      // overrides for test files
      files: ['*.spec.*', '*.test.*', 'src/**/test/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
