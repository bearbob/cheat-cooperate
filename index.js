/**
 * Cheat-Cooperate
 * @author Björn Schmidt
 * @created 2020-04-27
 */

// Server constants
const VERSION = '1.0.0';
const APPNAME = 'Cheat-Cooperate';

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

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'src/index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Running '+APPNAME+' v'+VERSION);
  console.log('Starting server on port 5000');
});

//------------------------------------------------------------------

// Add the WebSocket handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('create', (roomId) => {
    let createdServerSuccessfully = communication.createServer(socket, roomId);
    if(createdServerSuccessfully) {
      communication.playerJoined(io, socket, roomId);
    }
  });

  socket.on('join', (roomId) => {
    let joined = communication.playerJoined(io, socket, roomId);
    if(joined) {
      socket.emit('joined_game', {id: roomId});
    } else {
      socket.emit('join_error', 'Game with given ID does not exist or is locked.');
    }
  });

  socket.on('disconnect', () => {
    communication.playerDisconnected(io, socket);
  });

  socket.on('cooperate', (cooperates) => {
    try {
      communication.sendDecision(io, socket, cooperates);
    } catch(aEx) {
      console.log('The game has encountered an exception in "communication.sendDecision(...)');
      console.log(aEx);
      socket.emit('crash');
    }
  });

  socket.on('replay', () => {
    try {
      communication.replay(io, socket);
    } catch(aEx) {
      console.log('The game has encountered an exception in "communication.replay(...)');
      console.log(aEx);
      socket.emit('crash');
    }
  });

  socket.on('vote', () => {
    try {
      communication.sendStartVote(io, socket);
    } catch(aEx) {
      console.log('The game has encountered an exception in "communication.sendStartVote(...)');
      console.log(aEx);
      socket.emit('crash');
    }

  });
});
