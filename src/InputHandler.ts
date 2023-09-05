import { Sprite } from "kontra";
import { keyPressed} from "./InputEvents";
import { Position } from "./Interfaces";

const TILE_SIZE = 16;

export function handleInput(player: Sprite) {
    let direction: Position = {x:0, y: 0};
    if (keyPressed('ArrowDown') || keyPressed('s')) {
        direction.y += 1;
    }
    if (keyPressed('ArrowUp') || keyPressed('w')) {
        direction.y -= 1;
    }
    if (keyPressed('ArrowLeft') || keyPressed('a')) {
        direction.x -= 1;
    }
    if (keyPressed('ArrowRight') || keyPressed('d')) {
        direction.x += 1;
    }
    direction = directionAdjusted(direction);
    player.mx = direction.x;
    player.my = direction.y;
}

export function isSpacePressed(): boolean {
    if (keyPressed(' ')) {
        return true;
    }
    return false;
}

export function isActionKeyPressed(): boolean{
    if (keyPressed('e') || keyPressed(' ') || keyPressed('q'))
        return true;
    return false;
}

function directionAdjusted(direction: Position): Position {
    if(direction.x !== 0 && direction.y !== 0) {
        direction.x *= 0.7;
        direction.y *= 0.7;
    }
    return direction;
}

export function isColliding(position: Position, radius: number, obstacles?: Position[]): boolean {
    if (obstacles === undefined) return false;
    const scaledX = position.x;
    const scaledY = position.y;

    for (const obstacle of obstacles) {
        const rect = {
            left: obstacle.x,
            right: (obstacle.x + TILE_SIZE),
            top: obstacle.y,
            bottom: (obstacle.y + TILE_SIZE)
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

