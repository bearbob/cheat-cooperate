var socket = io();
var roomId;

function createServer() {
  let id = encodeURI(document.getElementById('serverid_input').value);
  console.log('Attempting to create server "'+id+'"');
  if(id.length < 1) {
    document.getElementById('selection_error').innerHTML='The game ID cannot be empty';
    return;
  }

  socket.emit('create', id);
}

function joinServer() {
  let id = encodeURI(document.getElementById('serverid_input').value);
  console.log('Attempting to join server "'+id+'"');
  if(id.length < 1) {
    document.getElementById('selection_error').innerHTML='The game ID cannot be empty';
    return;
  }
  socket.emit('join', id);
}

socket.on('joined_game', (room) => {
  roomId = room.id;
  document.getElementById('action_menu').style.display='none';
  document.getElementById('game_id').innerHTML='Room: '+room.id;
});

socket.on('join_error', (message) => {
  console.log('Join failed. Error: '+message);
  document.getElementById('selection_error').innerHTML=message;
});

socket.on('state', function(playerObject) {
  console.log('Received state: '+playerObject.state);
  switch(playerObject.state) {
    case STATE.waitingForPlayers:
      clearScreen();
      drawTextScreen('Not enough players');
      break;
    case STATE.decision:
      clearScreen();
      drawDecisionInterface();
      drawScore(playerObject.score);
      break;
    case STATE.waitingForOpponent:
      clearScreen();
      drawTextScreen('Waiting for the other player to decide...');
      drawScore(playerObject.score);
      break;
    case STATE.result:
      clearScreen();
      drawTextScreen('Game has ended. Result: '+playerObject.result);
      drawScore(playerObject.score);
      drawReplayButton();
      break;
  }
});

var currentState = STATE.decision;

setupCanvas();
drawTextScreen('Not enough players');
