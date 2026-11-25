// A small seeded random number generator (splitmix-style step over a 32-bit state):
// the same seed gives the same order stream, which is what makes the screenshot
// scenes repeatable from one run to the next.

export function createRandom(seed) {
  let state = (seed | 0) || 1;
  return function random() {
    state = (state + 0x9e3779b9) | 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 4294967296;
  };
}
