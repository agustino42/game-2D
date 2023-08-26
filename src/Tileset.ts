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
    drawTile(ctx: OffscreenCanvasRenderingContext2D | null, tileName: keyof TerrainMap, x: number, y: number) {
        if(!ctx) return console.error('No context provided.');
        const tile = this.tiles[tileName];
        if (tile) {
            const sx = tile.x * this.actualTileSize;
            const sy = tile.y * this.actualTileSize;
            ctx.drawImage(this.tileSheet, sx, sy, this.actualTileSize, this.actualTileSize, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        } else {
            console.error(`Tile with name ${tileName} does not exist.`);
        }
    }
}
