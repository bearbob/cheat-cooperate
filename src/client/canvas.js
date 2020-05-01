const ELEMENTS = {
  button_cooperate: {
    x: 10,
    y: 10,
    width: 100,
    height: 40,
    text: 'COOP',
    color: 'rgb(0,155,214)',
    onClick: (event) => {
      var mousePos = getMousePos(canvas, event);
      if (isInside(mousePos, ELEMENTS.button_cooperate)) {
        console.log("Cooperating");
        socket.to(roomId).emit('cooperate', true);
      }
    },
  },

  button_cheat: {
    x: 120,
    y: 10,
    width: 100,
    height: 40,
    text: 'CHEAT',
    color: 'rgb(255,47,24)',
    onClick: (event) => {
      var mousePos = getMousePos(canvas, event);
      if (isInside(mousePos, ELEMENTS.button_cheat)) {
        console.log("Cheating");
        socket.to(roomId).emit('cooperate', false);
      }
    },
  },

  button_replay: {
    x: 120,
    y: 210,
    width: 100,
    height: 40,
    text: 'READY',
    color: 'rgb(134,214,144)',
    onClick: (event) => {
      var mousePos = getMousePos(canvas, event);
      if (isInside(mousePos, ELEMENTS.button_replay)) {
        console.log("Replaying");
        socket.to(roomId).emit('replay', true);
      }
    },
  },
};

const TEXTSIZE = 16;

var canvas = document.getElementById('interface_canvas');
var ctx = canvas.getContext('2d');
const rc = rough.canvas(document.getElementById('interface_canvas'));

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

function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //remove all event listeners of the canvas
  canvas.removeEventListener('click', ELEMENTS.button_cooperate.onClick);
  canvas.removeEventListener('click', ELEMENTS.button_cheat.onClick);
  canvas.removeEventListener('click', ELEMENTS.button_replay.onClick);
}

function drawTextScreen(message) {
  ctx.font = TEXTSIZE+"px FuturaHandwritten";

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillText(
    message,
    15,
    TEXTSIZE+15
  );
}

function drawScore(score) {
  ctx.font = TEXTSIZE+"px FuturaHandwritten";

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillText(
    'Score: '+score,
    15,
    2*TEXTSIZE+30
  );
}

function drawReplayButton() {
  ctx.font = "30px FuturaHandwritten";

  rc.rectangle(
    ELEMENTS.button_replay.x,
    ELEMENTS.button_replay.y,
    ELEMENTS.button_replay.width,
    ELEMENTS.button_replay.height,
    {
      fill: ELEMENTS.button_replay.color,
      fillWeight: 3
    },
  );
  ctx.fillStyle = 'rgb(32, 32, 32)';
  ctx.fillText(
    ELEMENTS.button_replay.text,
    ELEMENTS.button_replay.x,
    ELEMENTS.button_replay.y + ELEMENTS.button_replay.height - 10,
  );
  canvas.addEventListener('click', ELEMENTS.button_replay.onClick);
}

function drawDecisionInterface() {
  ctx.font = "20px FuturaHandwritten";

  rc.rectangle(
    ELEMENTS.button_cooperate.x,
    ELEMENTS.button_cooperate.y,
    ELEMENTS.button_cooperate.width,
    ELEMENTS.button_cooperate.height,
    {
      fill: ELEMENTS.button_cooperate.color,
      fillWeight: 3
    },
  );
  ctx.fillStyle = 'rgb(32, 32, 32)';
  ctx.fillText(
    ELEMENTS.button_cooperate.text,
    ELEMENTS.button_cooperate.x,
    ELEMENTS.button_cooperate.y + ELEMENTS.button_cooperate.height - 10,
  );
  ctx.strokeRect(2, 2, 2, 2);
  canvas.addEventListener('click', ELEMENTS.button_cooperate.onClick);

  rc.rectangle(
    ELEMENTS.button_cheat.x,
    ELEMENTS.button_cheat.y,
    ELEMENTS.button_cheat.width,
    ELEMENTS.button_cheat.height,
    {
      fill: ELEMENTS.button_cheat.color,
      fillWeight: 3
    },
  );
  ctx.fillStyle = 'rgb(32, 32, 32)';
  ctx.fillText(
    ELEMENTS.button_cheat.text,
    ELEMENTS.button_cheat.x,
    ELEMENTS.button_cheat.y + ELEMENTS.button_cheat.height - 10,
  );
  canvas.addEventListener('click', ELEMENTS.button_cheat.onClick);
}
