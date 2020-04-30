var socket = io();
socket.emit('new player');

setInterval(function() {
  socket.on('decision', function(result) {
    console.log('Decision result: '+result);
  });

  socket.on('state', function(state) {
    console.log('Received state: '+state);
    switch(state) {
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
        drawTextScreen('Game has ended.');
        break;
    }
  });

  socket.on('result', function(result) {
    console.log('Received result: '+result);
  });
}, 1000);

var currentState = STATE.decision;

setupCanvas();
drawDecisionInterface();
