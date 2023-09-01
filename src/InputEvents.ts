import { Point } from './Interfaces.ts';

const pressedKeys: { [key: string]: boolean } = {};

const mousePosition: Point = {x: 0, y: 0};

// Lyssna på keydown
document.addEventListener('keydown', (event) => {
  pressedKeys[event.key] = true;
});

// Lyssna på keyup
document.addEventListener('keyup', (event) => {
  pressedKeys[event.key] = false;
});

document.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
});

export function getMousePosition(): Point {
    return mousePosition;
}

export function keyPressed(key: string): boolean {
  return !!pressedKeys[key];
}