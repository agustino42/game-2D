import { Sprite } from "kontra";
import getZombie from "./Zombie";

export default function spawnZombie(player: Sprite, canvas: HTMLCanvasElement, tileSize: number, obstacles: [number, number][]): Sprite {
    const safeDistance = tileSize * 2; // 32 pixels away
    const viewportBounds = {
      left: player.gx - (canvas.width / 2) + safeDistance,
      right: player.gx + (canvas.width / 2) - safeDistance,
      top: player.gy - (canvas.height / 2) + safeDistance,
      bottom: player.gy + (canvas.height / 2) - safeDistance,
    };

    // randomly generate a speed between 20 an 50
    let speed = Math.random() * (50 - 20) + 20;
  
    
    let x = Math.random() * (viewportBounds.right - viewportBounds.left) + viewportBounds.left;
    let y = Math.random() * (viewportBounds.bottom - viewportBounds.top) + viewportBounds.top;

    // Make sure the spawn location is not too close to the player
    do {
        x = Math.random() * (viewportBounds.right - viewportBounds.left) + viewportBounds.left;
        y = Math.random() * (viewportBounds.bottom - viewportBounds.top) + viewportBounds.top;
      } while (isTooCloseToPlayer(x, y, player, safeDistance) || isInsideObstacle(x, y, obstacles, tileSize));

    return getZombie(x, y, player, canvas, speed)
  }

  function isTooCloseToPlayer(x: number, y: number, player: Sprite, safeDistance: number) {
    return Math.abs(x - player.gx) < safeDistance && Math.abs(y - player.gy) < safeDistance;
  }
  
  function isInsideObstacle(x: number, y: number, obstacles: [number, number][], tileSize: number) {
    for (let obstacle of obstacles) {
      if (x > obstacle[0] && x < obstacle[0] + tileSize && y > obstacle[1] && y < obstacle[1] + tileSize) {
        return true;
      }
    }
    return false;
  }