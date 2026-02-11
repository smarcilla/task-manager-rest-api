const config = {
  clearMocks: true,

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '<rootDir>/test/',
    '/node_modules/',
    'src/index.js',
  ],

  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['json', 'text', 'lcov', 'clover'],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  testMatch: [
    '**/__tests__/**/*.?([mc])[jt]s?(x)',
    '**/?(*.)+(spec|test).?([mc])[jt]s?(x)',
  ],
};

export default config;
