import { Position, Circle } from "./Interfaces";
import { isColliding } from "./InputHandler";
import { Sprite } from "kontra";



export function getNormalizedVector(position : Position, target: Position) : Position {
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    return {x: dx / magnitude, y: dy / magnitude};
    
}

export function rayTrace(position: Position, target: Position, obstacles: Position[]): boolean {
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    const normalizedVector = {x: dx / magnitude, y: dy / magnitude};
    const ray = position;
    while (Math.abs(ray.x - target.x) > 1 && Math.abs(ray.y - target.y) > 1) {
        ray.x += normalizedVector.x;
        ray.y += normalizedVector.y;
        if (isColliding(ray, 1, obstacles)) {
            return true;
        }
    }
    return false;
}

export function circleToCircleCollision(circle1: Circle, circle2: Circle): boolean {
    const dx = circle1.position.x - circle2.position.x;
    const dy = circle1.position.y - circle2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

export function spriteToCircle(sprite: Sprite): Circle {
    return {position: {x: sprite.gx, y: sprite.gy}, radius: sprite.radius};
}
