var assert = require('assert'),
  Router = require('../lib/router.js'),
  router = null;

require('sugar');

describe('Router', function () {
  describe('.add(method, expr, fn)', function () {
    beforeEach(function () {
      router = new Router();
    });
    it('should one record in routers', function (done) {
      router.add('get', '/orders');
      assert(router.routes.length === 1);
      done();
    });
    it('should record method', function (done) {
      router.add('get', '/orders');
      assert.equal(router.routes[0].method, 'get');
      done();
    });
    it('should record function', function (done) {
      router.add('get', '/orders', function (socket, req, callback) {
        callback();
      });
      assert(Object.isFunction(router.routes[0].fn));
      done();
    });
    it('should regular expression conversion 1', function (done) {
      router.add('get', '/orders');
      assert.equal(router.routes[0].pattern, '/^\\/orders$/');
      done();
    });
    it('should regular expression conversion 2', function (done) {
      router.add('get', '/orders/date');
      assert.equal(router.routes[0].pattern, '/^\\/orders\\/date$/');
      done();
    });
    it('should regular expression conversion 3', function (done) {
      router.add('get', '/orders/:id');
      assert.equal(router.routes[0].pattern, '/^\\/orders\\/([^/]*)$/');
      done();
    });
    it('should regular expression conversion 4', function (done) {
      router.add('get', '/orders/:id/:day');
      assert.equal(router.routes[0].pattern, '/^\\/orders\\/([^/]*)\\/([^/]*)$/');
      done();
    });
    it('should has one param', function (done) {
      // the param is path
      router.add('get', '/orders');
      assert.equal(router.routes[0].params.length, 1);
      done();
    });
    it('should has correct param name', function (done) {
      // the param is path
      router.add('get', '/orders');
      assert.equal(router.routes[0].params[0], 'path');
      done();
    });
    it('should has two params', function (done) {
      router.add('get', '/orders/:id');
      assert.equal(router.routes[0].params.length, 2);
      done();
    });
    it('should has correct param name', function (done) {
      router.add('get', '/orders/:id');
      assert.equal(router.routes[0].params[1], 'id');
      done();
    });
    it('should has three params', function (done) {
      router.add('get', '/orders/:id/:day');
      assert.equal(router.routes[0].params.length, 3);
      done();
    });
    it('should has correct param name', function (done) {
      router.add('get', '/orders/:id/:day');
      assert.equal(router.routes[0].params[2], 'day');
      done();
    });
  });

  describe('.run(socket, req)', function () {
    beforeEach(function () {
      router = new Router();
      router.add('get', '/orders', function (socket, req, callback) {
        callback({
          status: {
            code: 200,
            message: 'OK'
          }
        });
      });
      router.add('get', '/orders/:id', function (socket, req, callback) {
        callback({
          status: {
            code: 200,
            message: 'OK'
          },
          params: {
            id: req.params.id
          }
        });
      });
    });
    it('should find route 1', function (done) {
      var socket = {
        emit: function (event, res) {
          assert.equal(res.status.code, 200);
          done();
        }
      };
      router.run(socket, {
        method: 'get',
        path: '/orders'
      });
    });
    it('should not find route', function (done) {
      var socket = {
        emit: function (event, res) {
          assert.equal(res.status.code, 404);
          done();
        }
      };
      router.run(socket, {
        method: 'get',
        path: '/eorders'
      });
    });
    it('should find route 2', function (done) {
      var socket = {
        emit: function (event, res) {
          assert.equal(res.status.code, 200);
          done();
        }
      };
      router.run(socket, {
        method: 'get',
        path: '/orders/123'
      });
    });
    it('should has correct param value', function (done) {
      var socket = {
        emit: function (event, res) {
          assert.equal(res.params.id, 123);
          done();
        }
      };
      router.run(socket, {
        method: 'get',
        path: '/orders/123'
      });
    });
  });
});