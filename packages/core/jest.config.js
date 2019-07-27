module.exports = {
  name: 'core',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/packages/core',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './reports/packages/core' }]
  ]
};
