module.exports = {
  name: 'server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/packages/server',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './reports/packages/server' }]
  ]
};
