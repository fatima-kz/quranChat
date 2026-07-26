const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'api/**'],
  },
];
