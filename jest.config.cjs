module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^axios$': '<rootDir>/__mocks__/axios.ts',
    '^node-fetch$': '<rootDir>/__mocks__/node-fetch.ts',
    '^@slack/webhook$': '<rootDir>/__mocks__/@slack/webhook.ts',
  },
};
