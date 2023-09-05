import { Sprite } from "kontra";
import { getGameOverScreen, getStartScreen, getEndScreen, getUI } from "./UIElements";

export class GameState {
    levelTime: number;
    timePassed: number;
    state: number;
    player: Sprite;
    uiItems: Sprite[];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    scale: number;
    
    constructor(levelTime: number, player: Sprite, canvas: HTMLCanvasElement, scale: number) {
        this.levelTime = levelTime;
        this.timePassed = 0;
        this.state = 0;
        this.player = player;
        this.uiItems = [];
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.scale = scale;
    }

    update(dt: number) {
        this.timePassed += dt;
        if(this.timePassed >= this.levelTime){
            this.player.score *= 2;
            this.setState(3);
        }
        this.uiItems.forEach(item => item.update());

    }
    renderUI(this: GameState) {
        if(!this.context) return;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i = 0; i < this.uiItems.length; i++){
            this.uiItems[i].render();
        }
    }
    getTimerText(this: GameState) {
        let timeLeft = Math.floor(this.levelTime - this.timePassed);
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft - minutes * 60;
        let secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${secondsString}`;
    }
    getScoreText(this: GameState) {
        let scoreString = this.player.score.toString();
        while(scoreString.length < 6){
            scoreString = "0" + scoreString;
        }
        return `Score: ${scoreString}`;
    }
    setState(this: GameState, state: number){
        if(this.context === null) return;
        this.state = state;
        this.uiItems = [];
        this.canvas.height = this.canvas.width * 0.75;
        switch(state){
            case 1:
                this.canvas.height = 80;
                this.timePassed = 0;
                this.player.resetLevel();
                this.uiItems.push(getUI(this));
                break;
            case 2:
                this.uiItems.push(getGameOverScreen(this));
                break;
            case 3:
                this.uiItems.push(getEndScreen(this));
                break;
            default:
                this.uiItems.push(getStartScreen(this));
                break;

        }

    }
    reloadUI(this: GameState){
        if(this.context === null) return;
        this.uiItems = [];
        if(this.state === 1){
            this.uiItems.push(getUI(this));
        }
    }

}