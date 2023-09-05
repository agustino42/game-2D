export default function generatePermTable(seed: number) {
    const rng = SeedableRandom(seed);

    // Create an array from 0 to 255
    const perm = Array.from({ length: 256 }, (_, index) => index);

    // Shuffle the perm array using Fisher-Yates (Durstenfeld) algorithm
    for (let i = perm.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]];
    }

    const permTable: number[] = [];
    for (let i = 0; i < 512; i++) {
        permTable[i] = perm[i & 255];
    }

    return permTable;
}

function SeedableRandom(seed: number): { next: () => number } {
    const m = 0x80000000; // 2**31;
    const a = 1103515245;
    const c = 12345;

    seed = seed || Math.floor(Math.random() * m);

    function next() {
        seed = (a * seed + c) % m;
        return seed / m;
    }

    return { next };
}
