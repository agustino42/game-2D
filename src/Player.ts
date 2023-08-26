import { Sprite} from 'kontra'
import { isColliding } from './InputHandler';

export default function getPlayer(gx: number, gy: number, canvas: HTMLCanvasElement): Sprite {
    return Sprite({
        x: 0,
        y: 0,
        gx: gx,
        gy: gy,
        color: 'red',
        radius: 6,
        visualRadius: 8,
        dx: 0,
        dy: 0,
        speed: 40,
        health: 100,
        isTakingDamage: false,
        score: 0,
        boundingObstacles: [],
        moveX: 0,
        moveY: 0,
        initialPosition: [gx,gy],
        update: function(this: Sprite, dt?: number){
            if (dt === undefined) return;
            if(this.isTakingDamage){
                this.speed = 20;
                this.isTakingDamage = false;
            }
;            const speed = this.speed * dt;

            // Proposed movement
            this.moveX = speed * this.dx;
            this.moveY = speed * this.dy;

            // Check for collisions and adjust if necessary
            if (!isColliding([this.gx + this.moveX, this.gy], this.radius, this.boundingObstacles)) {
                this.gx += this.moveX;
            }

            if (!isColliding([this.gx, this.gy + this.moveY], this.radius, this.boundingObstacles)) {
                this.gy += this.moveY;
            }
            // this.advance();
        },
        advance(this: Sprite){
            this.gx += this.dx;
            this.gy += this.dy;
        },
        render: function(this: Sprite){
            this.x = (canvas.width / 2); //sets the player's x position to the center of the canvas
            this.y = (canvas.height / 2);//sets the player's y position to the center of the canvas
            
            this.context.fillStyle = this.color;
            this.context.beginPath();
            this.context.arc(0, 0, this.visualRadius, 0, 2 * Math.PI);
            this.context.fill();
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
            let playerBounds = this.getBounds();
            const bounds =  {
                left: playerBounds.left - tileSize,
                right: playerBounds.right + tileSize,
                top: playerBounds.top - tileSize,
                bottom: playerBounds.bottom + tileSize
            };
            return bounds;
        },
        getScreenBounds(this: Sprite){
            return {
                left: this.gx - (canvas.width / 2),
                right: this.gx + (canvas.width / 2),
                top: this.gy - (canvas.height / 2),
                bottom: this.gy + (canvas.height / 2)
            };  
        },
        setBoundingObstacles(this: Sprite, obstacles: [number,number][]){
            this.boundingObstacles = obstacles;
        },
        takeDamage(this: Sprite, damage: number){
            console.log('taking damage')
            this.health -= damage;
            console.log(this.health)
        },
    });
}
