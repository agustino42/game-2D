import { init, GameLoop, Sprite, SpriteSheet } from 'kontra';
import loadImageAssets from './AssetLoader';
import Tilemap from './Tilemap';
import {getPlayer, getTree, getZombie} from './SpriteFactory';
import {handleInput, isActionKeyPressed, isSpacePressed} from './InputHandler';
import { getFilteredObstacles, getFilteredSprites } from './ObastacleHandler';
import spawnZombie from './ZombieSpawner';
import { Position } from './Interfaces';
import { getActionKeyPressed } from './InputEvents';
import { getGingerShot, getGingerShotHits, getTurmericCursor, getVCBomb } from './ProjectileFactory';
import { getNormalizedVector } from './Utils';
import { colorMap, getTileSet, getUnitSheet } from './Presets';
import generateMap from './MapGenerator';
import { GameState } from './GameState';
import { playGingerShotSound } from './Sounds';
//@ts-ignore
// import { playMusic } from './Music';

async function main() {
  const [groundTiles, unitTiles] = await loadImageAssets();
  const unitSheet = getUnitSheet(unitTiles);
  let { canvas } = init();
  const textCanvas = document.getElementById('t') as HTMLCanvasElement;
  const TILE_SIZE = 16;
  const tileset = getTileSet(TILE_SIZE, groundTiles, colorMap);
  
  
  //initializing kontra
  const mouseButtonPressed: { [key: string]: boolean } = {};
  const mousePosition: Position = {x: 0, y: 0};
  
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mousePosition.x = (event.clientX - rect.left) * scaleX;
    mousePosition.y = (event.clientY - rect.top) * scaleY;
  });
  canvas.addEventListener('mousedown', (event) => {
    mouseButtonPressed[event.button] = true;
  });
  
  canvas.addEventListener('mouseup', (event) => {
    mouseButtonPressed[event.button] = false;
  });
  const tilemapWidth = canvas.width * 8;
  const tilemapHeight = canvas.height * 11;
  //initializing map
  //initializing player
  const player = getPlayer(tilemapWidth / 2, tilemapHeight /2, canvas, unitSheet.animations);
  const zombies: Sprite[] = [];
  const projectiles: Sprite[] = [];
  const projectilesHits: Sprite[] = [];
  const aoeTargets: Sprite[] = [];
  const aoe: Sprite[] = [];
  
  const tilemap = await generateMap(8,0.5, tilemapWidth, tilemapHeight, tileset)
  const splashZombies = [getZombie(0, 0, player, canvas, 0, unitSheet.animations),getZombie(0, 0, player, canvas, 0, unitSheet.animations)];
  const treeSheet = SpriteSheet({
    image: groundTiles,
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      splash: {
        frames: '2',
        frameRate: 0,
        loop: false
      }
    }
  })

  
  textCanvas.width = canvas.offsetWidth;
  const gameState = new GameState(180, player, textCanvas, textCanvas.width/canvas.width, splashZombies, [getTree(treeSheet['animations']), getTree(treeSheet['animations'])]);

  window.addEventListener('resize', () => {
    textCanvas.width = canvas.offsetWidth;
    gameState.sc = textCanvas.width/canvas.width;
    gameState.reloadUI();
  });
  gameState.setState(0);
  // playMusic();
  
  
  
  //setting up background
  const worldMap = getWorldMap(tilemap, player, canvas);
  const treeTops = getTreeTops(tilemap, player, canvas);
  


  let zombieTimer = 0;
  
  let loop = GameLoop({  // create the main game loop
    update: function(dt) { // update the game state
      if(gameState.s === 0 || gameState.s === 2 || gameState.s === 3){
        if(isSpacePressed()){
          gameState.setState(1);
        }
      } else if(gameState.s === 1){

        const screenObstacles = getFilteredObstacles(tilemap.obstacles, player.getScreenBounds(), TILE_SIZE);
        const screenTrees = getFilteredSprites(tilemap.trees, player.getScreenBounds());
        zombieTimer += dt;
        if(zombieTimer >= 4 * (1 - gameState.tp / gameState.lt) + 1){
          zombies.push(spawnZombie(player, canvas, TILE_SIZE * 2, screenObstacles, unitSheet.animations));
          zombieTimer = 0;
        }
  
        
        handleInput(player);
        if(isActionKeyPressed()){
          const inputMap = getActionKeyPressed();
          if(inputMap[' '] && player.cooldowns[1] === 0){
            if(aoeTargets.length === 0 && player.cooldowns[3] === 0 ) {
              aoeTargets[0] = getVCBomb(getMousePosition(), canvas, player);
              player.cooldowns[3] = 0.5;
              player.vcb = true;
            } else if(player.vcb && player.cooldowns[3] === 0){
              aoeTargets.splice(0,1);
              player.vcb = false;
              player.cooldowns[3] = 0.5;
            }
          }
          if((inputMap['e'] || inputMap['q']) && player.cooldowns[2] === 0){
            if(aoeTargets.length === 0 && player.cooldowns[3] === 0 ) {
              aoeTargets[0] = getTurmericCursor(getMousePosition(), canvas, player);
              player.cooldowns[3] = 0.5;
              player.tc = true;
            } else if(player.tc && player.cooldowns[3] === 0){
              aoeTargets.splice(0,1);
              player.tc = false;
              player.cooldowns[3] = 0.5;
            }
          }
        }
        if(handleMouseInput()){
          if(player.cooldowns[0] === 0 && !player.vcb && !player.tc && player.cooldowns[3] === 0){
            player.cooldowns[3] = 0.5;
            player.cooldowns[0] = 0.5;
            const direction = getNormalizedVector(player.getScreenPosition(), getMousePosition())
            projectiles.push(getGingerShot(player.getPosition(),direction, canvas, player ));
            playGingerShotSound();
          }  else if(player.vcb && aoeTargets.length > 0){
            aoe.push(...aoeTargets[0].explode(zombies));
            aoeTargets.splice(0,1);
            player.vcb = false;
            player.cooldowns[3] = 0.5;
            player.cooldowns[1] = 15;
          } else if(player.tc && aoeTargets.length > 0){
            aoe.push(...aoeTargets[0].explode(zombies));
            aoeTargets.splice(0,1);
            player.tc = false;
            player.cooldowns[3] = 0.5;
            player.cooldowns[2] = 15;
          }
        } 
        projectilesHits.forEach((projectileHit) => {
          projectileHit.update(dt);
          if(projectileHit.ttl <= 0){
            projectilesHits.splice(projectilesHits.indexOf(projectileHit), 1);
          }
        });
  
        projectiles.forEach((projectile) => {
          projectile.setMovement(dt, [...screenTrees, ...zombies ]);
          projectile.update(dt);
          if(projectile.isColliding)
            projectile.ttl = 0;
          if(projectile.ttl <= 0){
            projectiles.splice(projectiles.indexOf(projectile), 1);
            projectilesHits.push(...getGingerShotHits(projectile.getPosition(), canvas, player)); 
          }
        });

        aoeTargets.forEach((target) => {
          target.setPos(getMousePosition());
          target.update(dt);
        });

        
        aoe.forEach((bomb) => {
          bomb.update(dt);
          if(bomb.duration <= 0){
            aoe.splice(aoe.indexOf(bomb), 1);
          }
        });

        


        player.setBoundingObstacles(getFilteredObstacles(tilemap.obstacles, player.getExtendedBounds(TILE_SIZE), TILE_SIZE));
        
        player.reduceSpeedIfTakingDamage();
        player.update(dt);
        player.moveUnit(dt);
        player.setAnimation();
        player.updateCooldowns(dt);
        let zombiesKilled: number = 0;
  
        zombies.forEach((zombie, index) => {
          if(zombie.getDistanceToTarget() > canvas.width * 1.5) zombie.health = 0;
          if(zombie.getDistanceToTarget() < player.radius && zombie.cooldowns[0] === 0) {
            player.takeDamage(zombie.damage);
            zombie.cooldowns[0] = 1;
          }
          if(zombie.health <= 0) {
            zombies.splice(index, 1);
            zombiesKilled++;
            return;
          }
          let zombieFilteredObstacles = getFilteredObstacles(tilemap.obstacles, zombie.getExtendedBounds(TILE_SIZE), TILE_SIZE);
          zombie.updateCooldowns(dt); 
          zombie.setBoundingObstacles(zombieFilteredObstacles);
          zombie.setScreenPosition();
          zombie.checkIfWithinViewport();
          zombie.update(dt);
          zombie.moveUnit(dt);
          zombie.setAnimation();
          if(zombie.cooldowns[4] === 0){
            zombie.isTakingDamage = false;
          }
          zombie.speed = zombie.normalSpeed;
        });
        if(player.health <= 0){
          gameState.setState(2);
          zombies.forEach((zombie) => {
            zombie.health = 0;
          });
        }
        player.score += zombiesKilled * 10 * (1 + zombiesKilled * 0.5);
        player.reset();
      }
      gameState.update(dt);
    },
    render: function() { // render the game state
      if(gameState.s === 1){
        worldMap.drawImage();
        aoeTargets.forEach((target) => {
          target.render();
        });
        player.render();
        zombies.forEach((zombie) => {
          if(zombie.isInViewPort){
            if(zombie.isTarget) zombie.drawTargetMark();
            zombie.render();
          }
        });
        aoe.forEach((bomb) => {
          bomb.render();
        });
        projectiles.forEach((projectile) => {
          projectile.render();
        });
        projectilesHits.forEach((projectileHit) => {
          projectileHit.render();
        });
        
        treeTops.drawImage();
      }
      gameState.renderUI();
    }
  });

  loop.start(); 
     // start the game
  function getMousePosition(): Position {
    return mousePosition;
  }

  function mousePressed(button: number): boolean {
    return !!mouseButtonPressed[button];
  }

  function handleMouseInput(): boolean {
    if(mousePressed(0)) {
        return true;
    }
    return false;
}
}

main();


function getWorldMap(tilemap: Tilemap, player: Sprite, canvas: HTMLCanvasElement){
  const image = convertImageDataToCImage(tilemap.getWorldMap());
  return getMapImage(image, player, canvas);
}

function getTreeTops(tilemap: Tilemap, player: Sprite, canvas: HTMLCanvasElement): Sprite{
  const image = convertImageDataToCImage(tilemap.getTreeTops());
  return getMapImage(image, player, canvas);
}

function convertImageDataToCImage(imageData: ImageData): HTMLImageElement {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const ctx = tempCanvas.getContext('2d');
  ctx?.putImageData(imageData, 0, 0);
  const img = new Image();
  img.src = tempCanvas.toDataURL();
  return img;
}

function getMapImage(image: HTMLImageElement, player: Sprite, canvas: HTMLCanvasElement): Sprite{
  return Sprite({
    x: 0,
    y: 0,
    player: player,
    image: image,
    anchor: {x: 0, y: 0},
    drawImage: function(this: Sprite){
      this.context?.drawImage(this.image, Math.round(this.player.gx - canvas.width/2), Math.round(this.player.gy - canvas.height / 2), canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }
  });
}




