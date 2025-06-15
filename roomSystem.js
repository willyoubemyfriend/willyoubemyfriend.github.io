export const TILE_SIZE = 16;
export const MAP_WIDTH = 10;
export const MAP_HEIGHT = 9;

export const rooms = [
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

export const roomExits = [
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

export function drawRoom(ctx, room, offsetX, offsetY, tileset) {
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

export function canMove(room, x, y) {
    // If tile is inside bounds and not 0, allow move
    if (room[y] && room[y][x] !== undefined) {
        return room[y][x] !== 0;
    }
    return false;
}
