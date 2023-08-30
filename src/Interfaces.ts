export interface Point {
    x?: number;
    y?: number;
    background?: string;
}

export interface TerrainMap {
    grass: Point;
    water: Point;
    flowers: Point;
    innerCorner: Point;
    outerCorner: Point;
    border: Point;  
    sand: Point;
    rocks: Point;
    waves: Point;
    trees: Point;
}

