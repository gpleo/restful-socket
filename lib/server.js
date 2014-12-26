var http = require('http'),
  read = require('fs').readFileSync,
  Router = require('./router.js');

require('sugar');

/**
 * @param srv: server || port
 * @param opts
 */
function Server(srv, opts) {
  var self = this,
    port;
  if (Number(srv) == srv) {
    srv = Number(srv);
  }
  if ('number' == typeof srv) {
    console.log('creating http server and binding to %d', srv);
    port = srv;
    srv = http.Server(function (req, res) {
      res.writeHead(404);
      res.end();
    });
    srv.listen(port);
  }

  opts = opts || {};
  opts.path = opts.path || '/restful-socket';

  self.path(opts.path);

  self.router = new Router();

  self.server = srv;

  self.io = require('socket.io')(srv, opts);
  self.io.sockets.on('connection', function (socket) {
    socket.on('get', function (req) {
      req.method = 'get';
      self.router.run(socket, req);
    });
    socket.on('post', function (req) {
      req.method = 'post';
      self.router.run(socket, req);
    });
    socket.on('put', function (req) {
      req.method = 'put';
      self.router.run(socket, req);
    });
    socket.on('delete', function (req) {
      req.method = 'delete';
      self.router.run(socket, req);
    });

    // event when disconnect
    socket.on('disconnect', function () {
      if (self.onDisconnect) {
        self.onDisconnect(socket);
      }
    });

    // event when connecting
    if (self.onConnection) {
      self.onConnection(socket);
    }
  });

  this.attachServe(srv);
  console.log('restful-socket server running');
}

// close server
Server.prototype.close = function () {
  this.server.close(function () {
    console.log('restful-socket server closed');
  });
};

// set router
Server.prototype.get = function (expr, fn) {
  this.router.add('get', expr, fn);
};
Server.prototype.post = function (expr, fn) {
  this.router.add('post', expr, fn);
};
Server.prototype.put = function (expr, fn) {
  this.router.add('put', expr, fn);
};
Server.prototype.delete = function (expr, fn) {
  this.router.add('delete', expr, fn);
};

// download client js
var clientSource = read(require.resolve('restful-socket-client/restful-socket-client.js'), 'utf-8');
var clientVersion = require('restful-socket-client/package').version;

Server.prototype.path = function (v) {
  if (!arguments.length) {
    return this._path;
  }
  this._path = v.replace(/\/$/, '');
  return this;
};

Server.prototype.attachServe = function (srv) {
  var url = this._path + '/restful-socket-client.js',
    evs = srv.listeners('request').slice(0),
    self = this,
    i,
    len;
  srv.removeAllListeners('request');
  srv.on('request', function (req, res) {
    if (0 == req.url.indexOf(url)) {
      self.serve(req, res);
    } else {
      for (i = 0, len = evs.length; i < len; i++) {
        evs[i].call(srv, req, res);
      }
    }
  });
};
Server.prototype.serve = function (req, res) {
  var etag = req.headers['if-none-match'];
  if (etag) {
    if (clientVersion == etag) {
      res.writeHead(304);
      res.end();
      return;
    }
  }

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('ETag', clientVersion);
  res.writeHead(200);
  res.end(clientSource);
};

module.exports = Server;