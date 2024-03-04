const pressedKeys: { [key: string]: boolean } = {
                                                    ' ': false,
                                                    'e': false,
                                                    'q': false,
                                                };
document.addEventListener('keydown', (event) => {
  pressedKeys[event.key] = true;
});

// funciones de la logica
document.addEventListener('keyup', (event) => {
  pressedKeys[event.key] = false;
});

export function keyPressed(key: string): boolean {
  return !!pressedKeys[key];
}

export function getActionKeyPressed() {
    return Object.fromEntries(Object.entries(pressedKeys).filter(([key]) => key === ' ' || key === 'e' || key === 'q'));
    
}
