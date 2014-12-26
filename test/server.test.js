var assert = require('assert'),
  Server = require('../lib/server.js'),
  server = null;

require('sugar');

describe('Server', function () {
  describe('Server(srv, opts)', function () {
    afterEach(function () {
      server.close();
    });
    it('should create server', function (done) {
      server = new Server(9000);
      assert(server.io);
      done();
    });
    it('should default path', function (done) {
      server = new Server(9000);
      assert.equal(server._path, '/restful-socket');
      done();
    });
    it('should change path', function (done) {
      server = new Server(9000, {path: '/rs'});
      assert.equal(server._path, '/rs');
      done();
    });
  });
});