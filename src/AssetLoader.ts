import groundTiles from '/assets/ground-tiles.png';

export default function loadImageAssets(): Promise<HTMLImageElement>{
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
        image.src = groundTiles;
    });
}