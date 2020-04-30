const ELEMENTS = {
  button_cooperate: {
    x: 10,
    y: 10,
    width: 100,
    height: 40,
    text: 'COOP',
    color: 'rgb(0,155,214)',
    onClick: () => {
      console.log("Cooperating");
      socket.emit('cooperate', true);
    },
  },

  button_cheat: {
    x: 120,
    y: 10,
    width: 100,
    height: 40,
    text: 'CHEAT',
    color: 'rgb(255,47,24)',
    onClick: () => {
      console.log("Cheating");
      socket.emit('cooperate', false);
    },
  },
};

var canvas = document.getElementById('interface_canvas');
var ctx = canvas.getContext('2d');

//Function to get the mouse position
function getMousePos(canvas, event) {
  "use strict";
  var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
//Function to check whether a point is inside a rectangle
function isInside(pos, rect){
  "use strict";
  return pos.x > rect.x &&
         pos.x < rect.x+rect.width &&
         pos.y < rect.y+rect.height &&
         pos.y > rect.y;
}

function setupCanvas() {
  //get DPI to fix the scaling, see https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
  let dpi = window.devicePixelRatio;
  //get CSS height
  //the + prefix casts it to an integer
  //the slice method gets rid of "px"
  let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);//get CSS width
  let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
  //scale the canvas
  canvas.setAttribute('height', style_height * dpi);
  canvas.setAttribute('width', style_width * dpi);
}

function drawWaitScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const textHeight = 30;
  ctx.font = textHeight+"px Verdana";

  ctx.fillStyle = 'rgb(0, 0, 0)';
  var txt = 'Waiting for the other player to decide...';
  ctx.fillText(
    txt,
    15,
    textHeight+15
  );
}

function drawErrorScreen(message) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const textHeight = 30;
  ctx.font = textHeight+"px Verdana";

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillText(
    message,
    15,
    textHeight+15
  );
}

function drawDecisionInterface() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "30px Verdana";

  ctx.fillStyle = ELEMENTS.button_cooperate.color;
  ctx.fillRect(
    ELEMENTS.button_cooperate.x,
    ELEMENTS.button_cooperate.y,
    ELEMENTS.button_cooperate.width,
    ELEMENTS.button_cooperate.height
  );
  ctx.fillStyle = 'rgb(250, 250, 235)';
  ctx.fillText(
    ELEMENTS.button_cooperate.text,
    ELEMENTS.button_cooperate.x,
    ELEMENTS.button_cooperate.y + ELEMENTS.button_cooperate.height - 10,
  );

  ctx.fillStyle = ELEMENTS.button_cheat.color;
  ctx.fillRect(
    ELEMENTS.button_cheat.x,
    ELEMENTS.button_cheat.y,
    ELEMENTS.button_cheat.width,
    ELEMENTS.button_cheat.height
  );
  ctx.fillStyle = 'rgb(250, 250, 235)';
  ctx.fillText(
    ELEMENTS.button_cheat.text,
    ELEMENTS.button_cheat.x,
    ELEMENTS.button_cheat.y + ELEMENTS.button_cheat.height - 10,
  );

  //Binding the click event on the canvas
  canvas.addEventListener('click', function(evt) {
      var mousePos = getMousePos(canvas, evt);

      if (isInside(mousePos, ELEMENTS.button_cooperate)) {
          ELEMENTS.button_cooperate.onClick();
      }

      if (isInside(mousePos, ELEMENTS.button_cheat)) {
          ELEMENTS.button_cheat.onClick();
      }
  }, false);
}
