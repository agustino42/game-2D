// Set up gradient array
var grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
[1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
[0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];

// A simple method to linearly interpolate between a0 and a1
// Weight w should be in the range [0.0, 1.0]
function lerp(a0: number, a1: number, w: number) {
    return (1.0 - w) * a0 + w * a1;
}

function positiveMod(n: number, m: number) {
    return ((n % m) + m) % m;
}

// Computes the dot product of the distance and gradient vectors.
function dotGridGradient(ix: number, iy: number, x: number, y: number, perm: number[]) {
    // Precomputed (normalized) directions from each grid point out to an
    // octahedron.
    // var grad = grad3[perm[ix + perm[iy]] % 12];
    const permX = positiveMod(ix, perm.length);
    const permY = positiveMod(iy, perm.length);
    var gradIndex = positiveMod(perm[permX] + permY, perm.length);
    var grad = grad3[gradIndex % 12];

    // Compute the distance vector
    var dx = x - ix;
    var dy = y - iy;

    // Compute the dot-product
    return (dx * grad[0] + dy * grad[1]);
}

// Compute Perlin noise at coordinates x, y
export default function perlin(x: number, y: number, perm: number[]) {
    // Determine grid cell coordinates
    // perm = generatePermTable(seed);
    let x0 = Math.floor(x);
    let x1 = x0 + 1;
    let y0 = Math.floor(y);
    let y1 = y0 + 1;

    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    let sx = x - x0;
    let sy = y - y0;

    // Interpolate between grid point gradients
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