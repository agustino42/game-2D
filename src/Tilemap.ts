import perlin from './Perlin/PerlinNoise.js';
import Tileset from './Tileset.js';
import { TerrainMap } from './Interfaces.js';

interface GridElement {
    x: number;
    y: number;
    type: keyof TerrainMap;
}

interface Position {
    x: number;
    y: number;
    rotation: number;
}

export default class Tilemap {
    width: number;
    height: number;
    tileset: Tileset;
    offscreenCanvas: OffscreenCanvas;
    offscreenCtx: OffscreenCanvasRenderingContext2D | null;
    secondOffscreenCanvas: OffscreenCanvas;
    secondOffscreenCtx: OffscreenCanvasRenderingContext2D | null;
    shorelines: {x: number, y: number}[] = [];
    obstacles: [number, number][] = [];
    mapGrid: GridElement[][] = [];
    directions: string[] = ['N', 'E', 'S', 'W'];

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
    }

    generateMap(perm: number[], islandFactorConstant: number): Promise<boolean>  {
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
                        this.mapGrid[y][x] = { x: x, y: y, type: 'waves'};
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'water', x, y);
                        // tileType = 'water';
                    } else if (perlinValue < 0.45) {
                        this.mapGrid[y][x] = { x: x, y: y, type: 'sand'};
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'sand', x, y);
                        // tileType = Math.random() > 0.7 ? 'sandRocks' : 'sand';
                    } else if (perlinValue < 0.6) {
                        this.mapGrid[y][x] = { x: x, y: y, type: 'grass'};
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'grass', x, y);
                        // tileType = Math.random() > 0.7 ? 'grassFlowers' : 'grass';
                    } else {
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'grass', x, y);
                        this.mapGrid[y][x] = { x: x, y: y, type: 'trees'};
                        // tileType = 'trees';
                        // Additional trees for density
                        
                    }
                    // this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, tileType, x, y);
                }
            }
            
            this.checkSingleDiagonalPaths();
            this.checkSingleTilePaths();
            this.ensureNoWaterNextToGrassAndNoSandNextToTrees();
            this.checkCornerMeeting();
            this.removeSingleTiles();
            this.checkSingleDiagonalPaths();
            this.removeSingleTiles();
            const { cornerOuter, cornerInner, border, grass } = this.findTilePositions(this.mapGrid);
            cornerOuter.forEach((corner) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'outerCorner', corner.x, corner.y, corner.rotation);
                // if(this.offscreenCtx){
                //     this.offscreenCtx.fillStyle = '#729d3f55';
                //     this.offscreenCtx.fillRect(corner.x * this.tileset.tileSize, corner.y * this.tileset.tileSize, this.tileset.tileSize, this.tileset.tileSize);
                // }   
                    
            });
            cornerInner.forEach((corner) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'innerCorner', corner.x, corner.y, corner.rotation);
                // if(this.offscreenCtx){
                //     this.offscreenCtx.fillStyle = '#729d3f55';
                //     this.offscreenCtx.fillRect(corner.x * this.tileset.tileSize, corner.y * this.tileset.tileSize, this.tileset.tileSize, this.tileset.tileSize);
                // }   
            });
            border.forEach((border) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'border', border.x, border.y, border.rotation);
                // if(this.offscreenCtx){
                //     this.offscreenCtx.fillStyle = '#729d3f55';
                //     this.offscreenCtx.fillRect(border.x * this.tileset.tileSize, border.y * this.tileset.tileSize, this.tileset.tileSize, this.tileset.tileSize);
                // }   
            });
            grass.forEach((grass) => {
                this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, Math.random() > 0.7 ? 'flowers' : 'grass', grass.x, grass.y);
            });
            this.mapGrid.forEach((row) => {
                row.forEach((tile) => {
                    if(tile.type === 'trees') this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, tile.type, tile.x, tile.y);
                    if(tile.type === 'waves' && Math.random() > 0.90 && !this.shorelines.find(point => point.x === tile.x && point.y === tile.y)) this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'waves', tile.x, tile.y);
                    if(tile.type === 'sand'){
                        this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, tile.type, tile.x, tile.y);
                        if(Math.random() > 0.9) this.tileset.drawTile(this.offscreenCtx, this.secondOffscreenCtx, 'rocks', tile.x, tile.y);
                    } 
                        
                });
            });
            for(let y = 0; y < this.mapGrid.length; y++){
                for(let x = 0; x < this.mapGrid[0].length; x++){
                    const current = this.mapGrid[y][x];
                    if(current.type === 'trees' || current.type === 'waves'){
                        this.obstacles.push([x * this.tileset.tileSize, y * this.tileset.tileSize]);
                    }
                }
            }
            console.log('Map generated.');
            return resolve(true);
        });
    }
    checkCornerMeeting(){
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                const corners = this.checkDiagonal(x, y, this.mapGrid, current.type);
                if(corners.length == 2){
                    corners.forEach((corner) => {
                        switch (corner) {
                            case 'NW':
                                if(this.checkCornersSurroundings(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'grass' ? 'sand' : 'grass';
                                break;
                            case 'NE':
                                if(this.checkCornersSurroundings(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'grass' ? 'sand' : 'grass';
                                break;
                            case 'SE':
                                if(this.checkCornersSurroundings(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'grass' ? 'sand' : 'grass';
                                break;
                            case 'SW':
                                if(this.checkCornersSurroundings(x, y, corner, current.type)) this.mapGrid[y][x].type = current.type === 'grass' ? 'sand' : 'grass';
                                break;
                            default:
                                break;
                        }
                    });
                }
            }
        }
    }
    checkCornersSurroundings(x: number, y: number, direction: string, targetType: keyof TerrainMap): boolean {
        let tilesToCheck = [];
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

    checkAdjacent(x: number, y: number, grid: GridElement[][], targetType: string): string[] {
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

    checkDiagonal(x: number, y: number, grid: GridElement[][], targetType: string): string[]{
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

    findTilePositions(grid: GridElement[][]): { cornerOuter: Position[], cornerInner: Position[], border: Position[], grass: Position[] } {
        const cornerOuter: Position[] = [];
        const cornerInner: Position[] = [];
        const border: Position[] = [];
        const grass: Position[] = [];
        
        const gridSizeY = grid.length;
        const gridSizeX = grid[0].length;
        
        for (let y = 0; y < gridSizeY; y++) {
            for (let x = 0; x < gridSizeX; x++) {
                const current = grid[y][x];
                if (current.type === 'grass' || current.type === 'waves') {
                    const adjacent = this.checkAdjacent(x, y, grid, 'sand');
                    const diagonal = this.checkDiagonal(x, y, grid, 'sand');
            
                    let rotation = 0;
            
                    if (diagonal.length === 1 && adjacent.length === 0) {
                        if(current.type === 'waves') this.setWavesToShoreline(x, y);
                        // CornerInner
                        switch (diagonal[0]) {
                            case 'NE': rotation = 0; break;
                            case 'NW': rotation = 90; break;
                            case 'SW': rotation = 180; break;
                            case 'SE': rotation = 270; break;
                        }
                        cornerInner.push({ x, y, rotation });
                    } else if (diagonal.length > 0 && adjacent.length === 2) {
                        if(current.type === 'waves') this.setWavesToShoreline(x, y);
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
                        if(current.type === 'waves') this.setWavesToShoreline(x, y);
                        // Border
                        if (adjacent.includes('N')) rotation = 0;
                        else if (adjacent.includes('E')) rotation = 270;
                        else if (adjacent.includes('S')) rotation = 180;
                        else if (adjacent.includes('W')) rotation = 90;
                    
                        border.push({ x, y, rotation });
                    } else {
                        // Grass
                        rotation = 0;
                        if(current.type !== 'waves') grass.push({ x, y, rotation });
                    }
                }
            }
        }
        
        return { cornerOuter, cornerInner, border, grass };
    }

    setWavesToShoreline(x: number, y: number): void {
        this.shorelines.push({x: x, y: y});
    }


    removeSingleTiles(): void {
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'grass' || current.type === 'sand' || current.type === 'waves'){
                    this.directions.forEach((direction) => {
                        if(this.checkIfSoleProtrudingTile(x, y, current.type, direction)) this.mapGrid[y][x].type = (current.type === 'grass' || current.type === 'waves') ? 'sand' : 'grass';
                    });
                }
            }
        }
    }

    ensureNoWaterNextToGrassAndNoSandNextToTrees(): void {
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'grass' || current.type === 'sand'){
                    if(this.checkNeighbours(x, y, current.type)) this.mapGrid[y][x].type = current.type === 'grass' ? 'sand' : 'grass';
                }
            }
        }
    }
    checkNeighbours(x: number, y: number, type: keyof TerrainMap): boolean {
        const checkFor = type === 'grass' ? 'waves' : 'trees';
        const adjacent = this.checkAdjacent(x, y, this.mapGrid, checkFor);
        const diagonal = this.checkDiagonal(x, y, this.mapGrid, checkFor);
        if(adjacent.length > 0 || diagonal.length > 0) return true;
        return false;

    }

    checkSingleTilePaths(): void {
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'grass' || current.type === 'waves'){
                    const adjacent = this.checkAdjacent(x, y, this.mapGrid, current.type);
                    if(adjacent.length === 2){
                        if(adjacent.includes('N') && adjacent.includes('S')) this.mapGrid[y][x].type = 'sand';
                        if(adjacent.includes('E') && adjacent.includes('W')) this.mapGrid[y][x].type = 'sand';
                    }
                }
            }
        }
    }

    checkSingleDiagonalPaths(): void{
        for(let y = 0; y < this.mapGrid.length; y++){
            for(let x = 0; x < this.mapGrid[0].length; x++){
                const current = this.mapGrid[y][x];
                if(current.type === 'grass' || current.type === 'waves'){
                    const grassCorners = this.checkDiagonal(x, y, this.mapGrid, current.type);
                    const sandCorners = this.checkDiagonal(x, y, this.mapGrid, 'sand');
                    if(grassCorners.length === 2){
                        if(grassCorners.includes('NE') && grassCorners.includes('SW')){
                            if(sandCorners.includes('NW') && sandCorners.includes('SE')){
                                this.mapGrid[y][x].type = 'sand';
                            }
                        }else if(grassCorners.includes('NW') && grassCorners.includes('SE')){
                            if(sandCorners.includes('NE') && sandCorners.includes('SW')){
                                this.mapGrid[y][x].type = 'sand';
                            }
                        }
                    }
                }
            }
        }
    }
                        
    checkIfSoleProtrudingTile(x: number, y:number, targetType: string, direction: string): boolean {
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