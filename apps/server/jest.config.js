module.exports = {
  name: 'server',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/server',
  reporters: ["default", ["jest-junit", {outputDirectory: './reports/apps/server'}]]
};
