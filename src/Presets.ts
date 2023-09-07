import { SpriteSheet } from "kontra";
import Tileset from "./Tileset";
import { ColorMap } from "./Interfaces";

export function getUnitSheet(unitTiles: HTMLImageElement): SpriteSheet {
    return SpriteSheet({
        image: unitTiles,
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
            hurt: {
            frames: '5..6',
            frameRate: 8
            },
            splash: {
            frames: '4',
            frameRate: 0,
            loop: false
            },
            zI: {
            frames: '6..7',
            frameRate: 2
            },
            zombieWalk: {
            frames: '8..11',
            frameRate: 8
            },
            zH: {
            frames: '12..13',
            frameRate: 8
            },
            zS1: {
            frames: '10',
            frameRate: 0,
            loop: false
            },
            zS2: {
            frames: '11',
            frameRate: 0,
            loop: false
            },
        }      
      });
}

export const colorMap: ColorMap = {
        g: '#2b4432',
        w: '#374952',
        s: '#9d7e6a',
        uG: '#41772f',
        uY: '#edc06d',
        uO: '#db6136',
        uR: '#ae3b2f',
        uP: '#7f417c',
        uW: '#c8cdcc',
        uCd: '#000000dd',
    };


export function getTileSet(tileSize: number, groundTiles: HTMLImageElement, colorMap: ColorMap): Tileset {
    return new Tileset(tileSize, groundTiles, {
        'g': {background: colorMap.g },
        'w': { background: colorMap.w },
        'f': { x: 2, y: 1 },
        'iC': { x: 0, y: 0 },
        'oC': { x: 1, y: 0 },
        'b': { x: 2, y: 0 },
        's': { background: colorMap.s },
        'r': { x: 1, y: 1 },
        'wv': { x: 0, y: 1 }, 
        't': { x: 4, y: 0 },
      });
}


