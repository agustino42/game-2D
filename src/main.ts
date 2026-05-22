import { init, GameLoop, Sprite, SpriteSheet } from 'kontra';
import loadImageAssets from './ImagenCarga';
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
import { GameState } from './EstadoJuego';
import { playGingerShotSound } from './Sounds';
//@ts-ignore
// import { playMusic } from './Music';

// ===== NICKNAME & BACKEND FUNCTIONS =====
// Obtener nickname del localStorage (se guarda desde la landing page)
const nickname = localStorage.getItem('space_survival_nickname') || 'Anónimo';

// Función para guardar puntuación en el backend
async function saveScoreToBackend(score: number, zombiesKilled: number, gameDuration: number) {
    try {
        const response = await fetch('http://localhost:8000/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player: nickname,
                score: Math.floor(score),
                game_duration: Math.floor(gameDuration),
                zombies_killed: zombiesKilled
            })
        });
        
        if (response.ok) {
            console.log('✅ Puntuación guardada en el ranking!');
        }
    } catch (error) {
        console.warn('⚠️ No se pudo guardar la puntuación (backend no disponible):', error);
        // El juego sigue funcionando aunque el backend no esté disponible
    }
}

// Función para mostrar modal de puntuación final
function showGameOverModal(score: number, zombiesKilled: number) {
    // Guardar en localStorage para referencia
    localStorage.setItem('last_score', score.toString());
    localStorage.setItem('last_zombies', zombiesKilled.toString());
    
    // Mostrar modal simple
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 40px;
        border-radius: 20px;
        border: 3px solid #00ff88;
        text-align: center;
        z-index: 1000;
        min-width: 300px;
    `;
    
    modal.innerHTML = `
        <h2 style="color: #ff0055; font-size: 2em; margin-bottom: 20px;">💀 GAME OVER</h2>
        <p style="color: white; font-size: 1.2em; margin-bottom: 10px;">Nickname: ${nickname}</p>
        <p style="color: #00ff88; font-size: 1.5em; font-weight: bold; margin-bottom: 20px;">🏆 Puntuación: ${Math.floor(score).toLocaleString()}</p>
        <p style="color: #a0a0a0; margin-bottom: 30px;">Zombies eliminados: ${zombiesKilled}</p>
        <button id="save-score-btn" style="
            padding: 15px 30px;
            background: #00ff88;
            color: #0f0c29;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
        ">💾 GUARDAR EN RANKING</button>
        <button id="close-btn" style="
            padding: 15px 30px;
            background: #ff0055;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 5px;
        ">❌ CERRAR</button>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('save-score-btn').onclick = async () => {
        const gameDuration = 180; // Duración del juego en segundos
        await saveScoreToBackend(score, zombiesKilled, gameDuration);
        alert('✅ ¡Puntuación guardada en el ranking global!');
        document.body.removeChild(modal);
    };
    
    document.getElementById('close-btn').onclick = () => {
        document.body.removeChild(modal);
    };
}


//Pagina Principal del juego

async function main() {
  const [groundTiles, unitTiles] = await loadImageAssets();
  const unitSheet = getUnitSheet(unitTiles);
  let { canvas } = init();
  const textCanvas = document.getElementById('t') as HTMLCanvasElement;
  const TILE_SIZE = 16;
  const tileset = getTileSet(TILE_SIZE, groundTiles, colorMap);
  
  
  //iniciar el juego corre por tu vida inicio fase 1 
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
  //inicio del el mapa 
  //inicio del jugador o player
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
  // reproducir musica();
  
  
  
  //configuracion del mapa
  const worldMap = getWorldMap(tilemap, player, canvas);
  const treeTops = getTreeTops(tilemap, player, canvas);
  


  let zombieTimer = 0;
  
  let loop = GameLoop({  // crear el Inicio del juego el ciclo loop
    update: function(dt) { // actualizar el juego

    //entidades de ataque
      if(gameState.s === 0 || gameState.s === 2 || gameState.s === 3){
        zombies.forEach((zombie) => {
          zombie.health = 0;
        });
        aoeTargets.splice(0,1);
        if(isSpacePressed() && player.cooldowns[3] === 0){
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
  
        // input del jugador Disparos y Movilidad 
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
        //Daño AOE del Jugador 
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

        
  //Seccion 2 efectos del jugador 

        player.setBoundingObstacles(getFilteredObstacles(tilemap.obstacles, player.getExtendedBounds(TILE_SIZE), TILE_SIZE));
        
        player.reduceSpeedIfTakingDamage();
        player.update(dt);
        player.moveUnit(dt);
        player.setAnimation();
        
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
          aoeTargets.splice(0,1);
          zombieTimer = 0;
          zombies.forEach((zombie) => {
            zombie.health = 0;
          });
          gameState.setState(2);
          
          // ===== GUARDAR PUNTUACIÓN AL TERMINAR =====
          showGameOverModal(player.score, zombiesKilled);
        }
        player.score += zombiesKilled * 10 * (1 + zombiesKilled * 0.5);
        player.reset();
      }
      player.updateCooldowns(dt);
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
     // Empezar el Juego
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




