module.exports = {
  displayName: 'shared-catalog',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/shared-catalog',
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|rettime|until-async)/)',
  ],
};
