Promise = require('bluebird');
Promise.setScheduler((fn) => {
  setImmediate(fn);
});
