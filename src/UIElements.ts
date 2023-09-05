import { Sprite } from "kontra";
import { colorMap } from "./Presets";
import { GameState } from "./GameState";

export function getUI(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    width: gameState.canvas.width,
    height: 20,
    textContext: gameState.context,
    scale: gameState.scale,
    player: gameState.player,
    gameState: gameState,
    render: function(this: Sprite) {
      this.drawTopBar();
      this.drawRectangle(1, 2, 60);
      this.drawHealthBar();
      this.drawRectangle(65, 2, 44);
      for(let i = 0; i < this.player.cooldowns.length - 3; i++){
        this.drawRectangle(67 + 14 * i, 4, 12, 12);
        if(i === 0){
          this.drawGingerShotIcon(73 + 14 * i, 10);
        } 
        
        if(i === 1) this.drawVitamineCBombIcon(73 + 14 * i, 10);
        if(i === 2) this.drawLavenderCloudIcon(73 + 14 * i, 10);
        if(this.player.cooldowns[i] > 0){
          this.drawCooldownOverlay(67 + 14 * i, 2);
          this.drawCooldownText(73 + 14 * i, 10, i)
        }
      }
      //draw a rectangle in the middle of the top bar
      this.drawRectangle(this.width / 2 / this.scale - 15, 2, 30);
      this.drawTimerText(this.width / 2, 10);
      this.drawRectangle(this.width / this.scale - 26 * this.scale, 2, 26 * this.scale);
      this.drawScoreText(this.width / this.scale - 13 * this.scale, 10);
    },
    drawTopBar(this: Sprite) {
      this.context.fillStyle = "#000";
      this.context.fillRect(0, 0, this.width, this.height);
      
    },
    drawRectangle(this: Sprite, x: number, y: number, width: number, height: number = 16) {
      this.textContext.strokeStyle=colorMap.uW;
      this.textContext.lineWidth = 1 * this.scale;
      this.textContext.strokeRect(x * this.scale, y * this.scale, width * this.scale, height *this.scale);
    },
    drawHealthBar(this: Sprite) {
      let health = this.player.health > 0 ? this.player.health : 0;
      let initialHealth = this.player.maxHealth;
      if(health / initialHealth < 0.25){
        this.textContext.fillStyle = colorMap.uR;
      } else if(health / initialHealth < 0.50){
        this.textContext.fillStyle = colorMap.uO;
      } else if(health / initialHealth < 0.75){
        this.textContext.fillStyle = colorMap.uY;
      } else { 
        this.textContext.fillStyle = colorMap.uG;
      }
      this.textContext.fillRect(3 * this.scale, 4 * this.scale, Math.floor(56 * (health / initialHealth) * this.scale), (this.height - 8) * this.scale);
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
      this.textContext.fillStyle = colorMap.uW;
      this.textContext.font = `bold ${8 * this.scale}px Impact`;
      this.textContext.textAlign = "center";
      this.textContext.textBaseline = "middle";
      this.textContext.fillText(`${Math.ceil(this.player.cooldowns[cooldown])}`, x * this.scale, y * this.scale);
    }, 

    drawTimerText(this: Sprite, x: number, y: number) {
      this.textContext.fillStyle = colorMap.uW;
      this.textContext.font = `bold ${8 * this.scale}px Impact`;
      this.textContext.textAlign = "center";
      this.textContext.textBaseline = "middle";
      this.textContext.fillText(`${this.gameState.getTimerText()}`, x, y * this.scale);
    },

    drawScoreText(this: Sprite, x: number, y: number) {
      this.textContext.fillStyle = colorMap.uW;
      this.textContext.font = `bold ${8 * this.scale}px Impact`;
      this.textContext.textAlign = "center";
      this.textContext.textBaseline = "middle";
      this.textContext.fillText(`${this.gameState.getScoreText()}`, x * this.scale, y * this.scale);
    }
      })
}

export function getStartScreen(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    canvas: gameState.canvas,
    textContext: gameState.context,
    scale: gameState.scale,
    render: function(this: Sprite) {
      this.textContext.fillStyle = "#000";
      this.textContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.textContext.fillStyle = colorMap.uW;
      this.textContext.font = `bold ${15 * this.scale}px Impact`;
      this.textContext.textAlign = "center";
      this.textContext.textBaseline = "middle";
      this.textContext.fillText("To Health With You!", this.canvas.width / 2, this.canvas.height / 3);
      this.textContext.font = `bold ${10 * this.scale}px Impact`;
      this.textContext.fillText("Press space to start", this.canvas.width / 2, this.canvas.height / 2);
    }
  });
}

export function getGameOverScreen(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    canvas: gameState.canvas,
    textContext: gameState.context,
    scale: gameState.scale,
    player: gameState.player,
    render: function(this: Sprite) {
      this.textContext.fillStyle = "#000";
      this.textContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.textContext.fillStyle = colorMap.uW;
      this.textContext.font = `bold ${15 * this.scale}px Impact`;
      this.textContext.textAlign = "center";
      this.textContext.textBaseline = "middle";
      this.textContext.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 3);
      this.textContext.font = `bold ${10 * this.scale}px Impact`;
      this.textContext.fillText(`Your ${gameState.getScoreText()}`, this.canvas.width / 2, this.canvas.height / 2.2);
      this.textContext.fillText("Press space to try again", this.canvas.width / 2, this.canvas.height / 1.8);
    }
  });
}

export function getEndScreen(gameState: GameState): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    canvas: gameState.canvas,
    textContext: gameState.context,
    scale: gameState.scale,
    player: gameState.player,
    render: function(this: Sprite) {
      this.textContext.fillStyle = "#000";
      this.textContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.textContext.fillStyle = colorMap.uW;
      this.textContext.font = `bold ${15 * this.scale}px Impact`;
      this.textContext.textAlign = "center";
      this.textContext.textBaseline = "middle";
      this.textContext.fillText("Congratulations! You made it!", this.canvas.width / 2, this.canvas.height / 3);
      this.textContext.font = `bold ${10 * this.scale}px Impact`;
      this.textContext.fillText(`Your score: ${this.player.score}`, this.canvas.width / 2, this.canvas.height / 2.2);
      this.textContext.fillText("Press space to play again", this.canvas.width / 2, this.canvas.height / 1.8);
    }
  });
}