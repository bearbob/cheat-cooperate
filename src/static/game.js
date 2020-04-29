const ELEMENTS = {
  button_cooperate: {
    x: 10,
    y: 10,
    width: 50,
    height: 20,
    color: 'rgb(0,155,214)',
    onClick: () => {
      console.log("Cooperating");
      socket.emit('cooperate', true);
    },
  },

  button_cheat: {
    x: 70,
    y: 10,
    width: 50,
    height: 20,
    color: 'rgb(255,47,24)',
    onClick: () => {
      console.log("Cheating");
      socket.emit('cooperate', false);
    },
  },
};

var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

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

//get DPI to fix the scaling, see https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
let dpi = window.devicePixelRatio;
var canvas = document.getElementById('interface_canvas');
var ctx = canvas.getContext('2d');
//get CSS height
//the + prefix casts it to an integer
//the slice method gets rid of "px"
let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);//get CSS width
let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
//scale the canvas
canvas.setAttribute('height', style_height * dpi);
canvas.setAttribute('width', style_width * dpi);

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


for (var x = 0.5; x < 500; x += 10) {
  ctx.moveTo(x, 0);
  ctx.lineTo(x, 375);
}
ctx.strokeStyle = "#eee";
ctx.stroke();

ctx.fillStyle = ELEMENTS.button_cooperate.color;
ctx.fillRect(
  ELEMENTS.button_cooperate.x,
  ELEMENTS.button_cooperate.y,
  ELEMENTS.button_cooperate.width,
  ELEMENTS.button_cooperate.height
);

ctx.fillStyle = ELEMENTS.button_cheat.color;
ctx.fillRect(
  ELEMENTS.button_cheat.x,
  ELEMENTS.button_cheat.y,
  ELEMENTS.button_cheat.width,
  ELEMENTS.button_cheat.height
);
