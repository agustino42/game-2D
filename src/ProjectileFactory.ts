import { Sprite } from 'kontra';
import { Position } from './Interfaces';
import { circleToCircleCollision, spriteToCircle } from './Utils';
import { colorMap } from './Presets';
import { vCB, tC } from './Sounds';

export function getGingerShot(position: Position, direction: Position, canvas: HTMLCanvasElement, player: Sprite): Sprite{
    return Sprite({
        x:0,
        y: 0,
        gx: position.x,
        gy: position.y,
        dx: direction.x,
        dy: direction.y,
        radius: 2,
        color: colorMap.uY,
        damage: 20,
        speed: 200,
        moveX: 0,
        moveY: 0,
        isColliding: false,
        ttl: 60,
        render(this: Sprite) {
            this.context.fillStyle = this.color;
            this.context.beginPath();
            this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
            this.context.fill();
        },
        update(this: Sprite, dt?: number) {
            if (dt === undefined) return;
            // this.gx += this.dx ? this.dx * this.speed *dt : 0;
            // this.gy += this.dy ? this.dy * this.speed *dt : 0; 
            this.gx += this.moveX;
            this.gy += this.moveY;
            this.x = this.gx - player.gx + canvas.width / 2;
            this.y = this.gy - player.gy + canvas.height / 2;
            this.advance();
        },
        setMovement(this: Sprite, dt?: number, obstacles?: Sprite[]) {
            if (dt === undefined) return;
            obstacles?.forEach((obstacle) => {
                if(circleToCircleCollision({position: this.nextPosition(), radius: this.radius}, spriteToCircle(obstacle))){
                    const dirX = obstacle.x - this.gx;
                    const dirY = obstacle.y - this.gy;
                    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
                    this.moveX = dirX / distance * this.speed * dt;
                    this.moveY = dirY / distance * this.speed * dt;
                    this.isColliding = true;
                    obstacle.takeDamage(this.damage);
                }
            });
            if(!this.isColliding){
                    this.moveX = this.dx ? this.dx * this.speed *dt : 0;
                    this.moveY =this.dy ? this.dy * this.speed *dt : 0;
            }
        },
        nextPosition(this: Sprite, dt?: number): Position {
            if (dt === undefined) return {x: this.gx, y: this.gy};
            const x = this.gx + (this.dx ? this.dx * this.speed *dt : 0);
            const y = this.gy + (this.dy ? this.dy * this.speed *dt : 0);
            return {x: x, y: y};
        },
        getPosition(this : Sprite): Position {
            return {x: this.gx, y: this.gy};
        },
        getBounds(): {left: number, right: number, top: number, bottom: number} {
            return {
                left: this.gx - this.radius,
                right: this.gx + this.radius,
                top: this.gy - this.radius,
                bottom: this.gy + this.radius
            };
        },
        getExtendedBounds(this: Sprite, dt?: number){
            if (dt === undefined) return;
            let bounds = this.getBounds();
            return  {
                left: bounds.left - this.speed * dt,
                right: bounds.right + this.speed * dt,
                top: bounds.top - this.speed * dt,
                bottom: bounds.bottom + this.speed * dt
            };
            
        },

    });
}

export function getGingerShotHit(position: Position, direction: Position, canvas: HTMLCanvasElement, player: Sprite): Sprite {
    return Sprite({
        x: 0,
        y: 0,
        gx: position.x,
        gy: position.y,
        dx: direction.x,
        dy: direction.y,
        radius: 1,
        color: colorMap.uY,
        speed: 200,
        ttl: 5,
        isColliding: false,
        render(this: Sprite) {
            this.context.fillStyle = this.color;
            this.context.beginPath();
            this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
            this.context.fill();
        },
        update(this: Sprite, dt?: number) {
            if (dt === undefined) return;
            this.gx += this.dx ? this.dx * this.speed *dt : 0;
            this.gy += this.dy ? this.dy * this.speed *dt : 0; 
            this.x = this.gx - player.gx + canvas.width / 2;
            this.y = this.gy - player.gy + canvas.height / 2;
            this.radius *= 0.8;
            this.advance();
        },
    });
}

export function getGingerShotHits(position: Position, canvas: HTMLCanvasElement, player: Sprite): Sprite[] {
    const directions = [{x: 1, y: 1}, {x: -1, y: 1}, {x: 1, y: -1}, {x: -1, y: -1}];
    return directions.map((direction) => getGingerShotHit(position, direction, canvas, player));
}

