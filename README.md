# Corre para Sobrevivir!

**Corre por tu vida en un juego 2D de zombies con habilidades especiales, disparos y gestión de recursos.**

Este proyecto es una aplicación de juego creada con TypeScript, Vite y la librería de sprites y animación Kontra.js. El objetivo es sobrevivir el mayor tiempo posible, derrotar oleadas de no-muertos y usar ataques con cooldown para dominar el campo de batalla.

---

## 🎮 Qué ofrece este juego

- Movimiento fluido en 2D usando `W`, `A`, `S`, `D`.
- Disparo principal rápido: **Ginger Shot**.
- Habilidad de área: **Bomba de vitaminas**.
- Habilidad de control: **Nube de cúrcuma** para ralentizar enemigos.
- Barra de salud, indicadores de cooldown y multiplicadores de puntuación.
- Enemigos basados en zombies y una experiencia de supervivencia arcade.

---

## 🕹️ Controles

- `W`, `A`, `S`, `D`: mover al personaje.
- Clic izquierdo: disparar **Ginger Shot**.
- `Espacio`: lanzar una **Bomba de vitaminas**.
- `E` o `Q`: lanzar una **Nube de cúrcuma**.
- Usa el ratón para apuntar en pantalla.

> Los cooldowns se muestran en la UI superior derecha junto a la barra de salud.

---

## ✅ Cómo jugar

1. Muévete para esquivar a los zombies.
2. Usa **Ginger Shot** para eliminar enemigos a distancia.
3. Aprovecha la **Bomba de vitaminas** para limpiar grupos.
4. Lanza la **Nube de cúrcuma** para ralentizar a los enemigos y ganar tiempo.
5. Busca combinaciones de impactos para obtener multiplicadores de puntuación.

---

## 🚀 Instalación y ejecución

Desde la carpeta `game-2D`:

```bash
npm install
npm run dev
```

Luego abre la dirección local que indica Vite.

### Para compilar y generar el build

```bash
npm run build
```

### Para previsualizar el build generado

```bash
npm run preview
```

### Para crear un ZIP de producción

```bash
npm run build-zip
```

---

## 📁 Estructura del proyecto

- `game.html` / `index.html` — páginas de entrada del juego.
- `src/` — código fuente en TypeScript.
  - `main.ts` — punto de entrada principal.
  - `EstadoJuego.ts` — lógica de estado del juego.
  - `InputHandler.ts` / `InputEvents.ts` — gestión de controles y eventos.
  - `MapGenerator.ts`, `ZombieSpawner.ts` — generación de nivel y enemigos.
  - `SpriteFactory.ts`, `Tilemap.ts`, `Tileset.ts` — manejo de gráficos y tiles.
  - `Sounds.ts`, `Music.js`, `zzfx.ts` — efectos de sonido y música.
- `public/assets/` — recursos estáticos.
- `landing/` — página de aterrizaje del juego.

---

## 🛠️ Tecnologías usadas

- `TypeScript`
- `Vite`
- `Kontra.js`
- `zzfx` para efectos de sonido
- `google-closure-compiler`, `terser` y `bestzip` para build/minificación

---

## 💡 Recomendaciones

- Juega con volumen para disfrutar los efectos de sonido.
- Prueba combinar ataques para limpiar grupos de zombies.
- Usa la nube de cúrcuma en zonas con muchos enemigos para controlar el flujo de la partida.

---

## 📌 Nota

Este repositorio está configurado como `private` en `package.json`, lo que significa que está pensado para uso local y no para publicación en npm.

---

## ✨ Créditos

- Sprites creados con [PixelDudesMaker](https://0x72.itch.io/pixeldudesmaker).
- Sonidos generados con [ZzFX](https://github.com/KilledByAPixel/ZzFX).
- Animaciones y lógica de juego construidas con [Kontra.js](https://github.com/straker/kontra).

