let canvas;
let context;
let isMouseDown = false;
let startSquare;
let endSquare;
let currentX;
let currentY;
let lastIndex;
let blockMode = true;
let gridHeight;
let gridWidth;
let gridArray = [];
let delay = 5;
let stop = true;
let dropdownvalue = 0;
let iterations = 0;
const squareSize = 25;
const white = "#FFFFFF";
const black = "#000000";
const green = "#00CC66";
const lightgreen = "#ABFFAD";
const red = "#AA0000";
const blue = "#61B8D2";

// Square object representing a square on the canvas grid
class Square {
  constructor(x, y, width, height, index) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.index = index;
    this.blocked = false;
    this.start = false;
    this.end = false;
    this.colour = white;
  }

  toString() {
    return "Square " + this.index;
  }

  drawRect(colour = undefined) {
    if (colour) {
      this.colour = colour;
    }
    context.beginPath();
    // Draw grid outline of square
    context.fillStyle = black;
    context.fillRect(this.x, this.y, this.width, this.height);

    // Draw coloured inside of square
    context.fillStyle = this.colour;
    context.fillRect(this.x, this.y, this.width - 1, this.height - 1);
    context.stroke();
    context.closePath();
  }

}

window.onload = function() {
  canvas = document.getElementById("myCanvas");
  canvas.width =
    Math.floor((window.innerWidth * 0.8) / squareSize) * squareSize;
  canvas.height = Math.floor(window.innerHeight / squareSize) * squareSize;
  context = canvas.getContext("2d");

  canvas.addEventListener("contextmenu", rightclickHandler, false);
  enableEventListeners();

  gridWidth = Math.floor(canvas.width / squareSize);
  gridHeight = Math.floor(canvas.height / squareSize);

  createGrid();
  drawAll();
};

function updateDropDownValue() {
  let e = document.getElementById("algorithmsDropDown");
  dropdownvalue = parseInt(e.options[e.selectedIndex].value);
}

function mouseUp() {
  isMouseDown = false;
}

function mouseDown(event) {

  if (event.button != 0) {
    return;
  }

  currentX = event.clientX - canvas.offsetLeft;
  currentY = event.clientY - canvas.offsetTop;
  let gridIndex =
    Math.floor(currentX / squareSize) * gridHeight +
    Math.floor(currentY / squareSize);

  if (gridArray[gridIndex].blocked) {
    blockMode = false;
  } else {
    blockMode = true;
  }

  isMouseDown = true;
}

function mouseMove(event) {

  if (event.button != 0) {
    return;
  }

  if (isMouseDown) {
    currentX = event.clientX - canvas.offsetLeft;
    currentY = event.clientY - canvas.offsetTop;

    let gridIndex =
      Math.floor(currentX / squareSize) * gridHeight +
      Math.floor(currentY / squareSize);
    if (lastIndex != gridIndex) {
      clickHandler(event);
      lastIndex = gridIndex;
    }
  }
}

function mouseMove2(event) {
  let x = event.clientX;
  let y = event.clientY;

  if ((x >= canvas.width || x <= 10) || (y >= canvas.height || y < 0)) {
    isMouseDown = false;
  }
}

function rightclickHandler(event) {
  event.preventDefault();
  // clickHandler(event);
}

function clickHandler(event) {

  if (event.button != 0) {
    return;
  }

  // Translate click coordinates to square in gridArray
  let gridIndex =
    Math.floor(currentX / squareSize) * gridHeight +
    Math.floor(currentY / squareSize);

  // console.log(gridArray[gridIndex]);a
  if (gridIndex != 0 && gridIndex < gridArray.length - 1) {
    // If square is currently blocked, unblock
    if (blockMode) {
      gridArray[gridIndex].blocked = true;
      drawSquare(gridIndex, black);
    } else {
      gridArray[gridIndex].blocked = false;
      gridArray[gridIndex].colour = white;
      drawSquare(gridIndex, white);
    }
  }


}