function getAoe(position: Position, canvas: HTMLCanvasElement, player: Sprite): Sprite {
    return Sprite({
        x: 0,
        y: 0,
        gx: position.x,
        gy: position.y,
        radius: 40,
        color: colorMap.uP + '77',
        render(this: Sprite) {
            this.context.fillStyle = this.color;
            this.context.beginPath();
            this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
            this.context.fill();
        },
        update(this: Sprite, dt?: number) {
            if (dt === undefined) return;
            this.x = this.gx - player.gx + canvas.width / 2;
            this.y = this.gy - player.gy + canvas.height / 2;
            this.advance();
        },
        setPos(this: Sprite, position: Position){
            //calcular la posicion globar de la base o la posicion del jugador
            this.gx = position.x + player.gx - canvas.width / 2;
            this.gy = position.y + player.gy - canvas.height / 2;
        },
        explode(this: Sprite, zombies: Sprite[]): Sprite[]{
            vCB();
            zombies.forEach((zombie) => {
                if(circleToCircleCollision(spriteToCircle(zombie), spriteToCircle(this))){
                    zombie.takeDamage(100);
                }
            });
            return getVCBExp({x: this.gx, y: this.gy}, canvas, player);
        },
        getBounds(this: Sprite): {left: number, right: number, top: number, bottom: number} {
            return {
                left: this.gx - this.radius,
                right: this.gx + this.radius,
                top: this.gy - this.radius,
                bottom: this.gy + this.radius
            };
        },
    });    
}

function getVCBExp(position: Position, canvas: HTMLCanvasElement, player: Sprite): Sprite[] {
    const sprites: Sprite[] = [];
    for(let i=0; i<20; i++){
        sprites.push(
            Sprite({
                x: 0,
                y: 0,
                gx: position.x,
                gy: position.y,
                duration: 0.5,  
                radius: 5,
                color: colorMap.uP,
                render(this: Sprite) {
                    this.context.fillStyle = this.color;
                    this.context.beginPath();
                    this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
                    this.context.fill();
                },
                update(this: Sprite, dt?: number) {
                    if (dt === undefined) return;
                    this.gx += Math.random() * 20 - 10;
                    this.gy += Math.random() * 20 - 10;
                    this.x = this.gx - player.gx + canvas.width / 2;
                    this.y = this.gy - player.gy + canvas.height / 2;
                    this.radius *= 0.9;
                    this.duration -= dt;
                },
            })
        );
    }
    return sprites;
}

export function getVCBomb(position: Position, canvas: HTMLCanvasElement, player: Sprite): Sprite {
    return getAoe(position, canvas, player);
}

export function getTurmericCursor(position: Position, canvas: HTMLCanvasElement, player: Sprite): Sprite {
    const sprite = getAoe(position, canvas, player);
    sprite.color = colorMap.uY + '55';
    sprite.radius = 40;
    sprite.explode = function(this: Sprite, zombies: Sprite[]): Sprite[]{
        tC();
        return getTumericCloud({x: this.gx, y: this.gy}, canvas, player, zombies);
    };
    return sprite;
}

function getTumericCloud(position: Position, canvas: HTMLCanvasElement, player: Sprite, zombies: Sprite[]): Sprite[]{
    const sprites: Sprite[] = [];
        sprites.push(
            Sprite({
                x: 0,
                y: 0,
                gx: position.x,
                gy: position.y,
                duration: 10,  
                radius: 40,
                color: colorMap.uY + '44',
                lighterColor: colorMap.uY + '99',
                grow: true,
                bubbles: [],
                player: player,
                render(this: Sprite) {
                    this.context.fillStyle = this.color;
                    this.context.beginPath();
                    this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
                    this.context.fill();
                    this.bubbles.forEach((bubble: any) => {
                        this.context.fillStyle = bubble.color;
                        this.context.beginPath();
                        this.context.arc(bubble.x-this.x, bubble.y-this.y, bubble.radius, 0, 2 * Math.PI);
                        this.context.fill();
                    });
                },
                update(this: Sprite, dt?: number) {
                    if (dt === undefined) return;
                
                    this.x = this.gx - player.gx + canvas.width / 2;
                    this.y = this.gy - player.gy + canvas.height / 2;
                    this.duration -= dt;

                    if(this.bubbles.length < 60){
                        this.gB();
                    }
                
                    this.bubbles.forEach((bubble: any) => {
                        bubble.gy -= 10 * dt;
                        bubble.x = bubble.gx - player.gx + canvas.width / 2;
                        bubble.y = bubble.gy - player.gy + canvas.height / 2;
                        bubble.radius *= 0.95;
                        bubble.duration -= dt;
                        if(bubble.duration <= 0){
                            this.bubbles.splice(this.bubbles.indexOf(bubble), 1);
                        }
                        bubble.color = this.lighterColor;
                    });
                    zombies.forEach((zombie) => {
                        //if the zombie is within the cloud redue speed by 75%
                        if(circleToCircleCollision(spriteToCircle(zombie), spriteToCircle(this))){
                            zombie.speed = zombie.normalSpeed * 0.25;
                        } 
                    });

                
                },
                gB(this: Sprite){
                    const px = this.gx + Math.random() * this.radius * 2 - this.radius;
                    const py = this.gy + Math.random() * this.radius * 2 - this.radius;
                    for(let i = this.bubbles.length; i < 20; i++){
                        this.bubbles.push({
                            x: 0,
                            y: 0,
                            gx: px,
                            gy: py,
                            radius: 5 * Math.random(),
                            color: this.lighterColor,
                            duration: Math.random() * 5
                        });

                    }
                },
            })
        );
    return sprites;
}