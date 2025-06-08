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

const playerImage = new Image();
playerImage.src = 'assets/player_image.png';

const assets = [playerImg, tileset, inventoryImg, playerImage];
let assetsLoaded = 0;

const playerStats = {
    name: "Googar",
    hp: 50,
    maxhp:50,
    attack: 5,
    defense: 5,
    dread: 15,
    location: "Ö CUM DUNGEON",
    description: "YOU FEEL THE INTENSE DESIRE TO TAKE A SHIT."
};

// Wait until all assets are loaded
assets.forEach(img => {
    img.onload = () => {
        assetsLoaded++;
        if (assetsLoaded === assets.length) {
            requestAnimationFrame(gameLoop);
        }
    };
});

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

let gameState = {
    mode: 'overworld', // or 'inventory'
    canMove: true
};

let player = {
    x: 1,
    y: 1,
    px: 1 * TILE_SIZE,
    py: 1 * TILE_SIZE,
    speed: 1,
    moving: false
};

let inventory = {
    visible: false,
    y: 144, // start offscreen
    targetY: 144,
    page: 0,
    maxPages: 3,
    transitionSpeed: 6,
    transitioning: false
};

// Input handling
const keys = {};
window.addEventListener("keydown", (e) => {
    if (!keys[e.key]) handleKeyPress(e.key); // trigger once on keydown
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function handleKeyPress(key) {
    if (key === "i") toggleInventory();

    if (gameState.mode === 'inventory' && !inventory.transitioning) {
        if (key === ".") changeInventoryPage(1);
        if (key === ",") changeInventoryPage(-1);
    }
}

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
    const newPage = inventory.page + direction;
    if (newPage >= 0 && newPage < inventory.maxPages) {
        inventory.page = newPage;
        // Future slide-in effect per page can go here
    }
}

function canMove(x, y) {
    return map[y] && map[y][x] !== 0;
}

function update() {
    // Movement logic
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

    // Smooth move
    if (player.moving) {
        let tx = player.x * TILE_SIZE;
        let ty = player.y * TILE_SIZE;

        if (player.px < tx) player.px += player.speed;
        if (player.px > tx) player.px -= player.speed;
        if (player.py < ty) player.py += player.speed;
        if (player.py > ty) player.py -= player.speed;

        if (Math.abs(player.px - tx) < player.speed && Math.abs(player.py - ty) < player.speed) {
            player.px = tx;
            player.py = ty;
            player.moving = false;
        }
    }

    // Inventory slide
    if (inventory.transitioning) {
        if (Math.abs(inventory.y - inventory.targetY) < inventory.transitionSpeed) {
            inventory.y = inventory.targetY;
            inventory.transitioning = false;

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

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            let tile = map[y][x];
            ctx.drawImage(tileset, tile * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    ctx.drawImage(playerImg, player.px, player.py, TILE_SIZE, TILE_SIZE);

    if (inventory.visible || inventory.transitioning) {
        // Draw the inventory background first
        ctx.drawImage(inventoryImg, 0, inventory.y);
    
        // Then draw the correct page contents
        if (inventory.page === 0) {
            ctx.save();
            ctx.translate(0, inventory.y);
            drawInventoryPage1();
            ctx.restore();
        }
    
        // Later pages (1, 2, etc) go here
    }

}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}


function drawInventoryPage1() {
    // Draw the player portrait
    ctx.drawImage(playerImage, 0, 0);

    // Text settings
    ctx.fillStyle = "white";
    ctx.font = '8px "Press Start 2P"';

    // HP & Location under portrait
    ctx.fillText(`HP: `, 16, 118);
    ctx.fillText(`${playerStats.name}`,16, 112);
    ctx.font = '16px "friendfont"';
    ctx.fillText(`${playerStats.hp}/${playerStats.maxhp}`,48, 117);
    ctx.fillText(`${playerStats.location}`, 16, 128);

    // Description to the right
    wrapText(ctx, playerStats.description, 88, 24, 60, 10);

    // Stats under description
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText(`ATT: ${playerStats.attack}`, 88, 73);
    ctx.fillText(`DEF: ${playerStats.defense}`, 88, 85);
    ctx.fillText(`DRD: ${playerStats.dread}`, 88, 97);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
