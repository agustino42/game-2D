import { Sprite } from "kontra";
import { colorMap } from "./Presets";
import { GameState } from "./GameState";

export function getUI(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    w: gameState.canvas.width,
    h: 20,
    tC: gameState.context,
    s: gameState.sc,
    p: gameState.p,
    gameState: gameState,
    render: function(this: Sprite) {
      this.drawTopBar();
      this.drawRectangle(1, 2, 60);
      this.drawHealthBar();
      this.drawRectangle(65, 2, 44);
      for(let i = 0; i < this.p.cooldowns.length - 3; i++){
        this.drawRectangle(67 + 14 * i, 4, 12, 12);
        if(i === 0){
          this.drawGingerShotIcon(73 + 14 * i, 10);
        } 
        
        if(i === 1) this.drawVitamineCBombIcon(73 + 14 * i, 10);
        if(i === 2) this.drawLavenderCloudIcon(73 + 14 * i, 10);
        if(this.p.cooldowns[i] > 0){
          this.drawCooldownOverlay(67 + 14 * i, 2);
          this.drawCooldownText(73 + 14 * i, 10, i)
        }
      }
      //draw a rectangle in the middle of the top bar
      this.drawRectangle(this.w / 2 / this.s - 15, 2, 30);
      this.drawTimerText(this.w / 2, 10);
      this.drawRectangle(this.w / this.s - 26 * this.s, 2, 26 * this.s);
      this.drawScoreText(this.w / this.s - 13 * this.s, 10);
    },
    drawTopBar(this: Sprite) {
      this.context.fillStyle = "#000";
      this.context.fillRect(0, 0, this.w, this.h);
      
    },
    drawRectangle(this: Sprite, x: number, y: number, width: number, height: number = 16) {
      this.tC.strokeStyle=colorMap.uW;
      this.tC.lineWidth = 1 * this.s;
      this.tC.strokeRect(x * this.s, y * this.s, width * this.s, height *this.s);
    },
    drawHealthBar(this: Sprite) {
      let health = this.p.health > 0 ? this.p.health : 0;
      let initialHealth = this.p.maxHealth;
      if(health / initialHealth < 0.25){
        this.tC.fillStyle = colorMap.uR;
      } else if(health / initialHealth < 0.50){
        this.tC.fillStyle = colorMap.uO;
      } else if(health / initialHealth < 0.75){
        this.tC.fillStyle = colorMap.uY;
      } else { 
        this.tC.fillStyle = colorMap.uG;
      }
      this.tC.fillRect(3 * this.s, 4 * this.s, Math.floor(56 * (health / initialHealth) * this.s), (this.h - 8) * this.s);
    },
    drawGingerShotIcon(this: Sprite, x: number, y: number) {
      //its a circle with uiYellow, it goes into the first slot
      this.context.fillStyle = colorMap.uY;
      this.context.beginPath();
      this.context.arc(x, y, 3, 0, 2 * Math.PI);
      this.context.fill();
    },

    drawVitamineCBombIcon(this: Sprite, x: number, y: number) {
      // its like a T but with a second line 1 third from the bottom
      this.context.fillStyle = colorMap.uY;
      this.context.fillRect(x - 1, y - 3, 2, 6);
      this.context.fillRect(x - 3, y - 3, 6, 2);
      this.context.fillRect(x - 2, y - 1, 4, 1);
    },

    drawLavenderCloudIcon(this: Sprite, x: number, y: number) {
      // its a purple cloud, colorMap.uiPurple
      this.context.fillStyle = colorMap.uP;
      this.context.beginPath();
      this.context.arc(x, y, 2, 0, 2 * Math.PI);
      this.context.fill();
      this.context.beginPath();
      this.context.arc(x + 2, y, 2, 0, 2 * Math.PI);
      this.context.fill();
      this.context.beginPath();
      this.context.arc(x - 2, y, 2, 0, 2 * Math.PI);
      this.context.fill();
      this.context.beginPath();
      this.context.arc(x, y + 2, 2, 0, 2 * Math.PI);
      this.context.fill();
      this.context.beginPath();
      this.context.arc(x, y - 2, 2, 0, 2 * Math.PI);
      this.context.fill();
    },

    drawCooldownOverlay(this: Sprite, x: number, y: number) {
      //colormap.uiCooldownOverlay, a square that goes over the icon
      this.context.fillStyle = colorMap.uCd;
      this.context.fillRect(x, y, 12, 12);
    },

    drawCooldownText(this: Sprite, x: number, y: number, cooldown: number) {
      //colormap.uiWhite, text that goes over the icon
      this.tC.fillStyle = colorMap.uW;
      this.tC.font = `bold ${8 * this.s}px Impact`;
      this.tC.textAlign = "center";
      this.tC.textBaseline = "middle";
      this.tC.fillText(`${Math.ceil(this.p.cooldowns[cooldown])}`, x * this.s, y * this.s);
    }, 

    drawTimerText(this: Sprite, x: number, y: number) {
      this.tC.fillStyle = colorMap.uW;
      this.tC.font = `bold ${8 * this.s}px Impact`;
      this.tC.textAlign = "center";
      this.tC.textBaseline = "middle";
      this.tC.fillText(`${this.gameState.getTimerText()}`, x, y * this.s);
    },

    drawScoreText(this: Sprite, x: number, y: number) {
      this.tC.fillStyle = colorMap.uW;
      this.tC.font = `bold ${8 * this.s}px Impact`;
      this.tC.textAlign = "center";
      this.tC.textBaseline = "middle";
      this.tC.fillText(`${this.gameState.getScoreText()}`, x * this.s, y * this.s);
    }
      })
}

