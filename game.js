const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE_SIZE = 16;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 9;

const playerImg = new Image();
playerImg.src = 'assets/player.png';

const tileset = new Image();
tileset.src = 'assets/tileset.png';

const inventoryImg = new Image();
inventoryImg.src = 'assets/inventory.png';

// Map data
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

// Game state
let gameState = {
  mode: 'overworld', // or 'inventory'
  canMove: true
};

// Player state
let player = {
  x: 1,
  y: 1,
  px: 1 * TILE_SIZE,
  py: 1 * TILE_SIZE,
  speed: 2,
  moving: false
};

// Inventory UI state
let inventory = {
  visible: false,
  y: 144, // start offscreen
  targetY: 144,
  page: 0,
  maxPages: 3,
  transitionSpeed: 8,
  transitioning: false
};

// Input handling
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Inventory toggle
  if (e.key === "i") toggleInventory();

  // Inventory navigation
  if (gameState.mode === 'inventory' && !inventory.transitioning) {
    if (e.key === ".") changeInventoryPage(1);
    if (e.key === ",") changeInventoryPage(-1);
  }
});
window.addEventListener("keyup", (e) => keys[e.key] = false);

function toggleInventory() {
  if (inventory.transitioning) return;

  inventory.transitioning = true;

  if (!inventory.visible) {
    gameState.mode = 'inventory';
    inventory.targetY = (canvas.height - 144) / 2;
    inventory.visible = true;
    gameState.canMove = false;
  } else {
    inventory.targetY = 144;
    inventory.visible = false;
  }
}

function changeInventoryPage(direction) {
  let newPage = inventory.page + direction;
  if (newPage >= 0 && newPage < inventory.maxPages) {
    inventory.page = newPage;
    // Future: add slide left/right animation here
  }
}

// Movement
function canMove(x, y) {
  return map[y] && map[y][x] !== 0;
}

function update() {
  if (gameState.mode === 'overworld' && gameState.canMove && !player.moving) {
    let dx = 0, dy = 0;
    if (keys["ArrowUp"]) dy = -1;
    else if (keys["ArrowDown"]) dy = 1;
    else if (keys["ArrowLeft"]) dx = -1;
    else if (keys["ArrowRight"]) dx = 1;

    let nx = player.x + dx;
    let ny = player.y + dy;

    if ((dx !== 0 || dy !== 0) && canMove(nx, ny)) {
      player.x = nx;
      player.y = ny;
      player.moving = true;
    }
  }

  // Pixel-smooth movement
  if (player.moving) {
    let tx = player.x * TILE_SIZE;
    let ty = player.y * TILE_SIZE;

    if (player.px < tx) player.px += player.speed;
    if (player.px > tx) player.px -= player.speed;
    if (player.py < ty) player.py += player.speed;
    if (player.py > ty) player.py -= player.speed;

    if (Math.abs(player.px - tx) < player.speed &&
        Math.abs(player.py - ty) < player.speed) {
      player.px = tx;
      player.py = ty;
      player.moving = false;
    }
  }

  // Animate inventory slide
  if (inventory.transitioning) {
    if (Math.abs(inventory.y - inventory.targetY) < inventory.transitionSpeed) {
      inventory.y = inventory.targetY;
      inventory.transitioning = false;

      // Finished hiding inventory
      if (!inventory.visible) {
        gameState.mode = 'overworld';
        gameState.canMove = true;
      }
    } else {
      inventory.y += (inventory.y < inventory.targetY ? 1 : -1) * inventory.transitionSpeed;
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
  ctx.drawImage(playerImg, player.px, player.py, TILE_SIZE, TILE_SIZE);

  // Draw inventory
  if (inventory.visible || inventory.transitioning) {
    ctx.drawImage(inventoryImg, 0, inventory.y, 160, 144);
    // Later: add page contents
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
