// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var constants = require('./src/server/constants');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/src/client'));

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
    console.log('A user disconnected');
    delete players[socket.id];
  });

  socket.on('new player', function() {
    //a new player wants to join. Check if this is possible
    let playerCount = Object.keys(players).length;
    if(playerCount >= 2) {
      console.log('Cannot add new player, maximum players already reached.');
      socket.emit('state', constants.state.maxPlayersReached);
      return;
    }
    players[socket.id] = {
      score: 0,
      state: constants.state.waitingForPlayers,
      cooperate: null,
      result: null,
    };
    socket.emit('state', players[socket.id]);

    playerIds = Object.keys(players);
    console.log('Added new player to the game. Players: '+playerIds.length);
    if(playerIds.length == 2) {
      playerIds.forEach(socketId => {
        players[socketId].state = constants.state.decision;
        io.to(socketId).emit('state', players[socketId]);
      });
    }
  });

  socket.on('cooperate', function(cooperates) {
    if(players[socket.id].cooperate != null && players[socket.id].state != constants.state.decide) {
      console.log('Player already voted.');
      return;
    }
    players[socket.id].cooperate = cooperates;
    players[socket.id].state = constants.state.waitingForOpponent;
    playerIds = Object.keys(players);

    let waitingPlayers = 0;
    let allCooperate = true;
    playerIds.forEach(socketId => {
      if (players[socketId].state == constants.state.waitingForOpponent) {
        waitingPlayers++;
        if(!players[socketId].cooperate) {
          allCooperate = false;
        }
      }
    });
    if(waitingPlayers == playerIds.length) {
      playerIds.forEach(socketId => {
        players[socketId].state = constants.state.result;
        players[socketId].result = allCooperate;
        io.to(socketId).emit('state', players[socketId]);
      });
    } else {
      socket.emit('state', players[socket.id]);
    }
  });
});
