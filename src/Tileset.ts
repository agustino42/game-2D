import { TerrainMap } from './Interfaces';

export default class Tileset {
    tileSize: number;
    tileSheet: HTMLImageElement;
    tiles: TerrainMap;
    actualTileSize: number;

    constructor(tileSize: number, tileSheet: HTMLImageElement, tiles: TerrainMap) {
        this.tileSize = tileSize; // The size of a single tile
        this.tileSheet = tileSheet; // The tilesheet image
        this.tiles = tiles; // An object containing tile data
        this.actualTileSize = 16;
    }

    // Method to draw a specific tile to a specific position
    drawTile(ctx: OffscreenCanvasRenderingContext2D | null, secondCtx: OffscreenCanvasRenderingContext2D | null, tileName: keyof TerrainMap, x: number, y: number, rotation: number = 0) {
        if(!ctx) return;
        const tile = this.tiles[tileName];
        if (tile) {
            if(tile.background) {
                ctx.fillStyle = tile.background;
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
            if(tile.x !== undefined && tile.y !== undefined){
                const sx = tile.x * this.tileSize;
                const sy = tile.y * this.tileSize;
                if(rotation !== 0) this.drawRotatedTile(ctx, {x: tile.x, y: tile.y}, x, y, rotation);
                else {
                    if(tileName === 't'){
                        let xr: number = 1;
                        let yr: number = 1;
                           ctx.drawImage(this.tileSheet, 16 * 3, 19, this.tileSize * 2, 13, (x-xr) * this.tileSize + this.tileSize / 2, (y-yr) * this.tileSize + 19, this.tileSize * 2, 13);
                        secondCtx?.drawImage(this.tileSheet, 16 * 3, 0, 32, 19, (x-xr) * this.tileSize + this.tileSize / 2, (y-yr) * this.tileSize, 32, 19);
                    } else
                        ctx.drawImage(this.tileSheet, sx, sy, this.tileSize, this.tileSize, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }

    drawRotatedTile(ctx: OffscreenCanvasRenderingContext2D | null, tile: {x: number, y: number}, x: number, y: number, rotation: number = 0) {
        if(!ctx) return console.error('No context provided.');
        const destX = x * this.actualTileSize;
        const destY = y * this.actualTileSize;
        const srcX = tile.x * this.actualTileSize;
        const srcY = tile.y * this.actualTileSize;

        ctx.save();  // Sparar nuvarande canvas-state
        ctx.translate(destX + this.actualTileSize / 2, destY + this.actualTileSize / 2);  // Flyttar origin till tilens mittpunkt
        ctx.rotate((rotation * Math.PI) / 180);  // Roterar ctxen 90 grader
        ctx.drawImage(
        this.tileSheet,
        srcX, srcY, this.actualTileSize, this.actualTileSize,  // Käll-koordinater och dimensioner
        -this.actualTileSize / 2, -this.actualTileSize / 2, this.actualTileSize, this.actualTileSize  // Destination-koordinater och dimensioner
        );
        ctx.restore();  // Återställer canvas-state
    }

}
