// vite.config.js
import { defineConfig } from 'vite';
import kontra from 'rollup-plugin-kontra';

export default defineConfig({
    plugins: [
        kontra({
            gameObject: {
                anchor: true,
                scale: true,
                ttl: true,
                velocity: true,
            },
            sprite: {
                animation: true,
                image: true,
            }
        })
    ],
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true
    },
    server: {
        port: 5173,
        open: true
    }
});
