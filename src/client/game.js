var socket = io();
socket.emit('new player');

socket.on('state', function(playerObject) {
  console.log('Received state: '+playerObject.state);
  switch(playerObject.state) {
    case STATE.waitingForPlayers:
      drawTextScreen('Not enough players');
      break;
    case STATE.decision:
      drawDecisionInterface();
      break;
    case STATE.waitingForOpponent:
      drawTextScreen('Waiting for the other player to decide...');
      break;
    case STATE.result:
      drawTextScreen('Game has ended. Result: '+playerObject.result);
      break;
  }
});

var currentState = STATE.decision;

setupCanvas();
drawDecisionInterface();
