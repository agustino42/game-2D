// import groundTiles from '/assets/ground-tiles.png';
import worldTiles from '/assets/worldtiles.png';
import player from '/assets/player.png';

export default function loadImageAssets(): Promise<HTMLImageElement[]>{
    return Promise.all(urls.map(loadAsset)).then((images) => {
        return images;
    });
}

export function loadAsset(url: string): Promise<HTMLImageElement>{
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
        image.src = url;
    });
}

const urls = [
    worldTiles,
    player
]
