// rollup.config.js
import kontra from 'rollup-plugin-kontra'

export default {
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
    ]
}