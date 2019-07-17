module.exports = {
  name: 'server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/cli',

  reporters: ["default", ["jest-junit", {outputDirectory: './reports/apps/cli'}]]
};