// Given a gridArray index, return the squares adjacent to it, no diagonals
function getAdjacentSquaresIndex(index) {
  let adjacent = [];
  if (index - 1 > -1 && index % gridHeight != 0) {
    if (!gridArray[index - 1].blocked) {
      adjacent.push(index - 1);
    }
  }
  if (index + 1 < gridArray.length && index % gridHeight != gridHeight - 1) {
    if (!gridArray[index + 1].blocked) {
      adjacent.push(index + 1);
    }
  }
  if (index - gridHeight > -1) {
    if (!gridArray[index - gridHeight].blocked) {
      adjacent.push(index - gridHeight);
    }
  }
  if (index + gridHeight < gridArray.length) {
    if (!gridArray[index + gridHeight].blocked) {
      adjacent.push(index + gridHeight);
    }
  }

  return adjacent;
}

// Initializes the grid with Square objects
function createGrid() {
  gridArray = [];
  let idx = 0;
  for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
      gridArray.push(
        new Square(i * squareSize, j * squareSize, squareSize, squareSize,
          idx));
      idx++;
    }
  }

  // TODO: Allow user to designate which squares are start and end
  startSquare = gridArray[0];
  endSquare = gridArray[gridArray.length - 1];
  gridArray[0].start = true;
  gridArray[0].colour = green;
  gridArray[gridArray.length - 1].end = true;
  gridArray[gridArray.length - 1].colour = red;

}

// Draw all squares in grid
function drawAll() {
  for (let i = 0; i < gridArray.length; i++) {
    gridArray[i].drawRect();
  }
}

// Draw a specific square with a specific colour
function drawSquare(index, colour = undefined) {
  gridArray[index].drawRect(colour);
}

// Draws a line from the middle of the first square to the middle of
// the second square
function drawLine(first, second) {
  context.beginPath();
  context.strokeStyle = red;
  context.moveTo(first.x + first.width / 2, first.y + first.height / 2);
  context.lineTo(second.x + second.width / 2, second.y + second.height / 2);
  context.stroke();
  context.closePath();
}

// Draws a line from square v the previous square, repeatedly
function drawPath(v) {
  drawSquare(startSquare.index, green);
  drawSquare(endSquare.index, red);
  let current = v;
  let prev = v.prev;
  let length = 0;

  while (prev != null) {
    drawLine(current, prev);
    current = prev;
    prev = current.prev;
    length++;
  }

  console.log("Iterations: " + iterations + ", length: " + length);
  enableEventListeners();
}

// Start selected search algorithm
function startSearch() {
  resetAlgorithm();
  stop = false;
  disableEventListeners();

  switch (dropdownvalue) {
    case 0:
      BFS(startSquare, endSquare);
      break;

    case 1:
      DFS(startSquare, endSquare);
      break;

    case 2:
      Dijkstra(startSquare, endSquare);
      break;

    case 3:
      A_Star(startSquare, endSquare);
      break;

    case 4:
      Best_First(startSquare, endSquare);

  }
}

// Reset everyhting but drawn walls
function resetAlgorithm() {
  stop = true;
  iterations = 0;
  enableEventListeners();

  for (let i = 0; i < gridArray.length; i++) {
    if (!gridArray[i].blocked) {
      gridArray[i].colour = white;
    }
    if (gridArray[i].start) {
      gridArray[i].colour = green;
    }
    if (gridArray[i].end) {
      gridArray[i].colour = red;
    }
  }

  drawAll();
}

// Reset everything
function resetAll() {
  stop = true;
  iterations = 0;
  enableEventListeners();
  createGrid();
  drawAll();

}

// Used to delay animation frames
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get the Squares adjacent to a given Square, in the four cardinal directions

function getAndMarkNeighbours(v, queue, discovered) {
  let neighbours = getAdjacentSquaresIndex(v.index);
  for (let i = 0; i < neighbours.length; i++) {
    if (!discovered.includes(gridArray[neighbours[i]])) {
      discovered.push(gridArray[neighbours[i]]);
      queue.push(gridArray[neighbours[i]]);
      gridArray[neighbours[i]].prev = v;
      drawSquare(gridArray[neighbours[i]].index, blue);
    }
  }
}

async function BFS(start, end) {
  bfs_dfs_search(start, end, 0);
}

async function DFS(start, end) {
  bfs_dfs_search(start, end, 1);
}

// Used for BFS/DFS algorithms,  only difference is the FIFO vs LIFO
async function bfs_dfs_search(start, end, option) {
  let queue = [start];
  let discovered = [start];
  start.prev = null;

  while (queue.length > 0 && !stop) {
    // BFS = FIFO => Queue
    // DFS = LIFO => Stack
    let v;
    if (option == 0) {
      // BFS
      v = queue.shift();
    } else {
      // DFS
      v = queue.pop();
    }
    drawSquare(v.index, lightgreen);

    if (v == end) {
      drawPath(v);
      return;
    }

    getAndMarkNeighbours(v, queue, discovered);
    iterations++;
    await sleep(delay);
  }
}

