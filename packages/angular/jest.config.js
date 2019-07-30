module.exports = {
  name: 'angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/packages/angular',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './reports/packages/angular' }]
  ]
};
