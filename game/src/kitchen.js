// The game's rules and state, with no drawing and no browser in it: the chef, the
// stations, cooking timers, the plate, the orders and the shift clock. step()
// advances one fixed step and returns what happened as bit flags, so the caller
// can play sounds and announce without the world knowing about screens.
// Nothing here allocates after createKitchen returns, except order objects.

import { CHEF, COOK, FLOOR, HEARTS, ORDERS, PAY, REACH, SHIFT, STATIONS } from './config.js';
import { INGREDIENTS, PANTRY_ORDER, matchingRecipe, pickRecipe } from './recipes.js';

export const EVENT_PICKUP = 1;
export const EVENT_PLACE = 2;
export const EVENT_READY = 4;
export const EVENT_BURNT = 8;
export const EVENT_SERVE = 16;
export const EVENT_EXPIRE = 32;
export const EVENT_ERROR = 64;
export const EVENT_RUSH = 128;
export const EVENT_OVER = 256;
export const EVENT_TRASH = 512;
export const EVENT_PLATE = 1024;
export const EVENT_CHOP = 2048;

/** Distance from a point to the nearest point of a rectangle, in pixels. */
function distanceToRect(x, y, rect) {
  const cx = Math.min(rect.x + rect.width, Math.max(rect.x, x));
  const cy = Math.min(rect.y + rect.height, Math.max(rect.y, y));
  return Math.hypot(x - cx, y - cy);
}

