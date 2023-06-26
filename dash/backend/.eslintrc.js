module.exports = {
  parser: '@typescript-eslint/parser',
  overrides: [{
    files: ['*.ts', '*.tsx'], // TypeScript file extensions

    // extend TypeScript plugins here
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],

    parserOptions: {
      project: 'tsconfig.json', // Specify it only for TypeScript files
      sourceType: 'module',
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }],
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    mocha: true,
    es6: true,
  },
};