// Perform Dijkstra search, same thing as BFS with weights = 1
async function Dijkstra(start, end) {
  let unvisited = [];
  for (let i = 0; i < gridArray.length; i++) {
    if (!gridArray[i].blocked) {
      gridArray[i].distance = Infinity;
      gridArray[i].prev = null;
      unvisited.push(gridArray[i]);
    }
  }
  start.distance = 0;

  while (unvisited.length > 0 && !stop) {
    let v = min_distance(unvisited);
    drawSquare(v.index, blue);

    // If we've found a path to the ending square, draw a path from the
    // starting to the ending square
    if (v == end) {
      drawPath(v);
      return;
    }

    let neighbours = getAdjacentSquaresIndex(v.index);
    for (let i = 0; i < neighbours.length; i++) {
      if (unvisited.includes(gridArray[neighbours[i]])) {
        let u = gridArray[neighbours[i]];
        drawSquare(v.index, lightgreen);
        if (v.distance + 1 < u.distance) {
          u.distance = v.distance + 1;
          u.prev = v;
        }
      }
    }
    iterations++;
    await sleep(delay);
  }
}

// Really inefficient. should definitely change later
// Return square with minimum distance
function min_distance(list) {
  let min_idx = 0;
  let min = list[min_idx]
  for (let i = 0; i < list.length; i++) {
    if (list[i].distance < list[min_idx].distance) {
      min_idx = i;
      min = list[min_idx]
    }
  }
  list.splice(min_idx, 1);
  return min;
}

// Calculate Manhatten distance between two Squares on grid
function manhatten_distance(current, goal) {
  return Math.abs(current.x - goal.x) + Math.abs(current.y - goal.y);
}

// A-star search algorithm
async function A_Star(start, end) {

  let open = [start];
  let closed = new Set();

  start.distance = 0;
  start.h = 0;
  start.g = 0;

  while (open.length > 0 && !stop) {

    let q = min_distance(open);
    drawSquare(q.index, lightgreen);

    closed.add(q);

    if (q == end) {
      drawPath(q);
      return;
    }

    let neighbours = getAdjacentSquaresIndex(q.index);

    for (let i = 0; i < neighbours.length; i++) {
      let successor = gridArray[neighbours[i]];

      let tentative_g = q.g + squareSize;
      let tentative_h = manhatten_distance(successor, end);
      let tentative_distance = tentative_g + tentative_h;


      if (closed.has(successor)) {
        continue;
      }

      if (open.includes(successor)) {
        if (successor.distance < tentative_distance) {
          continue;
        }
      } else {
        open.push(successor);
      }

      successor.g = tentative_g;
      successor.h = tentative_h;
      successor.distance = tentative_distance;
      successor.prev = q;

      drawSquare(successor.index, blue);
    }
    iterations++;
    await sleep(delay);
  }
}

// Best-First search algorithm
async function Best_First(start, end) {
  let queue = new TinyQueue([], function(a, b) {
    return manhatten_distance(a, endSquare) - manhatten_distance(b, endSquare)
  });
  let discovered = [start];
  queue.push(start);

  while (queue.length > 0) {
    let q = queue.pop();

    if (q == end) {
      drawPath(q);
      return;
    }

    drawSquare(q.index, lightgreen);

    getAndMarkNeighbours(q, queue, discovered);
    iterations++;
    await sleep(delay);

  }

}

function enableEventListeners() {
  document.getElementById("startButton").disabled = false;
  canvas.addEventListener("click", clickHandler, false);
  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mouseup", mouseUp, false);
  canvas.addEventListener("mousemove", mouseMove, false);
  document.addEventListener("mousemove", mouseMove2, false);
}

function disableEventListeners() {
  document.getElementById("startButton").disabled = true;
  canvas.removeEventListener("click", clickHandler, false);
  canvas.removeEventListener("mousedown", mouseDown, false);
  canvas.removeEventListener("mouseup", mouseUp, false);
  canvas.removeEventListener("mousemove", mouseMove, false);
  document.removeEventListener("mousemove", mouseMove2, false);
}
