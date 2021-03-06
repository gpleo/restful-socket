var http = require('http'),
  fs = require('fs'),
  RSServer = require('../index.js'),
  server,
  rsServer;

server = http.createServer(function (req, res) {
  fs.readFile(__dirname + '/client.html', function (err, data) {
    res.end(data);
  });
}).listen(9000);

rsServer = new RSServer(server);

console.log('Server running on port 9000');

// demo crud function
var persons = [{
  id: 1,
  name: 'One'
}, {
  id: 2,
  name: 'Two'
}],
  next_id = 3,
  connection_number = 0;

rsServer.onConnection = function (socket) {
  console.log('connection.(%s)', ++connection_number);
};
rsServer.onDisconnect = function (socket) {
  console.log('disconnect.(%s)', --connection_number);
};

rsServer.get('/persons', function (socket, req, callback) {
  callback({
    persons: persons
  });
});

rsServer.post('/persons', function (socket, req, callback) {
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

rsServer.delete('/persons/:id', function (socket, req, callback) {
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