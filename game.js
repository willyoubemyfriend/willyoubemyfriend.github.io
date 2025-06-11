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

const enemyIcons = new Image();
enemyIcons.src = 'assets/enemy_icons.png';

const enemyStatusesImg = new Image();
enemyStatusesImg.src = 'assets/enemy_statuses.png';

const creatureGrid = new Image();
creatureGrid.src = 'assets/creature_grid.png';

const assets = [playerImg, tileset, inventoryImg, playerImage, enemyIcons, enemyStatusesImg, creatureGrid];
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

const seenEnemies = Array(28).fill(true);  // all enemies start as not seen
const enemyStatuses = Array(28).fill("closure");


// Wait until all assets are loaded
assets.forEach(img => {
    img.onload = () => {
        assetsLoaded++;
        if (assetsLoaded === assets.length) {
            requestAnimationFrame(gameLoop);
        }
    };
});

const rooms = [
    // Room 0
    [
        [0,0,0,0,0,0,1,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,0,0,0,0,1,0],
        [0,1,0,1,1,1,1,0,1,1],
        [0,1,0,1,0,0,1,0,1,0],
        [0,1,0,1,0,0,1,0,1,0],
        [0,1,0,1,1,1,1,0,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0]
    ],
    // Room 1
    [
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,0,0,1,1,1,0],
        [0,1,0,1,0,0,1,0,1,0],
        [1,1,0,1,1,1,1,0,1,0],
        [0,1,0,0,0,0,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0]
    ],
    // Room 2
    [
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,1,0,0,0] 
    ]
];

const roomExits = [
    [ // Exits for Room 0
        {
            x: 10, y: 3,
            direction: "right",
            toRoom: 1,
            toX: 0, toY: 3,
            roomgap: 160
        },
        {
            x: 6, y: -1,
            direction: "up",
            toRoom: 2,
            toX: 6, toY: 8,
            roomgap: 0
        }
    ],
    [ // Exits for Room 1
        {
            x: -1, y: 3,
            direction: "left",
            toRoom: 0,
            toX: 9, toY: 3,
            roomgap: 0
        }
    ],
    [ // Exits for Room 2
        {
            x: 6, y: 9,
            direction: "down",
            toRoom: 0,
            toX: 6, toY: 0,
            roomgap: 0
        }
    ]
];


let currentRoomIndex = 0;

let gameState = {
    mode: 'overworld', // or 'inventory'
    canMove: true
};

let enemyAnimTimer = 0;
let enemyAnimFrame = 0;
const enemyAnimInterval = 250; // Change frame every 500ms

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

