/** @type {import('jest').Config} */
const path = require('path');

const config = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.js$': path.join(__dirname, 'jest.transformer.js'),
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm/.*jose|jose)/)',
  ],
};

module.exports = config;