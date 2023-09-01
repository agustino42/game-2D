import { SpriteSheet, Sprite } from "kontra";
import { isColliding } from "./InputHandler";

function getBaseSprite(x: number, y: number, gx: number, gy: number, animations: SpriteSheet['animations'], radius: number, speed: number, health: number): Sprite {
    return Sprite({
        x: x,
        y: y,
        gx: gx,
        gy: gy,
        animations: animations,
        radius: radius,
        mx: 0,
        my: 0,
        anchor: {x: 0.5, y: 0.7},
        speed: speed,
        health: health,
        boundingObstacles: [],
        moveX: 0,
        moveY: 0,
        moveUnit(dt?: number): void{
            this.setMovement(dt);
            if (!isColliding([this.gx + this.moveX, this.gy], this.radius, this.boundingObstacles)) {
                this.gx += this.moveX;
            }
            if (!isColliding([this.gx, this.gy + this.moveY], this.radius, this.boundingObstacles)) {
                this.gy += this.moveY;
            }
        },
        setMovement(dt?: number): void{
            if (dt === undefined) return;
                
            const speed = this.speed * dt;
        
            // Proposed movement
            this.moveX = speed * this.mx;
            this.moveY = speed * this.my;
        },
        getBounds(): {left: number, right: number, top: number, bottom: number} {
            return {
                left: this.gx - this.radius,
                right: this.gx + this.radius,
                top: this.gy - this.radius,
                bottom: this.gy + this.radius
            };
        },
        getExtendedBounds(tileSize: number){
            let bounds = this.getBounds();
            return  {
                left: bounds.left - tileSize,
                right: bounds.right + tileSize,
                top: bounds.top - tileSize,
                bottom: bounds.bottom + tileSize
            };
            
        },
        setBoundingObstacles(this: Sprite, obstacles: [number,number][]){
            this.boundingObstacles = obstacles;
        },
        setAnimation(this: Sprite){
            if(this.moveX < 0){
                this.setScale(-1,1);
            } else if(this.moveX > 0){
                this.setScale(1,1);
            }

            if (this.moveX != 0 || this.moveY != 0) {
                if(this.currentAnimation.name !== this.walk)
                     this.playAnimation(this.walk);
            } else {
                if(this.currentAnimation.name !== this.idle)
                    this.playAnimation(this.idle);
            }
        }
    });
}

export function getPlayer(gx: number, gy: number, canvas: HTMLCanvasElement, animations: SpriteSheet['animations']): Sprite {
    
    const player = getBaseSprite(canvas.width / 2, canvas.height / 2, gx - 4, gy - 5, animations, 5, 60, 100);
    player.idle = 'idle';
    player.walk = 'walk';
    player.getScreenBounds = function(this: Sprite){
        return {
            left: this.gx - (canvas.width / 2),
            right: this.gx + (canvas.width / 2),
            top: this.gy - (canvas.height / 2),
            bottom: this.gy + (canvas.height / 2)
        };
    }
    player.takeDamage = function(this: Sprite, damage: number){
        this.health -= damage;
        this.isTakingDamage = true;
    }
    player.reduceSpeedIfTakingDamage = function(this: Sprite){
        this.speed = 20;
        this.isTakingDamage = false;
    }
    return player;
}

export function getZombie(x: number, y: number, target: Sprite, canvas: HTMLCanvasElement, speed: number, animations: SpriteSheet['animations']): Sprite {
    const zombie = getBaseSprite(x, y, x, y, animations, 5, speed, 100);
    zombie.canvas = canvas;
    zombie.target = target;
    zombie.damage = 5;
    zombie.onCooldown = false;
    zombie.cooldownTime = 1;
    zombie.cooldownCounter = 0;
    zombie.isInViewPort = false;
    zombie.idle = 'zombieIdle';
    zombie.walk = 'zombieWalk';
    zombie.getDistanceToTarget = function(this: Sprite){
        return Math.sqrt(Math.pow(this.gx - this.target.gx, 2) + Math.pow(this.gy - this.target.gy, 2));
    }
    zombie.setMovement = function(this: Sprite, dt?: number){
        if (dt === undefined) return;
        // Calculate direction towards the player
        const dirX = this.target.gx - this.gx;
        const dirY = this.target.gy - this.gy;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
                
        // Determine next global position
        this.moveX = dirX / distance * this.speed * dt;
        this.moveY = dirY / distance * this.speed * dt;
    }
    zombie.setScreenPosition = function(this: Sprite) {
        // Convert global to local coordinates relative to the player's position
        this.x = this.gx - this.target.gx + canvas.width / 2;
        this.y = this.gy - this.target.gy + canvas.height / 2;
    }
    zombie.drawHitbox = function(this: Sprite){
        this.context.fillStyle = "#ff0000";
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    }
    zombie.checkIfWithinViewport = function(this: Sprite){
        this.isInViewPort = this.x + this.radius >= 0 && this.x - this.radius < canvas.width &&
        this.y + this.radius >= 0 && this.y - this.radius < canvas.height;
    }
    
    return zombie;
}


