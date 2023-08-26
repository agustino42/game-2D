import perlin from './Perlin/PerlinNoise.js';
import Tileset from './Tileset.js';
import { TerrainMap} from './Interfaces.js';


export default class Tilemap {
    width: number;
    height: number;
    tileset: Tileset;
    offscreenCanvas: OffscreenCanvas;
    offscreenCtx: OffscreenCanvasRenderingContext2D | null;
    obstacles: [number, number][] = [];

    constructor(width: number, height: number, tileset: Tileset) {
        this.width = width;
        this.height = height;
        this.tileset = tileset; // This should be an instance of your Tileset class.
        this.offscreenCanvas = new OffscreenCanvas(width, height);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    generateMap(perm: number[]): Promise<number>  {
        return new Promise((resolve, reject) => {
            if(!this.offscreenCtx) return reject('No context provided.');
            const numberOfTilesX = Math.floor(this.width / this.tileset.tileSize);
            const numberOfTilesY = Math.floor(this.height / this.tileset.tileSize);

            const SCALE = 0.1;

            for (let y = 0; y < numberOfTilesY; y++) {
                for (let x = 0; x < numberOfTilesX; x++) {
                    let perlinValue = (perlin(x * SCALE, y * SCALE, perm) + 1) / 2;
                    let tileType: keyof TerrainMap;
                    if (perlinValue < 0.35) {
                        tileType = 'water';
                        this.obstacles.push([x * this.tileset.tileSize, y * this.tileset.tileSize]);
                    } else if (perlinValue < 0.45) {
                        tileType = 'sand';
                    } else if (perlinValue < 0.6) {
                        tileType = 'grass';
                    } else {
                        tileType = 'rock';
                        this.obstacles.push([x * this.tileset.tileSize, y * this.tileset.tileSize]);
                    }
                    this.tileset.drawTile(this.offscreenCtx, tileType, x, y);
                }
            }
            this.offscreenCtx.fillStyle = '#0000ff99';
            this.offscreenCtx.fillRect(this.width/2 - this.tileset.tileSize/2, this.height/2 - this.tileset.tileSize/2, this.tileset.tileSize, this.tileset.tileSize);
            console.log('Map generated.');
            return resolve(1);
        });
    }

    getMapSection(x: number, y: number, width: number, height: number): ImageData {
        if(!this.offscreenCtx) throw new Error('No context provided.');
        return this.offscreenCtx.getImageData(x, y, width, height);
    }
}