let roomTransition = {
    active: false,
    direction: null,
    progress: 0,
    speed: 4,
    fromRoom: null,
    toRoom: null,
    playerStartX: 0,
    playerStartY: 0,
    roomGap: 0 // distance in pixels between rooms (0 = seamless)
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
    // If tile is inside bounds and not 0, allow move
    if (rooms[currentRoomIndex][y] && rooms[currentRoomIndex][y][x] !== undefined) {
        return rooms[currentRoomIndex][y][x] !== 0;
    }

    // Check if this out-of-bounds position matches any defined exit
    const exits = roomExits[currentRoomIndex];
    return exits.some(e => e.x === x && e.y === y);
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

            // Exit check after movement completes
            const exits = roomExits[currentRoomIndex];
            const exit = exits.find(e => e.x === player.x && e.y === player.y);
            if (exit) {
                // Immediately update player position to the new room's spawn point
                player.x = exit.toX;
                player.y = exit.toY;
                player.px = player.x * TILE_SIZE;
                player.py = player.y * TILE_SIZE;
                
                // Start transition
                roomTransition.active = true;
                roomTransition.direction = exit.direction;
                roomTransition.progress = 0;
                roomTransition.fromRoom = currentRoomIndex;
                roomTransition.toRoom = exit.toRoom;
                roomTransition.playerStartX = exit.toX;
                roomTransition.playerStartY = exit.toY;
                roomTransition.roomGap = exit.roomgap || 0;
                player.moving = false;
                gameState.canMove = false;
            }

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

    // Room Transitions
    if (roomTransition.active) {
        roomTransition.progress += roomTransition.speed;

            const isHorizontal = roomTransition.direction === "left" || roomTransition.direction === "right";
            const transitionLimit = (isHorizontal ? canvas.width : canvas.height) + roomTransition.roomGap;

            if (roomTransition.progress >= transitionLimit) {
                // Complete the transition
                currentRoomIndex = roomTransition.toRoom;
                player.x = roomTransition.playerStartX;
                player.y = roomTransition.playerStartY;
                player.px = player.x * TILE_SIZE;
                player.py = player.y * TILE_SIZE;
                player.moving = false;

                roomTransition.active = false;
                gameState.canMove = true;
              }
    }


    // Animation timers
    frameCounter++;
    if (frameCounter >= 14) {
        enemyFrame = (enemyFrame + 1) % 2;
        frameCounter = 0;
    }

    enemyAnimTimer += 14;
    if (enemyAnimTimer >= enemyAnimInterval) {
        enemyAnimTimer = 0;
        enemyAnimFrame = (enemyAnimFrame + 1) % 2;
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (roomTransition.active) {
        const offset = roomTransition.progress;
        const gap = roomTransition.roomGap;

        const dir = roomTransition.direction;
        const fromRoom = rooms[roomTransition.fromRoom];
        const toRoom = rooms[roomTransition.toRoom];

        let dx = 0, dy = 0;
        if (dir === "left") dx = 1;
        else if (dir === "right") dx = -1;
        else if (dir === "up") dy = 1;
        else if (dir === "down") dy = -1;

        const fromX = dx * offset;
        const fromY = dy * offset;
        const toX = dx * (offset - canvas.width - gap);
        const toY = dy * (offset - canvas.height - gap);

        // Draw the rooms
        drawRoom(fromRoom, fromX, fromY);
        drawRoom(toRoom, toX, toY);

        // Draw player in their final position in the new room
        const playerX = roomTransition.playerStartX * TILE_SIZE + toX;
        const playerY = roomTransition.playerStartY * TILE_SIZE + toY;
        ctx.drawImage(playerImg, playerX, playerY, TILE_SIZE, TILE_SIZE);

    } else {
        // Normal room rendering
        drawRoom(rooms[currentRoomIndex], 0, 0);
        ctx.drawImage(playerImg, player.px, player.py, TILE_SIZE, TILE_SIZE);
    }

    // Inventory overlay (unchanged)
    if (inventory.visible || inventory.transitioning) {
        ctx.drawImage(inventoryImg, 0, inventory.y);

        if (inventory.page === 0) {
            ctx.save();
            ctx.translate(0, inventory.y);
            drawInventoryPage1();
            ctx.restore();
        } else if (inventory.page === 2) {
            ctx.save();
            ctx.translate(0, inventory.y);
            drawInventoryPage3(); // Creature grid
            ctx.restore();
        }

        // Other pages can be added similarly
    }
}

function drawRoom(room, offsetX, offsetY) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            let tile = room[y][x];
            ctx.drawImage(
                tileset,
                tile * TILE_SIZE, 0,
                TILE_SIZE, TILE_SIZE,
                x * TILE_SIZE + offsetX,
                y * TILE_SIZE + offsetY,
                TILE_SIZE, TILE_SIZE
            );
        }
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
    ctx.fillText(`HP: `, 16, 119);
    ctx.fillText(`${playerStats.name}`,16, 108);
    ctx.font = '16px "friendfont"';
    ctx.fillText(`${playerStats.hp}/${playerStats.maxhp}`,48, 118);
    ctx.fillText(`${playerStats.location}`, 16, 128);

    // Description to the right
    wrapText(ctx, playerStats.description, 88, 24, 60, 10);

    // Stats under description
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText(`ATT: ${playerStats.attack}`, 88, 73);
    ctx.fillText(`DEF: ${playerStats.defense}`, 88, 85);
    ctx.fillText(`DRD: ${playerStats.dread}`, 88, 97);
}

function drawInventoryPage3() {
    ctx.drawImage(creatureGrid, 0, 0);

    for (let i = 0; i < 28; i++) {
        const row = i % 7;
        const col = Math.floor(i / 7);

        const x = 16 + col * 32;
        const y = 16 + row * 16;

        // Draw enemy icon
        let spriteIndex = seenEnemies[i] ? i : 28; // 0–27 = enemy, 28 = ?
        ctx.drawImage(
            enemyIcons,
            spriteIndex * 16,
            enemyFrame * 16,
            16, 16,
            x, y,
            16, 16
        );

        // Determine status icon index
        let status = enemyStatuses[i]; // "undecided", "closure", "newlife"
        let statusIndex = 0;
        if (status === "closure") statusIndex = 1;
        else if (status === "newlife") statusIndex = 2;

        // Draw status icon to the right of the enemy icon
        ctx.drawImage(
            enemyStatusesImg,
            statusIndex * 16, 0,      // src x/y
            16, 16,                   // size
            x + 15, y,                // dest x/y (right next to enemy)
            16, 16
        );
    }
}


let enemyFrame = 0;
let frameCounter = 0;

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
