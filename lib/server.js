var io,
  funcs,
  http = require('http'),
  read = require('fs').readFileSync;

require('sugar')

// process request
function proc(socket, method, key, data) {
  var func = funcs[method + '-' + key];
  if (!func) {
    var res = {
      status: {
        code: 404,
        message: 'Not Found'
      }
    };
    console.log('%s %s %s %s', method, key, res.status.code, res.status.message);
    socket.emit(method + '-' + key, res);
  } else {
    func(socket, data, function (res) {
      if (!res) {
        res = {};
      }
      if (!res.status || !res.status.code) {
        res.status = {
          code: 200,
          message: 'OK'
        }
      }
      console.log('%s %s %s %s', method, key, res.status.code, res.status.message);
      socket.emit(method + '-' + key, res);
    }, socket);
  }
}

/**
 * @param srv: server || port
 * @param opts
 */
function Server(srv, opts) {
  if (Number(srv) == srv) {
    srv = Number(srv);
  }
  if ('number' == typeof srv) {
    console.log('creating http server and binding to %d', srv);
    var port = srv;
    srv = http.Server(function(req, res){
      res.writeHead(404);
      res.end();
    });
    srv.listen(port);
  }

  opts = opts || {};
  opts.path = opts.path || '/restful-socket';

  this.path(opts.path);

  if (!io) {
    io = require('socket.io')(srv, opts);
    io.sockets.on('connection', function (socket) {
      // req = {key, data}
      socket.on('get', function (req) {
        proc(socket, 'get', req.key, req.data);
      });
      socket.on('post', function (req) {
        proc(socket, 'post', req.key, req.data);
      });
      socket.on('put', function (req) {
        proc(socket, 'put', req.key, req.data);
      });
      socket.on('delete', function (req) {
        proc(socket, 'delete', req.key, req.data);
      });

      // event when disconnect
      var onDisconnect = funcs['on-disconnect'];
      socket.on('disconnect', function () {
        if (onDisconnect) {
          onDisconnect(socket);
        }
      });

      // event when connecting
      var onConnection = funcs['on-connection'];
      if (onConnection) {
        onConnection(socket);
      }
    });

    this.attachServe(srv);
    console.log('restful-socket server running');
  }
  if (!funcs) {
    funcs = {};
  }
}

Server.prototype.on = function (key, func) {
  funcs['on-' + key] = func;
};
Server.prototype.get = function (key, func) {
  funcs['get-' + key] = func;
};
Server.prototype.post = function (key, func) {
  funcs['post-' + key] = func;
};
Server.prototype.put = function (key, func) {
  funcs['put-' + key] = func;
};
Server.prototype.delete = function (key, func) {
  funcs['delete-' + key] = func;
};

Server.prototype.path = function(v){
  if (!arguments.length) return this._path;
  this._path = v.replace(/\/$/, '');
  return this;
};

// download client js
var clientSource = read(require.resolve('restful-socket-client/restful-socket-client.js'), 'utf-8');
var clientVersion = require('restful-socket-client/package').version;

Server.prototype.attachServe = function(srv){
  var url = this._path + '/restful-socket-client.js';
  var evs = srv.listeners('request').slice(0);
  var self = this;
  srv.removeAllListeners('request');
  srv.on('request', function(req, res) {
    if (0 == req.url.indexOf(url)) {
      self.serve(req, res);
    } else {
      for (var i = 0; i < evs.length; i++) {
        evs[i].call(srv, req, res);
      }
    }
  });
};
Server.prototype.serve = function(req, res){
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

exports = module.exports = Server;