export function createKitchen(random) {
  const chef = { x: 640, y: 470, facing: 1, walking: false };
  const state = {
    chef,
    carried: null,
    chopSlot: null,
    grillSlot: null,
    potSlot: null,
    plate: [],
    orders: [],
    coins: 0,
    served: 0,
    expired: 0,
    combo: 0,
    bestCombo: 0,
    hearts: HEARTS,
    timeLeft: SHIFT.seconds,
    elapsed: 0,
    orderTimer: ORDERS.firstDelay,
    lastRecipeId: null,
    rush: false,
    over: false,
    hint: 'Walk to the pantry counter and press E to pick an ingredient.',
    hintTimer: 6,
    lastServePay: 0,
    lastServeName: '',
    serveFlash: 0,
    expireFlash: 0,
  };

  function reset() {
    chef.x = 640;
    chef.y = 470;
    chef.facing = 1;
    chef.walking = false;
    state.carried = null;
    state.chopSlot = null;
    state.grillSlot = null;
    state.potSlot = null;
    state.plate = [];
    state.orders = [];
    state.coins = 0;
    state.served = 0;
    state.expired = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hearts = HEARTS;
    state.timeLeft = SHIFT.seconds;
    state.elapsed = 0;
    state.orderTimer = ORDERS.firstDelay;
    state.lastRecipeId = null;
    state.rush = false;
    state.over = false;
    state.hint = 'Walk to the pantry counter and press E to pick an ingredient.';
    state.hintTimer = 6;
    state.lastServePay = 0;
    state.lastServeName = '';
    state.serveFlash = 0;
    state.expireFlash = 0;
  }

  /** The station the chef can use right now, or null when none is in reach. */
  function nearestStation() {
    const cx = chef.x;
    const cy = chef.y;
    let best = null;
    let bestDist = REACH;
    for (const name of ['chop', 'grill', 'pot', 'plate', 'serve', 'trash']) {
      const dist = distanceToRect(cx, cy, STATIONS[name]);
      if (dist < bestDist) {
        bestDist = dist;
        best = name;
      }
    }
    const pantryDist = distanceToRect(cx, cy, STATIONS.pantry);
    if (pantryDist < bestDist) best = 'pantry';
    return best;
  }

  /** Which pantry bin the chef stands at, from their x position along the counter. */
  function pantryBin() {
    const rect = STATIONS.pantry;
    const index = Math.floor((chef.x - rect.x) / (rect.width / PANTRY_ORDER.length));
    return PANTRY_ORDER[Math.min(PANTRY_ORDER.length - 1, Math.max(0, index))];
  }

  function setHint(message, seconds) {
    state.hint = message;
    state.hintTimer = seconds || 3.5;
  }

  function spawnOrder() {
    const recipe = pickRecipe(random, state.lastRecipeId);
    state.lastRecipeId = recipe.id;
    const progress = state.elapsed / SHIFT.seconds;
    let patience = ORDERS.patienceStart + (ORDERS.patienceEnd - ORDERS.patienceStart) * progress;
    if (state.rush) patience *= ORDERS.rushPatienceScale;
    state.orders.push({ id: state.elapsed, recipe, patience, maxPatience: patience });
  }

  function orderGap() {
    const progress = state.elapsed / SHIFT.seconds;
    let gap = ORDERS.gapStart + (ORDERS.gapEnd - ORDERS.gapStart) * progress;
    if (state.rush) gap *= 0.8;
    return gap;
  }

  /** Use the nearest station. Returns event flags for the caller to react to. */
  function interact() {
    const station = nearestStation();
    if (!station) {
      setHint('Walk up to a station — the nearest one glows gold.', 2.5);
      return EVENT_ERROR;
    }
    if (station === 'pantry') {
      const id = pantryBin();
      if (state.carried) {
        setHint('Hands full! Use what you are carrying, or bin it at the trash.', 3);
        return EVENT_ERROR;
      }
      const ingredient = INGREDIENTS[id];
      state.carried = { id, ready: ingredient.prep === 'none', burnt: false };
      setHint(`${ingredient.name} picked up. ${ingredient.prep === 'none' ? 'Ready for the plate.' : 'It needs prep: chop, grill or pot.'}`, 3);
      return EVENT_PICKUP;
    }
    if (station === 'trash') {
      if (state.carried) {
        state.carried = null;
        setHint('Binned. Nothing wasted but pride.', 2.5);
        return EVENT_TRASH;
      }
      if (state.plate.length > 0) {
        state.plate = [];
        setHint('Plate cleared. Start the dish again.', 2.5);
        return EVENT_TRASH;
      }
      setHint('Nothing to bin — the trash is already empty.', 2.5);
      return EVENT_ERROR;
    }
    if (station === 'chop') {
      if (state.chopSlot && state.chopSlot.done) {
        if (state.carried) {
          setHint('Hands full! Put down what you are carrying first.', 3);
          return EVENT_ERROR;
        }
        state.carried = { id: state.chopSlot.id, ready: true, burnt: false };
        state.chopSlot = null;
        setHint('Chopped and ready for the plate.', 2.5);
        return EVENT_PICKUP;
      }
      if (state.chopSlot) {
        setHint('Still chopping… watch the board fill up.', 2.5);
        return EVENT_ERROR;
      }
      if (state.carried && (state.carried.id === 'lettuce' || state.carried.id === 'tomato') && !state.carried.ready) {
        state.chopSlot = { id: state.carried.id, timer: 0, done: false };
        state.carried = null;
        setHint('Chopping! It will be ready in a moment.', 2.5);
        return EVENT_CHOP;
      }
      setHint('The board is for lettuce and tomato — bring one over.', 3);
      return EVENT_ERROR;
    }
    if (station === 'grill') {
      if (state.grillSlot) {
        if (state.carried) {
          setHint('Hands full! Put down what you are carrying first.', 3);
          return EVENT_ERROR;
        }
        const slot = state.grillSlot;
        state.grillSlot = null;
        if (slot.timer >= COOK.pattyBurnt) {
          state.carried = { id: 'patty', ready: false, burnt: true };
          setHint('Burnt! Bin it at the trash and grill a fresh patty.', 3.5);
          return EVENT_BURNT;
        }
        state.carried = { id: 'patty', ready: slot.timer >= COOK.pattyPerfect, burnt: false };
        setHint(slot.timer >= COOK.pattyPerfect ? 'Perfectly grilled!' : 'Still pink inside — it needs more grill time.', 3);
        return EVENT_PICKUP;
      }
      if (state.carried && state.carried.id === 'patty' && !state.carried.ready && !state.carried.burnt) {
        state.grillSlot = { id: 'patty', timer: 0 };
        state.carried = null;
        setHint('Patty on the grill — listen for the sizzle.', 2.5);
        return EVENT_PLACE;
      }
      setHint('The grill is for raw patties. Fetch one from the pantry.', 3);
      return EVENT_ERROR;
    }
    if (station === 'pot') {
      if (state.potSlot) {
        if (state.carried) {
          setHint('Hands full! Put down what you are carrying first.', 3);
          return EVENT_ERROR;
        }
        const slot = state.potSlot;
        state.potSlot = null;
        if (slot.timer >= COOK.eggBurnt) {
          state.carried = { id: 'egg', ready: false, burnt: true };
          setHint('Overboiled and grey! Bin it and boil a fresh egg.', 3.5);
          return EVENT_BURNT;
        }
        state.carried = { id: 'egg', ready: slot.timer >= COOK.eggPerfect, burnt: false };
        setHint(slot.timer >= COOK.eggPerfect ? 'Boiled just right!' : 'Still runny — give the egg more time.', 3);
        return EVENT_PICKUP;
      }
      if (state.carried && state.carried.id === 'egg' && !state.carried.ready && !state.carried.burnt) {
        state.potSlot = { id: 'egg', timer: 0 };
        state.carried = null;
        setHint('Egg in the pot — it boils while you work.', 2.5);
        return EVENT_PLACE;
      }
      setHint('The pot is for raw eggs. Fetch one from the pantry.', 3);
      return EVENT_ERROR;
    }
    if (station === 'plate') {
      if (!state.carried) {
        setHint(state.plate.length === 0 ? 'An empty plate. Bring a ready ingredient.' : 'Plate is waiting — bring the next ingredient.', 2.5);
        return EVENT_ERROR;
      }
      if (state.carried.burnt) {
        setHint('Burnt food never reaches a plate. Bin it!', 3);
        return EVENT_ERROR;
      }
      if (!state.carried.ready) {
        setHint(`${INGREDIENTS[state.carried.id].name} is not ready yet — prep it first.`, 3);
        return EVENT_ERROR;
      }
      if (state.plate.includes(state.carried.id)) {
        setHint('That is already on the plate.', 2.5);
        return EVENT_ERROR;
      }
      state.plate.push(state.carried.id);
      state.carried = null;
      const recipe = matchingRecipe(state.plate);
      if (recipe) {
        setHint(`${recipe.name} complete! Carry it to the serving window — fast!`, 4);
      } else {
        setHint('Added to the plate. Check the order board for what is missing.', 2.5);
      }
      return EVENT_PLATE;
    }
    if (station === 'serve') {
      const recipe = matchingRecipe(state.plate);
      if (!recipe) {
        setHint('No finished dish on the plate yet. Build one at the plate counter.', 3);
        return EVENT_ERROR;
      }
      const index = state.orders.findIndex((order) => order.recipe.id === recipe.id);
      if (index === -1) {
        setHint(`Nobody ordered a ${recipe.name} right now. Wait for its ticket.`, 3);
        return EVENT_ERROR;
      }
      const order = state.orders[index];
      const patienceLeft = Math.max(0, order.patience / order.maxPatience);
      const tip = Math.round(PAY.tipMax * patienceLeft);
      const comboBonus = state.combo >= 2 ? 10 : 0;
      const pay = recipe.pay + tip + comboBonus;
      state.coins += pay;
      state.served += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.lastServePay = pay;
      state.lastServeName = recipe.name;
      state.serveFlash = 1.2;
      state.orders.splice(index, 1);
      state.plate = [];
      setHint(`Served! ${recipe.name} earned ${pay} coins${comboBonus ? ' (combo bonus!)' : ''}.`, 3.5);
      return EVENT_SERVE;
    }
    return EVENT_ERROR;
  }

  /** One fixed step. `move` is a normalised direction; `harmless` freezes orders (title backdrop). */
  function step(dt, move, harmless) {
    let events = 0;
    if (state.hintTimer > 0) state.hintTimer -= dt;
    if (state.serveFlash > 0) state.serveFlash -= dt;
    if (state.expireFlash > 0) state.expireFlash -= dt;

    // The chef walks the open floor, facing the way they move.
    chef.walking = move.x !== 0 || move.y !== 0;
    if (chef.walking) {
      if (move.x !== 0) chef.facing = move.x > 0 ? 1 : -1;
      chef.x = Math.min(FLOOR.x + FLOOR.width - CHEF.width / 2, Math.max(FLOOR.x + CHEF.width / 2, chef.x + move.x * CHEF.speed * dt));
      chef.y = Math.min(FLOOR.y + FLOOR.height - CHEF.height / 2, Math.max(FLOOR.y + CHEF.height / 2, chef.y + move.y * CHEF.speed * dt));
    }

    // Cooking keeps going while the chef works elsewhere.
    if (state.chopSlot && !state.chopSlot.done) {
      state.chopSlot.timer += dt;
      if (state.chopSlot.timer >= COOK.chopSeconds) {
        state.chopSlot.done = true;
        events |= EVENT_READY;
      }
    }
    if (state.grillSlot) {
      const before = state.grillSlot.timer;
      state.grillSlot.timer += dt;
      if (before < COOK.pattyPerfect && state.grillSlot.timer >= COOK.pattyPerfect) events |= EVENT_READY;
      if (before < COOK.pattyBurnt && state.grillSlot.timer >= COOK.pattyBurnt) events |= EVENT_BURNT;
    }
    if (state.potSlot) {
      const before = state.potSlot.timer;
      state.potSlot.timer += dt;
      if (before < COOK.eggPerfect && state.potSlot.timer >= COOK.eggPerfect) events |= EVENT_READY;
      if (before < COOK.eggBurnt && state.potSlot.timer >= COOK.eggBurnt) events |= EVENT_BURNT;
    }

    if (harmless || state.over) return events;

    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT.seconds - state.elapsed);

    if (!state.rush && state.timeLeft <= SHIFT.rushAt) {
      state.rush = true;
      events |= EVENT_RUSH;
      setHint('SUNSET RUSH! Orders come faster — keep the grill hot!', 4);
    }

    // New orders arrive on a shrinking gap, up to three at once.
    state.orderTimer -= dt;
    if (state.orderTimer <= 0) {
      if (state.orders.length < ORDERS.maxActive) spawnOrder();
      state.orderTimer = orderGap();
    }

    // Patience drains; an empty patience costs a heart and breaks the combo.
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      state.orders[i].patience -= dt;
      if (state.orders[i].patience <= 0) {
        const lost = state.orders[i];
        state.orders.splice(i, 1);
        state.hearts -= 1;
        state.expired += 1;
        state.combo = 0;
        state.expireFlash = 1.2;
        setHint(`A ${lost.recipe.name} walked out hungry! One heart lost.`, 3.5);
        events |= EVENT_EXPIRE;
      }
    }

    if (state.timeLeft <= 0 || state.hearts <= 0) {
      state.over = true;
      events |= EVENT_OVER;
    }
    return events;
  }

  reset();
  return { state, reset, step, interact, nearestStation, pantryBin, setHint, spawnOrder };
}
