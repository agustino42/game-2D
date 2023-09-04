const grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
[1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
[0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];

function lerp(a0: number, a1: number, w: number) {
    return (1.0 - w) * a0 + w * a1;
}

function positiveMod(n: number, m: number) {
    return ((n % m) + m) % m;
}

function dotGridGradient(ix: number, iy: number, x: number, y: number, perm: number[]) {

    const permX = positiveMod(ix, perm.length);
    const permY = positiveMod(iy, perm.length);
    let gradIndex = positiveMod(perm[permX] + permY, perm.length);
    let grad = grad3[gradIndex % 12];

    let dx = x - ix;
    let dy = y - iy;

    return (dx * grad[0] + dy * grad[1]);
}

export default function perlin(x: number, y: number, perm: number[]) {
    let x0 = Math.floor(x);
    let x1 = x0 + 1;
    let y0 = Math.floor(y);
    let y1 = y0 + 1;
    let sx = x - x0;
    let sy = y - y0;

    let n0, n1, ix0, ix1, value;
    n0 = dotGridGradient(x0, y0, x, y, perm);
    n1 = dotGridGradient(x1, y0, x, y, perm);
    ix0 = lerp(n0, n1, sx);
    n0 = dotGridGradient(x0, y1, x, y, perm);
    n1 = dotGridGradient(x1, y1, x, y, perm);
    ix1 = lerp(n0, n1, sx);
    value = lerp(ix0, ix1, sy);

    return value;
}