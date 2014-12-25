function Router() {
  this.routes = [];
}

Router.prototype.add = function(method, expr, fn) {
  var params, pattern, routes;
  if (typeof expr === 'object') {
    routes = expr;
  } else {
    routes = {};
    routes[expr] = fn;
  }

  for (expr in routes) {
    fn = routes[expr];
    pattern = "^" + expr + "$";
    pattern = pattern.replace(/([?=,\/])/g, '\\$1');
    params = ['path'];
    pattern = pattern.replace(/(:)([\w\d]+)/g, function(all, op, name) {
      params.push(name);
      return '([^/]*)';
    });

    this.routes.push({
      method: method,
      expr: expr,
      params: params,
      pattern: new RegExp(pattern),
      fn: fn
    });
  }
};

Router.prototype.run = function(socket, req) {
  var args, i, m, value, _i, _j, _len, _len1, _ref;
  _ref = this.routes;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    route = _ref[_i];
    if (route.method === req.method && (m = route.pattern.exec(req.path))) {
      args = {};
      for (i = _j = 0, _len1 = m.length; _j < _len1; i = ++_j) {
        value = m[i];
        args[route.params[i]] = decodeURIComponent(value);
      }
      req.param = args;
      route.fn(socket, req, function (res) {
        if (!res) {
          res = {};
        }
        if (!res.status || !res.status.code) {
          res.status = {
            code: 200,
            message: 'OK'
          }
        }
        console.log('%s %s %s %s', req.method, req.path, res.status.code, res.status.message);
        socket.emit(req.method + '-' + req.path, res);
      });
      return;
    }
  }
  
  // not found
  var res = {
    status: {
      code: 404,
      message: 'Not Found'
    }
  };
  console.log('%s %s %s %s', req.method, req.path, res.status.code, res.status.message);
  socket.emit(req.method + '-' + req.path, res);
}

exports = module.exports = Router;