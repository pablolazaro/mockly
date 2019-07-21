const basename = require('path').basename;

const fs = jest.genMockFromModule('fs');
const map = new Map();

fs.__setMockFiles = files => {
  Object.keys(files).forEach(key => {
    map.set(basename(key), files[key]);
  });
};

fs.__clearMockFiles = () => map.clear();

fs.readFile = (path, encoding, callback) => {
  callback(null, map.get(basename(path)));
};

module.exports = fs;
