import { Sprite } from "kontra";

export function getHealthBar(player: Sprite, textContext: CanvasRenderingContext2D): Sprite {
  return Sprite({
    x: 10,
    y: 20,
    width: 80,
    height: 20,
    color: 'green',
    initialHealth: player.health,
    health: player.health,
    player: player,
    textContext: textContext,
    update: function(this: Sprite) {
      this.health = this.player.health > 0 ? this.player.health : 0;
      if(this.health / this.initialHealth < 0.25){
        this.color = 'red';
      } else if(this.health / this.initialHealth < 0.50){
        this.color = 'orange';
      } else if(this.health / this.initialHealth < 0.75){
        this.color = 'yellow';
      } else { 
        this.color = 'green';
      }
    },
    render: function(this: Sprite) {
      this.context.fillStyle = this.color;
      this.context.fillRect(0, 0, this.width * (this.health / 100), this.height);
      this.roundedRect(0, 0, this.width, this.height, 3);
      this.drawHealthText();
    },
    roundedRect(this: Sprite, x: number, y: number, width: number, height: number, radius: number) {
      this.context.strokeStyle = "#000";
      this.context.lineWidth = 2;
      this.context.beginPath();
      this.context.moveTo(x + radius, y);
      this.context.lineTo(x + width - radius, y);
      this.context.arcTo(x + width, y, x + width, y + radius, radius);
      this.context.lineTo(x + width, y + height - radius);
      this.context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      this.context.lineTo(x + radius, y + height);
      this.context.arcTo(x, y + height, x, y + height - radius, radius);
      this.context.lineTo(x, y + radius);
      this.context.arcTo(x, y, x + radius, y, radius);
      this.context.closePath();
      this.context.stroke();
    },
    drawHealthText(this: Sprite) {
      this.textContext.fillStyle = "#000";
      this.textContext.font = "bold 24px Impact";
      this.textContext.fillText("Health: ", 20, 35);
    }
  });
}

export function getScoreCounter(player: Sprite, textCtx: CanvasRenderingContext2D, canvasWidth: number): Sprite {
  return Sprite({
    x: 5,
    y: 50,
    player: player,
    textContext: textCtx,
    update: function(this: Sprite) {
      this.player.score = this.player.score > 0 ? this.player.score : 0;
    },
    render: function(this: Sprite) {
      this.textContext.fillStyle = "#000";
      this.textContext.font = "bold 32px Impact";
      // this.textContext.fillText("Score: " + this.formatScore(), canvasWidth - 220, 60);
      this.textContext.fillText("X: " + Math.floor(player.gx) + " Y: " + Math.floor(player.gy),  canvasWidth - 220, 60);
    },
    formatScore(this: Sprite) {
      //format to have 0's in front so the score always is six digits
      let scoreString = this.player.score.toString();
      while(scoreString.length < 6){
        scoreString = "0" + scoreString;
      }
      return scoreString;
    }
  });
}

export function getTopBar(canvasWidth: number): Sprite {
  return Sprite({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: 50,
    color: '#07070799',
    render: function(this: Sprite) {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.x, this.y, this.width, this.height);
    }
  });
}