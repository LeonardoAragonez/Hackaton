const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  // SonarCloud lee sonar.typescript.lcov.reportPaths=coverage/**/lcov.info
  coverageReporters: ['html', 'lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
