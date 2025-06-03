const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE_SIZE = 16;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 9;

// Load images
const playerImg = new Image();
playerImg.src = 'assets/player.png';

const tileset = new Image();
tileset.src = 'assets/tileset.png';

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

// Player object
let player = {
  x: 1,
  y: 1,
  px: 1 * TILE_SIZE,
  py: 1 * TILE_SIZE,
  speed: 1, // pixels per frame
  moving: false,
  dir: null
};

// Track pressed keys
const keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function canMove(x, y) {
  return map[y] && map[y][x] !== 0;
}

function update() {
  // If player is not moving, check for input
  if (!player.moving) {
    let dx = 0, dy = 0;
    if (keys["ArrowUp"]) dy = -1;
    else if (keys["ArrowDown"]) dy = 1;
    else if (keys["ArrowLeft"]) dx = -1;
    else if (keys["ArrowRight"]) dx = 1;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if ((dx !== 0 || dy !== 0) && canMove(newX, newY)) {
      player.x = newX;
      player.y = newY;
      player.dir = { x: dx * TILE_SIZE, y: dy * TILE_SIZE };
      player.moving = true;
    }
  }

  // Move toward target pixel location
  if (player.moving) {
    let targetX = player.x * TILE_SIZE;
    let targetY = player.y * TILE_SIZE;

    if (player.px < targetX) player.px += player.speed;
    if (player.px > targetX) player.px -= player.speed;
    if (player.py < targetY) player.py += player.speed;
    if (player.py > targetY) player.py -= player.speed;

    // Snap when close to avoid float rounding errors
    if (Math.abs(player.px - targetX) < player.speed &&
        Math.abs(player.py - targetY) < player.speed) {
      player.px = targetX;
      player.py = targetY;
      player.moving = false;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw map
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      let tile = map[y][x];
      ctx.drawImage(
        tileset,
        tile * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
        x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE
      );
    }
  }

  // Draw player (use px/py for smooth movement)
  ctx.drawImage(playerImg, player.px, player.py, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
