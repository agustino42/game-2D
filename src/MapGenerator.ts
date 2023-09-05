import Tilemap from "./Tilemap";
import generatePermTable from "./Perlin/PermutationTable";
import Tileset from "./Tileset";

export default function generateMap(permtableSeed: number, islandFactorConstant: number, width: number, height: number, tileset: Tileset): Promise<Tilemap> {
    const perm = generatePermTable(permtableSeed);
    const tilemap = new Tilemap(Math.floor(width), Math.floor(height), tileset);
    return tilemap.generateMap(perm,islandFactorConstant);
}