import { Sprite, SpriteSheet} from 'kontra'
import { isColliding } from './InputHandler';

export default function getPlayer(gx: number, gy: number, canvas: HTMLCanvasElement, spritesheet: SpriteSheet): Sprite {
    return Sprite({
        x: canvas.width / 2,
        y: canvas.height / 2,
        gx: gx - 4,
        gy: gy - 5,
        animations: spritesheet.animations,
        radius: 7,
        mx: 0,
        my: 0,
        anchor: {x: 0.5, y: 0.5},
        speed: 60,
        health: 100,
        isTakingDamage: false,
        score: 0,
        boundingObstacles: [],
        moveX: 0,
        moveY: 0,
        initialPosition: [gx,gy],
        movePlayer: function(this: Sprite, dt?: number){
            if (dt === undefined) return;
            if(this.isTakingDamage){
                this.speed = 20;
                this.isTakingDamage = false;
            }
;            const speed = this.speed * dt;

            // Proposed movement
            this.moveX = speed * this.mx;
            this.moveY = speed * this.my;
            if(this.mx < 0){
                this.setScale(-1,1);
            } else if(this.mx > 0){
                this.setScale(1,1);
            }

            if (this.mx != 0 || this.my != 0) {
                if(this.currentAnimation.name !== 'walk')
                     this.playAnimation('walk');
            } else {
                if(this.currentAnimation.name !== 'idle')
                    this.playAnimation('idle');
            }

            // Check for collisions and adjust if necessary
            if (!isColliding([this.gx + this.moveX, this.gy], this.radius, this.boundingObstacles)) {
                this.gx += this.moveX;
            }

            if (!isColliding([this.gx, this.gy + this.moveY], this.radius, this.boundingObstacles)) {
                this.gy += this.moveY;
            }
            // this.advance();
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
            this.health -= damage;
        },
    });
}
