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

const inventoryImg = new Image();
inventoryImg.src = 'assets/inventory.png';

let inventory = {
  open: false,
  y: canvas.height,
  targetY: canvas.height,
  currentPage: 0,
  totalPages: 3,
  transitioning: false,
  direction: 0,
  xOffset: 0
};

let canMove = true;

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

let player = {
  x: 1,
  y: 1,
  px: 1 * TILE_SIZE,
  py: 1 * TILE_SIZE,
  speed: 2,
  moving: false,
  dir: null
};

const keys = {};
window.addEventListener("keydown", (e) => {
  const key = e.key;

  if (key === "i" || key === "I") {
    toggleInventory();
  } else if (inventory.open && !inventory.transitioning) {
    if (key === ">") changeInventoryPage(1);
    else if (key === "<") changeInventoryPage(-1);
  } else {
    keys[key] = true;
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function toggleInventory() {
  inventory.open = !inventory.open;
  inventory.targetY = inventory.open ? (canvas.height - 120) / 2 : canvas.height;
  canMove = !inventory.open;
}

function changeInventoryPage(dir) {
  const newPage = inventory.currentPage + dir;
  if (newPage < 0 || newPage >= inventory.totalPages) return;

  inventory.transitioning = true;
  inventory.direction = dir;
  inventory.xOffset = dir * canvas.width;

  setTimeout(() => {
    inventory.currentPage = newPage;
    inventory.transitioning = false;
    inventory.xOffset = 0;
  }, 200);
}

function canMoveTo(x, y) {
  return map[y] && map[y][x] !== 0;
}

function update() {
  // Always update inventory slide animation
  if (inventory.y !== inventory.targetY) {
    let dy = (inventory.targetY - inventory.y) * 0.2;
    if (Math.abs(dy) < 1) inventory.y = inventory.targetY;
    else inventory.y += dy;
  }

  // Skip movement if in menu or blocked
  if (inventory.open || inventory.transitioning || !canMove) return;

  if (!player.moving) {
    let dx = 0, dy = 0;
    if (keys["ArrowUp"]) dy = -1;
    else if (keys["ArrowDown"]) dy = 1;
    else if (keys["ArrowLeft"]) dx = -1;
    else if (keys["ArrowRight"]) dx = 1;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if ((dx !== 0 || dy !== 0) && canMoveTo(newX, newY)) {
      player.x = newX;
      player.y = newY;
      player.dir = { x: dx * TILE_SIZE, y: dy * TILE_SIZE };
      player.moving = true;
    }
  }

  if (player.moving) {
    let targetX = player.x * TILE_SIZE;
    let targetY = player.y * TILE_SIZE;

    if (player.px < targetX) player.px += player.speed;
    if (player.px > targetX) player.px -= player.speed;
    if (player.py < targetY) player.py += player.speed;
    if (player.py > targetY) player.py -= player.speed;

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

  ctx.drawImage(playerImg, player.px, player.py, TILE_SIZE, TILE_SIZE);

  if (inventory.y < canvas.height) {
    let offsetX = inventory.transitioning ? inventory.xOffset : 0;

    ctx.drawImage(
      inventoryImg,
      0, 0, 160, 144,
      offsetX, inventory.y, 160, 144
    );

    if (inventory.transitioning) {
      ctx.drawImage(
        inventoryImg,
        0, 0, 160, 144,
        offsetX - inventory.direction * canvas.width,
        inventory.y, 160, 144
      );
    }
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
