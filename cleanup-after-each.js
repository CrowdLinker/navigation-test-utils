const cleanup = require('./dist/index').cleanup;

afterEach(() => {
  cleanup();
});
