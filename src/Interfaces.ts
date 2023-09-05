export interface Point {
    x?: number;
    y?: number;
    background?: string;
}

export interface Position {
    x: number;
    y: number;
}

export interface ColorMap {
    g: string;
    w: string;
    s: string;
    uG: string;
    uY: string;
    uO: string;
    uR: string;
    uP: string;
    uW: string;
    uCd: string;
}

export interface Circle {
    position: Position;
    radius: number;
}

export interface TerrainMap {
    g: Point;
    w: Point;
    f: Point;
    iC: Point;
    oC: Point;
    b: Point;  
    s: Point;
    r: Point;
    wv: Point;
    t: Point;
}

export interface GridElement {
    x: number;
    y: number;
    type: keyof TerrainMap;
}

export interface RotatingPosition {
    x: number;
    y: number;
    rotation: number;
}

export type Scale = () => number;
