import { SpriteSheet, Sprite } from "kontra";
import { isColliding } from "./InputHandler";
import { Position } from "./Interfaces";
import { hit } from "./Sounds";

function getBaseUnitSprite(x: number, y: number, gx: number, gy: number, animations: SpriteSheet['animations'], radius: number, speed: number, health: number): Sprite {
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
        normalSpeed: speed,
        health: health,
        maxHealth: health,
        boundingObstacles: [],
        cooldowns: [0,0,0,0,0,0],
        moveX: 0,
        moveY: 0,
        score: 0,
        isTakingDamage: false,
        moveUnit(dt?: number): void{
            this.setMovement(dt);
            if (!isColliding({x: this.gx + this.moveX, y: this.gy}, this.radius, this.boundingObstacles)) {
                this.gx += this.moveX;
            }
            if (!isColliding({x: this.gx, y: this.gy + this.moveY}, this.radius, this.boundingObstacles)) {
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
        setBoundingObstacles(this: Sprite,obstacles: Position[]){
            this.boundingObstacles = obstacles;
        },
        setAnimation(this: Sprite){
            if(this.moveX < 0){
                this.setScale(-1,1);
            } else if(this.moveX > 0){
                this.setScale(1,1);
            }

            if (this.isTakingDamage) {
                this.playAnimation(this.hurt);
            }else if (this.moveX != 0 || this.moveY != 0) {
                this.playAnimation(this.walk);
            } else {
                this.playAnimation(this.idle);
            }
        }, 
        getPosition(this: Sprite): Position {
            return {x: this.gx, y: this.gy};
        },
        getScreenPosition(this: Sprite): Position {
            return {x: this.x, y: this.y};
        },
        takeDamage(this: Sprite, damage: number){
            this.health -= damage;
            this.isTakingDamage = true;
            this.cooldowns[4] = 0.5;
            this.cooldowns[5] = 1;
            hit();
        },
        updateCooldowns(this: Sprite, dt: number){
            for(let i = 0; i < this.cooldowns.length; i++){
                if(this.cooldowns[i] > 0){
                    this.cooldowns[i] -= dt;
                } else {
                    this.cooldowns[i] = 0;
                }
            }
        }

    });
}

export function getPlayer(gx: number, gy: number, canvas: HTMLCanvasElement, animations: SpriteSheet['animations']): Sprite {
    
    const player = getBaseUnitSprite(canvas.width / 2, canvas.height / 2, gx - 4, gy - 5, animations, 5, 60, 100);
    player.idle = 'idle';
    player.walk = 'walk';
    player.hurt = 'hurt';
    player.initialPosition = {x: gx, y: gy};
    player.vcb = false;
    player.tc = false;
    player.getScreenBounds = function(this: Sprite){
        return {
            left: this.gx - (canvas.width / 2),
            right: this.gx + (canvas.width / 2),
            top: this.gy - (canvas.height / 2),
            bottom: this.gy + (canvas.height / 2)
        };
    }
    player.reduceSpeedIfTakingDamage = function(this: Sprite){
        if(this.cooldowns[5] > 0) this.speed = this.normalSpeed * 0.7;
    }
    player.reset = function(this: Sprite){
        if(this.cooldowns[5] === 0 && this.speed !== this.normalSpeed){
            this.speed = this.normalSpeed;
            this.isTakingDamage = false;
        }
    }
    player.resetLevel = function(this: Sprite){
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.setScale(1,1);
        this.gx = this.initialPosition.x;
        this.gy = this.initialPosition.y;
        this.health = this.maxHealth;
        this.isTakingDamage = false;
        this.speed = this.normalSpeed;
        this.cooldowns = [0,0,0,0.5,0,0];
        this.score = 0;
    }
    return player;
}

export function getZombie(x: number, y: number, target: Sprite, canvas: HTMLCanvasElement, speed: number, animations: SpriteSheet['animations']): Sprite {
    const zombie = getBaseUnitSprite(x, y, x, y, animations, 5, speed, 100);
    zombie.canvas = canvas;
    zombie.target = target;
    zombie.isTarget = false;
    zombie.damage = 5;
    zombie.onCooldown = false;
    zombie.cooldownTime = 1;
    zombie.cooldownCounter = 0;
    zombie.isInViewPort = false;
    zombie.idle = 'zI';
    zombie.walk = 'zombieWalk';
    zombie.hurt = 'zH';
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
    zombie.drawTargetMark = function(this: Sprite){
        this.context.strokeStyle = "#ff0000";
        this.context.lineWidth = 2;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius * 2, 0, 2 * Math.PI);
        this.context.stroke();
    }
    zombie.checkIfWithinViewport = function(this: Sprite){
        this.isInViewPort = this.x + this.radius >= 0 && this.x - this.radius < canvas.width &&
        this.y + this.radius >= 0 && this.y - this.radius < canvas.height;
    }
    zombie.isPointInside = function(this: Sprite, x: number, y: number){
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - (this.y-4), 2)) < this.radius + 4;
    }
    
    return zombie;
}

export function getTree(animations: SpriteSheet['animations']): Sprite {
    return Sprite({
        x: 0,
        y: 0,
        animations: animations,
        anchor: {x: 0.5, y: 0.5}
    });
        
}


