module.exports = {
  name: 'mockly-workspace',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/mockly-workspace',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
