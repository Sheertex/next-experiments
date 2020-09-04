const path = require('path')

module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/', '/samples/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '.+\\.(|png|jpg|ttf|woff|woff2|svg|aac|mp3|ogg|wav)$': path.resolve(
      __dirname,
      './tests/fileMock'
    )
  },
}