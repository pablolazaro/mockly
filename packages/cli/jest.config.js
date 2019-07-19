module.exports = {
  name: 'server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/packages/cli',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './reports/packages/cli' }]
  ]
};