export function getStartScreen(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    canvas: gameState.canvas,
    tC: gameState.context,
    s: gameState.sc,
    gameState: gameState,
    update: function(this: Sprite) {
      gameState.p.playAnimation('splash');
      gameState.p.setScale(-0.7 * this.s, 0.7 * this.s);
      gameState.p.x = this.canvas.width / 2.1 / this.s;
      gameState.p.y = this.canvas.height / 1.4 / this.s;
      gameState.zombies[0].playAnimation('zS1');
      gameState.zombies[0].setScale(-0.6 * this.s, 0.6 * this.s);
      gameState.zombies[0].x = this.canvas.width / 1.7 / this.s;
      gameState.zombies[0].y = this.canvas.height / 1.42 / this.s;
      gameState.zombies[1].playAnimation('zS2');
      gameState.zombies[1].setScale(0.5 * this.s, 0.5 * this.s);
      gameState.zombies[1].x = this.canvas.width / 2.7 / this.s;
      gameState.zombies[1].y = this.canvas.height / 1.45 / this.s;

      gameState.trees[0].setScale(0.5 * this.s, 0.5 * this.s);
      gameState.trees[0].x = this.canvas.width / 1.6 / this.s;
      gameState.trees[0].y = this.canvas.height / 1.7 / this.s;
      gameState.trees[1].setScale(0.36 * this.s, 0.36 * this.s);
      gameState.trees[1].x = this.canvas.width / 2.7 / this.s;
      gameState.trees[1].y = this.canvas.height / 1.7 / this.s;
    },
    render: function(this: Sprite) {
      this.context.fillStyle = "#000";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.tC.fillStyle = colorMap.uW;
      this.tC.font = `bold ${20 * this.s}px Impact`;
      this.tC.textAlign = "center";
      this.tC.textBaseline = "middle";
      this.tC.fillText("To Health With You!", this.canvas.width / 2, this.canvas.height / 4);
      this.tC.font = `bold ${8 * this.s}px Impact`;
      this.tC.fillText("Press space to start", this.canvas.width / 2, this.canvas.height / 2.7);
      gameState.trees[0].render();
      gameState.trees[1].render();
      gameState.zombies[0].render();
      gameState.zombies[1].render();
      gameState.p.render();
      

    }
  });
}

export function getGameOverScreen(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    canvas: gameState.canvas,
    tC: gameState.context,
    scale: gameState.sc,
    p: gameState.p,
    render: function(this: Sprite) {
      this.tC.fillStyle = "#000";
      this.tC.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.tC.fillStyle = colorMap.uW;
      this.tC.font = `bold ${15 * this.scale}px Impact`;
      this.tC.textAlign = "center";
      this.tC.textBaseline = "middle";
      this.tC.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 3);
      this.tC.font = `bold ${10 * this.scale}px Impact`;
      this.tC.fillText(`Your ${gameState.getScoreText()}`, this.canvas.width / 2, this.canvas.height / 2.2);
      this.tC.fillText("Press space to try again", this.canvas.width / 2, this.canvas.height / 1.8);
    }
  });
}

export function getEndScreen(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    canvas: gameState.canvas,
    tC: gameState.context,
    s: gameState.sc,
    p: gameState.p,
    render: function(this: Sprite) {
      this.tC.fillStyle = "#000";
      this.tC.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.tC.fillStyle = colorMap.uW;
      this.tC.font = `bold ${15 * this.s}px Impact`;
      this.tC.textAlign = "center";
      this.tC.textBaseline = "middle";
      this.tC.fillText("Congratulations! You made it!", this.canvas.width / 2, this.canvas.height / 3);
      this.tC.font = `bold ${10 * this.s}px Impact`;
      this.tC.fillText(`Your score: ${this.p.score}`, this.canvas.width / 2, this.canvas.height / 2.2);
      this.tC.fillText("Press space to play again", this.canvas.width / 2, this.canvas.height / 1.8);
    }
  });
}