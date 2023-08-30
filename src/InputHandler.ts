import { keyPressed, gamepadPressed, keyMap, Sprite} from "kontra";

type Point = [number, number];

const TILE_SIZE = 16;

export default function handleInput(player: Sprite) {
    let direction: Point = [0, 0];
    if (keyPressed(keyMap.ArrowDown) || keyPressed('s') || gamepadPressed('dpaddown')) {
        direction[1] += 1;
    }
    if (keyPressed(keyMap.ArrowUp) || keyPressed('w') || gamepadPressed('dpadup')) {
        direction[1] -= 1;
    }
    if (keyPressed(keyMap.ArrowLeft) || keyPressed('a') || gamepadPressed('dpadleft')) {
        direction[0] -= 1;
    }
    if (keyPressed(keyMap.ArrowRight) || keyPressed('d') || gamepadPressed('dpadright')) {
        direction[0] += 1;
    }
    direction = directionAdjusted(direction);
    player.mx = direction[0];
    player.my = direction[1];
    // movePlayer(player, obstacles);
}

function directionAdjusted(direction: Point): Point {
    if(direction [0] !== 0 && direction[1] !== 0) {
        direction[0] *= 0.7071;
        direction[1] *= 0.7071;
    }
    return direction;
}

// function movePlayer(player: Sprite, obstacles: Point[]): void {
//     // Move player on X-axis
//     const nextX = player.gx + player.dx;
//     if (!isColliding([nextX, player.gy],player.radius, obstacles)) {
//         player.gx += player.dx;
//     }

//     // Move player on Y-axis
//     const nextY = player.gy + player.dy;
//     if (!isColliding([player.gx, nextY], player.radius, obstacles)) {
//         player.gy += player.dy;
//     }
// }

export function isColliding(point: Point, radius: number, obstacles?: Point[]): boolean {
    if (obstacles === undefined) return false;
    const scaledX = point[0];
    const scaledY = point[1];

    for (const [obstacleX, obstacleY] of obstacles) {
        const rect = {
            left: obstacleX,
            right: (obstacleX + TILE_SIZE),
            top: obstacleY,
            bottom: (obstacleY + TILE_SIZE)
        };

        if (circleRectCollision({x: scaledX, y: scaledY, radius: radius}, rect)) {
            return true;
        }
    }
    return false;
}

function circleRectCollision(circle: {x: number, y: number, radius: number}, rect: {left: number, right: number, top: number, bottom: number}): boolean {
    const closestX = Math.max(rect.left, Math.min(circle.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));

    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;

    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circle.radius * circle.radius);
}

