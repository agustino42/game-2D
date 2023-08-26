import { Sprite } from 'kontra';
import { isColliding } from './InputHandler';

export default function getZombie(x: number, y: number, target: Sprite, canvas: HTMLCanvasElement, speed: number): Sprite {
    return Sprite({
        canvas: canvas,
        x: 0,
        y: 0,
        gx: x,
        gy: y,
        color: 'blue',
        health: 100,
        radius: 5,
        speed: speed,
        damage: 5,
        onCooldown: false,
        cooldownTime: 1,
        cooldownCounter: 0,
        target: target,
        boundingObstacles: [],
        centerPoint: [x - 20,y - 20],
        update: function(this: Sprite, dt?: number) {
            if (dt === undefined) return;

            // Calculate direction towards the player
            const dirX = this.target.gx - this.gx;
            const dirY = this.target.gy - this.gy;
            const distance = Math.sqrt(dirX * dirX + dirY * dirY);
            // Normalize the direction
            const normX = dirX / distance;
            const normY = dirY / distance;
            
            // Determine next global position
            const nextGx = normX * this.speed * dt;
            const nextGy = normY * this.speed * dt;

            
        
            // Check for collisions (using the same logic as the player)
            if (!isColliding([this.gx + nextGx, this.gy], this.radius, this.boundingObstacles)) {
            this.gx += nextGx;
            }
            if (!isColliding([this.gx, nextGy + this.gy], this.radius, this.boundingObstacles)) {
            this.gy += nextGy;
            }
        },
        render: function(this: Sprite) {
            // Convert global to local coordinates relative to the player's position
            this.x = this.gx - this.target.gx + this.canvas.width / 2;
            this.y = this.gy - this.target.gy + this.canvas.height / 2;

        
            // Check if within viewport
            if (this.x + this.radius >= 0 && this.x - this.radius < canvas.width &&
                this.y + this.radius >= 0 && this.y - this.radius < canvas.height) {
            this.context.fillStyle = this.color;
            this.context.beginPath();
            this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
            this.context.fill();
            }
        },
        getBounds(this: Sprite){
            return {
                left: this.gx - this.radius,
                right: this.gx + this.radius,
                top: this.gy - this.radius,
                bottom: this.gy + this.radius
                };
        }, 
        getExtendedBounds(this: Sprite, tileSize: number){
            let bounds = this.getBounds();
            return {
                left: bounds.left - tileSize,
                right: bounds.right + tileSize,
                top: bounds.top - tileSize,
                bottom: bounds.bottom + tileSize
            };
        },
        setBoundingObstacles(this: Sprite, obstacles: [number,number][]){
            this.boundingObstacles = obstacles;
        },
        getDistanceToTarget(this: Sprite){
            return Math.sqrt(Math.pow(this.gx - this.target.gx, 2) + Math.pow(this.gy - this.target.gy, 2));
        },
    });
} 