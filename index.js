// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var constants = require('./src/server/constants');
var communication = require('./src/server/communication');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/src/client'));
app.use('/res', express.static(__dirname + '/src/resources'));
app.use('/lib', express.static(__dirname + '/node_modules/roughjs/bundled'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'src/index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

//------------------------------------------------------------------

var players = {};
// Add the WebSocket handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    communication.playerDisconnected(socket);
  });

  socket.on('new player', () => {
    communication.playerJoined(io, socket);
  });

  socket.on('cooperate', (cooperates) => {
    communication.sendDecision(io, socket, cooperates);
  });

  socket.on('replay', () => {
    communication.replay(io, socket);
  });
});
