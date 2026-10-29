import type { Config } from 'jest'

// A plain Node service, so no jest-expo (its React Native environment shims globals Hono needs).
// Babel strips the types; the tests run in Node's own environment with the real Request/Response.
const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
  coverageReporters: ['text', 'json-summary', 'lcov'],
}

export default config
