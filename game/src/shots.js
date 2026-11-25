// The screenshot scenes behind ?shot=cover|grill|serve|title. Each one sets the
// real kitchen state directly — real orders, a real plate mid-assembly, real
// cooking timers — and the real renderer paints it, so every screenshot is
// what a short game really looks like, and the same seed always stages the
// same scene.
import { SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { recipeById } from './recipes.js';

export function stageShot(name, kitchen, random) {
  const state = kitchen.state;
  kitchen.reset();
  // A seeded order stream, so the tickets are the same on every capture.
  kitchen.spawnOrder();
  kitchen.spawnOrder();

  if (name === 'title') {
    return { screen: SCREEN_TITLE, best: 86 };
  }

  if (name === 'grill') {
    // Patty mid-grill in its perfect window, egg boiling, chef at the grill
    // with a chopped tomato ready to go on the plate.
    state.grillSlot = { id: 'patty', timer: 5.2 };
    state.potSlot = { id: 'egg', timer: 2.2 };
    state.carried = { id: 'tomato', ready: true, burnt: false };
    state.chef.x = 470;
    state.chef.y = 440;
    state.chef.facing = 1;
    state.orders[0].patience = state.orders[0].maxPatience * 0.55;
    state.orders[1].patience = state.orders[1].maxPatience * 0.8;
    state.coins = 54;
    state.served = 2;
    state.combo = 2;
    state.timeLeft = 96;
    state.elapsed = 54;
    state.hint = 'Patty sizzling — grab it in the green window, before it burns!';
    state.hintTimer = 99;
    return { screen: SCREEN_PLAY, best: 86 };
  }

  if (name === 'serve') {
    // A finished Sunset Burger on the plate, ready to serve, at the window.
    const burger = recipeById('burger');
    state.plate = [...burger.needs];
    state.chef.x = 1150;
    state.chef.y = 460;
    state.chef.facing = 1;
    state.orders = [{ id: 1, recipe: burger, patience: 22, maxPatience: 44 }];
    state.coins = 118;
    state.served = 4;
    state.combo = 3;
    state.timeLeft = 41;
    state.elapsed = 109;
    state.rush = true;
    state.hint = 'Sunset Burger ready! Serve it at the window — now!';
    state.hintTimer = 99;
    return { screen: SCREEN_PLAY, best: 118 };
  }

  // Cover: the full game in one frame — order board with two tickets,
  // ingredients along the pantry counter, a dish mid-assembly on the plate,
  // a patty on the grill, the shift timer, and the chef carrying lettuce.
  state.grillSlot = { id: 'patty', timer: 3.1 };
  state.chopSlot = { id: 'lettuce', timer: 1.2, done: false };
  state.plate = ['bun', 'tomato'];
  state.carried = { id: 'lettuce', ready: true, burnt: false };
  state.chef.x = 640;
  state.chef.y = 470;
  state.chef.facing = 1;
  state.orders[0].patience = state.orders[0].maxPatience * 0.7;
  state.orders[1].patience = state.orders[1].maxPatience * 0.45;
  state.coins = 36;
  state.served = 1;
  state.timeLeft = 118;
  state.elapsed = 32;
  state.hint = 'Burger mid-assembly: bun and tomato on the plate, lettuce in hand.';
  state.hintTimer = 99;
  return { screen: SCREEN_PLAY, best: 86 };
}
