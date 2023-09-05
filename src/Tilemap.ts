import perlin from './Perlin/PerlinNoise.js';
import Tileset from './Tileset.js';
import { TerrainMap, Position, GridElement, RotatingPosition } from './Interfaces.js';
import { Sprite } from 'kontra';

export default class Tilemap {
    width: number;
    height: number;
    tileset: Tileset;
    offscreenCanvas: OffscreenCanvas;
    offscreenCtx: OffscreenCanvasRenderingContext2D | null;
    secondOffscreenCanvas: OffscreenCanvas;
    secondOffscreenCtx: OffscreenCanvasRenderingContext2D | null;
    shorelines: {x: number, y: number}[];
    obstacles: Position[];
    trees: Sprite[];
    mapGrid: GridElement[][];
    directions: string[];

    constructor(width: number, height: number, tileset: Tileset) {
        this.width = width;
        this.height = height;
        this.tileset = tileset; // This should be an instance of your Tileset class.
        this.offscreenCanvas = new OffscreenCanvas(width, height);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
        if(this.offscreenCtx) this.offscreenCtx.imageSmoothingEnabled = false;
        this.secondOffscreenCanvas = new OffscreenCanvas(width, height);
        this.secondOffscreenCtx = this.secondOffscreenCanvas.getContext('2d', { willReadFrequently: true });
        if(this.secondOffscreenCtx) this.secondOffscreenCtx.imageSmoothingEnabled = false;
        this.mapGrid = [];
        this.directions = ['N', 'E', 'S', 'W'];
        this.shorelines = [];
        this.obstacles = [];
        this.trees = [];
    }

