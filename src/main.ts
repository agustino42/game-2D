import { init, GameLoop, Sprite, SpriteSheet } from 'kontra';
import loadImageAssets from './AssetLoader';
import Tileset from './Tileset';
import generatePermTable  from './Perlin/PermutationTable';
import Tilemap from './Tilemap';
import {getPlayer} from './SpriteFactory';
import handleInput from './InputHandler';
import getFilteredObstacles from './ObastacleHandler';
import { getHealthBar, getScoreCounter, getTopBar } from './UIElements';
import spawnZombie from './ZombieSpawner';

async function main() {
  const [groundTiles, playerTiles] = await loadImageAssets();
  const playerSheet = SpriteSheet({
    image: playerTiles,
    frameWidth: 16,
    frameHeight: 22,
    animations: {
      idle: {
        frames: '0..1',
        frameRate: 2
      },
      walk: {
        frames: '2..5',
        frameRate: 8
      },
      zombieIdle: {
        frames: '6..7',
        frameRate: 2
      },
      zombieWalk: {
        frames: '8..11',
        frameRate: 8
      }
    }
  });
  const textCanvas = document.getElementById('text') as HTMLCanvasElement;
  const textCtx = textCanvas.getContext('2d') as CanvasRenderingContext2D;
  const TILE_SIZE = 16;
  const colorMap = {
    'grass': '#2b4432',
    // 'grass': '#729d3f',
    // 'water': '#6db8d4',
    'water': '#374952',
    'sand': '#9d7e6a'
    // 'sand': '#e8d5b0'
  };
  const tileset = new Tileset(TILE_SIZE, groundTiles, {
    'grass': {background: colorMap.grass },
    'water': { background: colorMap.water },
    'flowers': { x: 2, y: 1 },
    'innerCorner': { x: 0, y: 0 },
    'outerCorner': { x: 1, y: 0 },
    'border': { x: 2, y: 0 },
    'sand': { background: colorMap.sand },
    'rocks': { x: 1, y: 1 },
    'waves': { x: 0, y: 1 }, 
    'trees': { x: 3, y: 0 },
  });
  //seed with a random number from 3 to 100
  const islandFactorConstant = 0.5;
  const perm = generatePermTable(8);

  //generating game mape
  
  
  //initializing kontra
  let { canvas, context } = init();
  const tilemap = new Tilemap(Math.floor(canvas.width * 8), Math.floor(canvas.height * 11), tileset);
  const trees = await tilemap.generateMap(perm,islandFactorConstant);
  if(!trees) throw new Error('Map generation failed.');
  //initializing player
  const player = getPlayer(tilemap.width/2, tilemap.height/2, canvas, playerSheet.animations);
  const filteredObstacles = getFilteredObstacles(tilemap.obstacles, player.getExtendedBounds(TILE_SIZE), TILE_SIZE);
  player.setBoundingObstacles(filteredObstacles);
  player.playAnimation('walk');

  // const treeTops = trees.map((tree) => {
  //   return getTreeTop(tree[0], tree[1], groundTiles, backgroundCanvas, player);
  // });
  // const treeBottoms = trees.map((tree) => {
  //   return getTree(tree[0], tree[1], groundTiles, backgroundCanvas, player);
  // });

  //initializing zombies
  const zombies: Sprite[] = [];

  //initializing UI
  const uiItems: Sprite[] = [];
  uiItems.push(getHealthBar(player, context));
  uiItems.push(getScoreCounter(player, context, canvas.width));
  uiItems.push(getTopBar(canvas.width));
  
  //setting up background
  // let mapSection = getMapSection(tilemap, player, backgroundCanvas);
  const worldMap = getWorldMap(tilemap, player, canvas);
  const treeTops = getTreeTops(tilemap, player, canvas);
  // backgroundCtx.putImageData(mapSection, 0, 0);


  let zombieTimer = 0;
  
  let loop = GameLoop({  // create the main game loop
    update: function(dt) { // update the game state

      zombieTimer += dt;
      if(zombieTimer >= 5){
        zombies.push(spawnZombie(player, canvas, TILE_SIZE * 2, getFilteredObstacles(tilemap.obstacles, player.getScreenBounds(), TILE_SIZE), playerSheet.animations));
        zombieTimer = 0;
      }

      //update map
      // mapSection = getMapSection(tilemap, player, backgroundCanvas);
      worldMap.update();
      treeTops.update();

      
      handleInput(player);

      player.setBoundingObstacles(getFilteredObstacles(tilemap.obstacles, player.getExtendedBounds(TILE_SIZE), TILE_SIZE));
      if(player.isTakingDamage) player.reduceSpeedIfTakingDamage();
      player.update(dt);
      player.moveUnit(dt);
      player.setAnimation();

      // for(let i = 0; i < treeTops.length; i++){
      //   treeTops[i].update();
      //   treeBottoms[i].update();
      // }

      zombies.forEach((zombie, index) => {
        if(zombie.getDistanceToTarget() > canvas.width * 1.5) zombie.health = 0;
        if(zombie.getDistanceToTarget() < player.radius && !zombie.onCooldown) {
          player.takeDamage(zombie.damage);
          player.isTakingDamage = true;
          zombie.onCooldown = true;
          zombie.cooldownCounter = 0;
        } else if(zombie.onCooldown) {
          zombie.cooldownCounter += dt;
          if(zombie.cooldownCounter >= zombie.cooldownTime) {
            zombie.onCooldown = false;
          }
        }
        if(zombie.health <= 0) {
          zombies.splice(index, 1);
          return;
        }
        let zombieFilteredObstacles = getFilteredObstacles(tilemap.obstacles, zombie.getExtendedBounds(TILE_SIZE), TILE_SIZE);
        zombie.setBoundingObstacles(zombieFilteredObstacles);
        zombie.setScreenPosition();
        zombie.checkIfWithinViewport();
        zombie.update(dt);
        zombie.moveUnit(dt);
        zombie.setAnimation();
      });

      uiItems.forEach((item) => {
        item.update();
      });

    },
    render: function() { // render the game state
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      worldMap.render();
      player.render();
      zombies.forEach((zombie) => {
        if(zombie.isInViewPort){
          zombie.render();
        }
      });
      
      // backgroundCtx.putImageData(mapSection, 0, 0);
      treeTops.render();
      uiItems.forEach((item) => {
        item.render();
      });

    }
  });

  loop.start();    // start the game
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
    update: function(this: Sprite){
    },
    render: function(this: Sprite){
      this.context?.drawImage(this.image, this.player.gx - canvas.width/2, this.player.gy - canvas.height / 2, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }
  });
}


