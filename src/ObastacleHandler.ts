import { Position } from "./Interfaces";
import { Sprite } from "kontra";

export function getFilteredObstacles(obstacles: Position[], playerBounds: {left:number,right:number,top:number,bottom:number}, tileSize: number): Position[] {
    return obstacles.filter((obstacle) => {
        let obstacleBounds = {
            left: obstacle.x,
            right: (obstacle.x + tileSize),
            top: obstacle.y,
            bottom: (obstacle.y + tileSize)
        };
        // Check if the obstacle's bounding box overlaps with the player's extended bounding box.
        return checkBounds(playerBounds, obstacleBounds);
      });
}

export function getFilteredSprites(sprites: Sprite[], playerBounds: {left:number,right:number,top:number,bottom:number}): Sprite[] {
    return sprites.filter((sprite) => {
        let spriteBounds = sprite.getBounds();
        // Check if the obstacle's bounding box overlaps with the player's extended bounding box.
        return checkBounds(playerBounds, spriteBounds);
        });
}

function checkBounds(unitBounds: {left:number,right:number,top:number,bottom:number}, obstacleBounds: {left:number,right:number,top:number,bottom:number}): boolean {
    return !(obstacleBounds.left > unitBounds.right || 
        obstacleBounds.right < unitBounds.left || 
        obstacleBounds.top > unitBounds.bottom || 
        obstacleBounds.bottom < unitBounds.top);
}