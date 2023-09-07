import { Sprite } from "kontra";
import { getGameOverScreen, getStartScreen, getEndScreen, getUI } from "./UIElements";

export class GameState {
    lt: number;
    tp: number;
    s: number;
    p: Sprite;
    uiItems: Sprite[];
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    sc: number;
    winner: boolean;
    zombies: Sprite[];
    trees: Sprite[];
    
    constructor(levelTime: number, player: Sprite, canvas: HTMLCanvasElement, scale: number, zombies: Sprite[], trees: Sprite[]) {
        this.lt = levelTime;
        this.tp = 0;
        this.s = 0;
        this.p = player;
        this.uiItems = [];
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.sc = scale;
        this.winner = false;
        this.zombies = zombies;
        this.trees = trees;
    }

    update(dt: number) {
        if(this.s === 1){
            this.tp += dt;
            if(this.tp >= this.lt){
                if(!this.winner){
                    this.p.score *= 2;
                    this.winner = true;
                } 
                this.setState(3);
            }
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
        let timeLeft = Math.floor(this.lt - this.tp);
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft - minutes * 60;
        let secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${secondsString}`;
    }
    getScoreText(this: GameState) {
        let scoreString = this.p.score.toString();
        while(scoreString.length < 6){
            scoreString = "0" + scoreString;
        }
        return `Score: ${scoreString}`;
    }
    setState(this: GameState, state: number){
        if(this.context === null) return;
        this.s = state;
        this.uiItems = [];
        this.canvas.height = this.canvas.width * 0.75;
        switch(state){
            case 1:
                this.canvas.height = 80;
                this.tp = 0;
                this.p.resetLevel();
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
        if(this.s === 1){
            this.uiItems.push(getUI(this));
        }
    }

}