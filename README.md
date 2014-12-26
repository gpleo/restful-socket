#restful-socket

[![NPM Version][npm-image]][npm-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## Introduction

在某些如服务器需要即时推送消息给客户端的情况下，会使用WebSocket以实现双向通讯。此时，对于其他原本使用HTTP的请求和数据交互，也可以借用WebSocket来处理，以提高性能，减少流量。
restful-socket基于socket.io，对原本基于事件的交互做了一定封装，以模拟请求/响应模式。

## Installation

```bash
$ npm install restful-socket
```

## API

```js
var RSServer = require('restful-socket');

var server = new RSServer(9000);

server.onConnection = function (socket) {
  console.log('connection.');
};
rsServer.onDisconnect = function (socket) {
  console.log('disconnect.');
};

var persons = [{
  id: 1,
  name: 'One'
}, {
  id: 2,
  name: 'Two'
}];
var next_id = 3;

server.get('/persons', function (socket, req, callback) {
  callback({
    persons: persons
  });
});

server.post('/persons', function (socket, req, callback) {
  if (!req.data || !req.data.person || !req.data.person.name) {
    callback({
      status: {
        code: 400,
        message: 'Bad Request'
      },
      error_message: 'person.name required'
    });
  } else {
    var person = {
      id: next_id++,
      name: req.data.person.name
    };
    persons.push(person);
    callback({
      status: {
        code: 201,
        message: 'Created'
      },
      person: person
    });
  }
});

server.delete('/persons/:id', function (socket, req, callback) {
  var i,
    len;
  for (i = 0, len = persons.length; i < len; i++) {
    if (persons[i].id == req.params.id) {
      persons.splice(i, 1);
      callback();
      return;
    }
  }

  callback({
    status: {
      code: 404,
      message: 'Not Found'
    },
    error_message: 'person id not found'
  });
});
```

server支持四个方法：get、post、put、delete。

另外，会有客户端代码配合：[restful-socket-client](https://github.com/gpleo/restful-socket-client)

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/badge/npm-0.0.3-green.svg
[npm-url]: https://npmjs.org/package/restful-socket
[node-version-image]: https://img.shields.io/node/v/gh-badges.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://travis-ci.org/gpleo/restful-socket.svg?branch=master
[travis-url]: https://travis-ci.org/gpleo/restful-socket
[coveralls-image]: https://img.shields.io/coveralls/gpleo/restful-socket.svg
[coveralls-url]: https://coveralls.io/r/gpleo/restful-socket?branch=master