    generateMap(perm: number[], islandFactorConstant: number): Promise<Tilemap>  {
        return new Promise((resolve, reject) => {
            if(!this.offscreenCtx) return reject('No context provided.');

            const numberOfTilesX = Math.floor(this.width / this.tileset.tileSize);
            const numberOfTilesY = Math.floor(this.height / this.tileset.tileSize);

            const SCALE = 0.1;

            for (let y = 0; y < numberOfTilesY; y++) {
                this.mapGrid[y] = [];
                for (let x = 0; x < numberOfTilesX; x++) {
                    let perlinValue = (perlin(x * SCALE, y * SCALE, perm) + 1) / 2;
                    // Calculate distance to center of map
                    const dx = x - numberOfTilesX / 2;
                    const dy = y - numberOfTilesY / 2;
                    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

                    // Adjust Perlin value based on distance to center
                    const maxDistance = Math.sqrt(Math.pow(numberOfTilesX / 2, 2) + Math.pow(numberOfTilesY / 2, 2));
                    const islandFactor = distanceToCenter / maxDistance;
                    perlinValue = perlinValue - (islandFactor * islandFactorConstant);
                    if (perlinValue < 0.32) {
                        this.mapGrid[y][x] = { x: x, y: y, type: 'wv'};
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'w', x, y);
                        // tileType = 'w';
                    } else if (perlinValue < 0.45) {
                        this.mapGrid[y][x] = { x: x, y: y, type: 's'};
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 's', x, y);
                        // tileType = Math.random() > 0.7 ? 'sandRocks' : 's';
                    } else if (perlinValue < 0.6) {
                        this.mapGrid[y][x] = { x: x, y: y, type: 'g'};
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'g', x, y);
                        // tileType = Math.random() > 0.7 ? 'grassFlowers' : 'g';
                    } else {
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'g', x, y);
                        this.mapGrid[y][x] = { x: x, y: y, type: 't'};
                        // tileType = 't';
                        // Additional trees for density
                        
                    }
                    // this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, tileType, x, y);
                }
            }
            
            this.cSDP();
            this.cSTP();
            this.nWTT();
            this.cCM();
            this.rST();
            this.cSDP();
            this.rST();
            const { cornerOuter, cornerInner, border, grass } = this.fTP(this.mapGrid);
            cornerOuter.forEach((corner) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'oC', corner.x, corner.y, corner.rotation);

                    
            });
            cornerInner.forEach((corner) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'iC', corner.x, corner.y, corner.rotation);
            });
            border.forEach((border) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'b', border.x, border.y, border.rotation);

            });
            grass.forEach((grass) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, Math.random() > 0.7 ? 'f' : 'g', grass.x, grass.y);
            });
            this.mapGrid.forEach((row) => {
                row.forEach((tile) => {
                    if(tile.type === 't') this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, tile.type, tile.x, tile.y);
                    if(tile.type === 'wv' && Math.random() > 0.90 && !this.shorelines.find(point => point.x === tile.x && point.y === tile.y)) this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'wv', tile.x, tile.y);
                    if(tile.type === 's'){
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, tile.type, tile.x, tile.y);
                        if(Math.random() > 0.9) this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'r', tile.x, tile.y);
                    } 
                        
                });
            });
            for(let y = 0; y < this.mapGrid.length; y++){
                for(let x = 0; x < this.mapGrid[0].length; x++){
                    const current = this.mapGrid[y][x];
                    if(current.type === 'wv')
                        this.obstacles.push({x: x * this.tileset.tileSize, y: y * this.tileset.tileSize});
                    if(current.type === 't'){
                        this.obstacles.push({x: x * this.tileset.tileSize, y: y * this.tileset.tileSize});
                        this.trees.push(Sprite({gx: x * this.tileset.tileSize + this.tileset.tileSize / 2,
                                                gy: y * this.tileset.tileSize + this.tileset.tileSize / 2, 
                                                radius: this.tileset.tileSize / 2, 
                                                takeDamage(this: Sprite, damage: number){return damage},
                                                getBounds(): {left: number, right: number, top: number, bottom: number} {
                                                    return {
                                                        left: this.gx - this.radius,
                                                        right: this.gx + this.radius,
                                                        top: this.gy - this.radius,
                                                        bottom: this.gy + this.radius
                                                    };
                                                }}));
                    }
                }
            }
            return resolve(this);
        });
    }
    cCM(){
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                const corners = this.cD(x, y, this.mapGrid, current.type);
                if(corners.length == 2){
                    corners.forEach((corner) => {
                        switch (corner) {
                            case 'NW':
                                if(this.cCS(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'g' ? 's' : 'g';
                                break;
                            case 'NE':
                                if(this.cCS(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'g' ? 's' : 'g';
                                break;
                            case 'SE':
                                if(this.cCS(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'g' ? 's' : 'g';
                                break;
                            case 'SW':
                                if(this.cCS(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'g' ? 's' : 'g';
                                break;
                            default:
                                break;
                        }
                    });
                }
            }
        }
    }
    cCS(x: number, y: number, direction: string, targetType: keyof TerrainMap): boolean {
        let tilesToCheck: [number, number][] = [];
        switch (direction) {
            case 'NW':
                tilesToCheck.push([x - 1, y]);
                tilesToCheck.push([x, y - 1]);
                tilesToCheck.push([x + 1, y - 1]);
                tilesToCheck.push([x + 1, y]);
                break;
            case 'NE':
                tilesToCheck.push([x - 1, y - 1]);
                tilesToCheck.push([x, y - 1]);
                tilesToCheck.push([x + 1, y]);
                tilesToCheck.push([x + 1, y + 1]);
                break;
            case 'SE':
                tilesToCheck.push([x + 1, y - 1]);
                tilesToCheck.push([x + 1, y]);
                tilesToCheck.push([x, y + 1]);
                tilesToCheck.push([x - 1, y + 1]);
                break;
            case 'SW':
                tilesToCheck.push([x + 1, y + 1]);
                tilesToCheck.push([x + 1, y]);
                tilesToCheck.push([x - 1, y]);
                tilesToCheck.push([x - 1, y - 1]);
                break;
            default:
                break;
        }
        for(let i = 0; i < tilesToCheck.length; i++){
            if(this.mapGrid[tilesToCheck[i][1]]?.[tilesToCheck[i][0]]?.type === targetType) return false;
        }
        return true;
    }

    cA(x: number, y: number, grid: GridElement[][], targetType: string): string[] {
        const directions: string[] = [];
        // Nord
        if (grid[y][x - 1]?.type === targetType) directions.push('N');
        
        // Syd
        if (grid[y][x + 1]?.type === targetType) directions.push('S');
        
        // Öst
        if (grid[y + 1]?.[x].type === targetType) directions.push('E');
        
        // Väst
        if (grid[y - 1]?.[x].type === targetType) directions.push('W');

        return directions;
    }

    cD(x: number, y: number, grid: GridElement[][], targetType: string): string[]{
        const directions: string[] = [];
        
        // Nord-Öst
        if (grid[y + 1]?.[x - 1]?.type === targetType) directions.push('NE');
        
        // Nord-Väst
        if (grid[y - 1]?.[x - 1]?.type === targetType) directions.push('NW');
        
        // Syd-Öst
        if (grid[y + 1]?.[x + 1]?.type === targetType) directions.push('SE');
        
        // Syd-Väst
        if (grid[y - 1]?.[x + 1]?.type === targetType) directions.push('SW');
      
        return directions;
      }

    fTP(grid: GridElement[][]): { cornerOuter: RotatingPosition[], cornerInner: RotatingPosition[], border: RotatingPosition[], grass: RotatingPosition[] } {
        const cornerOuter: RotatingPosition[] = [];
        const cornerInner: RotatingPosition[] = [];
        const border: RotatingPosition[] = [];
        const grass: RotatingPosition[] = [];
        
        const gridSizeY = grid.length;
        const gridSizeX = grid[0].length;
        
        for (let y = 0; y < gridSizeY; y++) {
            for (let x = 0; x < gridSizeX; x++) {
                const current = grid[y][x];
                if (current.type === 'g' || current.type === 'wv') {
                    const adjacent = this.cA(x, y, grid, 's');
                    const diagonal = this.cD(x, y, grid, 's');
            
                    let rotation = 0;
            
                    if (diagonal.length === 1 && adjacent.length === 0) {
                        if(current.type === 'wv') this.sWTSL(x, y);
                        // CornerInner
                        switch (diagonal[0]) {
                            case 'NE': rotation = 0; break;
                            case 'NW': rotation = 90; break;
                            case 'SW': rotation = 180; break;
                            case 'SE': rotation = 270; break;
                        }
                        cornerInner.push({ x, y, rotation });
                    } else if (diagonal.length > 0 && adjacent.length === 2) {
                        if(current.type === 'wv') this.sWTSL(x, y);
                    // CornerOuter
                        if (adjacent.includes('N') && adjacent.includes('E') && diagonal.includes('NE')) {
                            rotation = 0;
                        } else if (adjacent.includes('N') && adjacent.includes('W') && diagonal.includes('NW')) {
                            rotation = 90;
                        } else if (adjacent.includes('S') && adjacent.includes('W') && diagonal.includes('SW')) {
                            rotation = 180;
                        } else if (adjacent.includes('S') && adjacent.includes('E') && diagonal.includes('SE')) {
                            rotation = 270;
                        }
                        cornerOuter.push({ x, y, rotation });
                    } else if (adjacent.length > 0) {
                        if(current.type === 'wv') this.sWTSL(x, y);
                        // Border
                        if (adjacent.includes('N')) rotation = 0;
                        else if (adjacent.includes('E')) rotation = 270;
                        else if (adjacent.includes('S')) rotation = 180;
                        else if (adjacent.includes('W')) rotation = 90;
                    
                        border.push({ x, y, rotation });
                    } else {
                        // Grass
                        rotation = 0;
                        if(current.type !== 'wv') grass.push({ x, y, rotation });
                    }
                }
            }
        }
        
        return { cornerOuter, cornerInner, border, grass };
    }

    sWTSL(x: number, y: number): void {
        this.shorelines.push({x: x, y: y});
    }


    rST(): void {
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'g' || current.type === 's' || current.type === 'wv'){
                    this.directions.forEach((direction) => {
                        if(this.cISPT(x, y, current.type, direction)) this.mapGrid[y][x].type = (current.type === 'g' || current.type === 'wv') ? 's' : 'g';
                    });
                }
            }
        }
    }

    nWTT(): void {
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'g' || current.type === 's'){
                    if(this.cNB(x, y, current.type)) this.mapGrid[y][x].type = current.type === 'g' ? 's' : 'g';
                }
            }
        }
    }
    cNB(x: number, y: number, type: keyof TerrainMap): boolean {
        const checkFor = type === 'g' ? 'wv' : 't';
        const adjacent = this.cA(x, y, this.mapGrid, checkFor);
        const diagonal = this.cD(x, y, this.mapGrid, checkFor);
        if(adjacent.length > 0 || diagonal.length > 0) return true;
        return false;

    }

    cSTP(): void {
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'g' || current.type === 'wv'){
                    const adjacent = this.cA(x, y, this.mapGrid, current.type);
                    if(adjacent.length === 2){
                        if(adjacent.includes('N') && adjacent.includes('S')) this.mapGrid[y][x].type = 's';
                        if(adjacent.includes('E') && adjacent.includes('W')) this.mapGrid[y][x].type = 's';
                    }
                }
            }
        }
    }

    cSDP(): void{
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'g' || current.type === 'wv'){
                    const grassCorners = this.cD(x, y, this.mapGrid, current.type);
                    const sandCorners = this.cD(x, y, this.mapGrid, 's');
                    if(grassCorners.length === 2){
                        if(grassCorners.includes('NE') && grassCorners.includes('SW')){
                            if(sandCorners.includes('NW') && sandCorners.includes('SE')){
                                this.mapGrid[y][x].type = 's';
                            }
                        }else if(grassCorners.includes('NW') && grassCorners.includes('SE')){
                            if(sandCorners.includes('NE') && sandCorners.includes('SW')){
                                this.mapGrid[y][x].type = 's';
                            }
                        }
                    }
                }
            }
        }
    }
                        
    cISPT(x: number, y:number, targetType: string, direction: string): boolean {
        const tilesToCheck: [number, number][] = [];
        switch (direction) {
            case 'N':
                tilesToCheck.push([x - 1, y]);
                tilesToCheck.push([x - 1, y - 1]);
                tilesToCheck.push([x, y - 1]);
                tilesToCheck.push([x + 1, y - 1]);
                tilesToCheck.push([x + 1, y]);
                break;
            case 'E':
                tilesToCheck.push([x, y - 1]);
                tilesToCheck.push([x + 1, y - 1]);
                tilesToCheck.push([x + 1, y]);
                tilesToCheck.push([x + 1, y + 1]);
                tilesToCheck.push([x, y + 1]);
                break;
            case 'S':
                tilesToCheck.push([x - 1, y]);
                tilesToCheck.push([x - 1, y + 1]);
                tilesToCheck.push([x, y + 1]);
                tilesToCheck.push([x + 1, y + 1]);
                tilesToCheck.push([x + 1, y]);
                break;
            case 'W':
                tilesToCheck.push([x, y - 1]);
                tilesToCheck.push([x - 1, y - 1]);
                tilesToCheck.push([x - 1, y]);
                tilesToCheck.push([x - 1, y + 1]);
                tilesToCheck.push([x, y + 1]);
                break;
            default:
                break;
        }
        for(let i = 0; i < tilesToCheck.length; i++){
            if(this.mapGrid[tilesToCheck[i][1]]?.[tilesToCheck[i][0]]?.type === targetType) return false;
        }
        return true;
    }

    getMapSection(x: number, y: number, width: number, height: number): ImageData {
        if(!this.offscreenCtx) throw new Error('No context provided.');
        return this.offscreenCtx.getImageData(x, y, width, height);
    }

    getWorldMap(): ImageData {
        if(!this.offscreenCtx) throw new Error('No context provided.');
        return this.offscreenCtx.getImageData(0, 0, this.width, this.height);
    }

    getTreeTops(): ImageData {
        if(!this.secondOffscreenCtx) throw new Error('No context provided.');
        return this.secondOffscreenCtx.getImageData(0, 0, this.width, this.height);
    }
}