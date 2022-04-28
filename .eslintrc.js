module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  globals: {
    // global variables, that should be assumed by eslint as defined
    JSX: true,
    RequiredNonNullable: true,
    Dictionary: true,
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
    /**
     * Rules we don't want to be enabled
     * "off" or 0: turn off the rule completely; "warn" or 1;  "error" or 2
     */
    'arrow-body-style': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-boolean-value': 'off',
    'react/jsx-filename-extension': [2, { extensions: ['.jsx', '.tsx'] }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    // disabled to let "@typescript-eslint/*" rules do it's job
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['warn', { ignoreDeclarationMerge: true }], // still will warn on exporting enums :(

    /**
     * Up for discussion
     * */
    'react/function-component-definition': 'off',
    'react/destructuring-assignment': 'off',

    /**
     * temporarily off or warn
     * */
    // some setup of eslint or prettier needed
    'import/no-extraneous-dependencies': 'off', // 715 - !important
    'react/jsx-props-no-spreading': 'off', // 119

    // classic
    'no-use-before-define': 'off', // 49
    'no-shadow': 'off', // 104
    'no-param-reassign': 'off', // 28
    'no-unused-expressions': 'warn', // 5
    'prefer-destructuring': 'off', // 34
    'no-empty-function': 'off',
    'no-useless-constructor': 'warn', // 1
    'no-useless-computed-key': 'off',
    'no-restricted-syntax': 'off',
    'no-else-return': 'off',
    'no-plusplus': 'off',
    'no-var': 'off',
    'no-continue': 'off',
    'no-unsafe-optional-chaining': 'off',
    'no-throw-literal': 'off',
    'no-lonely-if': 'off',
    'no-useless-return': 'off',
    'no-return-await': 'off',
    'no-nested-ternary': 'off',
    'no-restricted-globals': 'off',
    'no-return-assign': 'off',
    'no-await-in-loop': 'off',
    'no-undef-init': 'off',
    'no-unneeded-ternary': 'off',
    'no-underscore-dangle': 'off',
    'prefer-object-spread': 'off',
    'prefer-template': 'off',
    'default-case': 'off',
    'valid-typeof': 'off',
    'object-shorthand': 'off',
    'operator-assignment': 'off',
    'array-callback-return': 'off',
    'global-require': 'off',
    'dot-notation': 'off',
    'guard-for-in': 'off',
    'one-var': 'off',
    'vars-on-top': 'off',
    'consistent-return': 'off',
    'prefer-promise-reject-errors': 'off',
    'prefer-arrow-callback': 'off',
    'func-names': 'off',
    eqeqeq: 'warn', // 12

    // import
    'import/no-dynamic-require': 'warn', // 1

    // react
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
  },
  overrides: [
    {
      // overrides for test files
      files: ['*.spec.*', '*.test.*', '*.stories.*', 'src/**/test/*', 'src/**/mocks/*'],
      rules: {
        camelcase: 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-console': 'off',

        'jsx-a11y/aria-role': 'off',
        'jsx-a11y/control-has-associated-label': 'off',
      },
    },
    {
      // rules which not make sense for TS files
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
