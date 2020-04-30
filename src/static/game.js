const STATE = {
  decision: 0,
  waiting: 1,
}

var socket = io();
socket.emit('new player');

setInterval(function() {
  socket.on('decision', function(result) {
    console.log('Decision result: '+result);
  });

  socket.on('error', function(e) {
    console.log('Error: '+e.message);
    drawErrorScreen(e.message);
  });
}, 1000);

var currentState = STATE.decision;

setupCanvas();
drawDecisionInterface();
