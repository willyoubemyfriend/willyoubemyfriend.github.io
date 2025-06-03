const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Disable anti-aliasing for pixel-perfect rendering
ctx.imageSmoothingEnabled = false;

// Constants
const TILE_SIZE = 16;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 9;

// Load assets
const playerImg = new Image();
playerImg.src = 'assets/player.png';

const tileset = new Image();
tileset.src = 'assets/tileset.png';

// Map (just numbers corresponding to tiles)
const map = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,1,0],
  [0,1,0,1,1,1,1,0,1,0],
  [0,1,0,1,0,0,1,0,1,0],
  [0,1,0,1,0,0,1,0,1,0],
  [0,1,0,1,1,1,1,0,1,0],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0]
];

// Player position (grid-based)
let player = {
  x: 1,
  y: 1,
  moving: false
};

// Movement
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function canMove(x, y) {
  return map[y] && map[y][x] !== 0;
}

function update() {
  if (!player.moving) {
    let newX = player.x;
    let newY = player.y;

    if (keys["ArrowUp"]) newY--;
    else if (keys["ArrowDown"]) newY++;
    else if (keys["ArrowLeft"]) newX--;
    else if (keys["ArrowRight"]) newX++;

    if ((newX !== player.x || newY !== player.y) && canMove(newX, newY)) {
      player.x = newX;
      player.y = newY;
      player.moving = true;

      setTimeout(() => {
        player.moving = false;
      }, 150); // basic movement delay
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw map
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      let tile = map[y][x];
      ctx.drawImage(tileset, tile * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw player
  ctx.drawImage(playerImg, player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

