import tiles from '/assets/tiles.png';

export default function loadImageAssets(): Promise<HTMLImageElement[]>{
    return loadAsset(tiles).then((image) => {
        return Promise.all([
            splitImage(image, 0, 0, 80, 32),
            splitImage(image, 0, 32, 240, 22),
        ]);
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

function splitImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
        const newImage = new Image();
        newImage.onload = () => resolve(newImage);
        newImage.src = canvas.toDataURL();
    });
}