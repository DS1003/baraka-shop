const path = require('path');

// Custom alias resolver for Node.js
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.resolve(__dirname, '..', request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require('ts-node').register({
  compilerOptions: {
    module: 'CommonJS',
    target: 'ES2022',
    moduleResolution: 'node',
    jsx: 'react',
    baseUrl: '.',
    paths: {
      '@/*': ['./*'],
    },
  },
  transpileOnly: true,
});

require('./test-stock-scenarios.ts');
