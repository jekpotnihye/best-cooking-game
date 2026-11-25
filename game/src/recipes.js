// The menu: every ingredient, what it needs before it can go on a plate, and the
// four dishes customers order. A dish is a set of finished ingredients; the order
// they are added to the plate does not matter, which is what lets a cook plan a
// route instead of memorising a sequence.

/** prep: none = ready as picked, chop = needs the chopping board, grill / pot = timed cooking. */
export const INGREDIENTS = {
  bun: { id: 'bun', name: 'Bun', prep: 'none', color: '#e8b96a', dark: '#c98f3d' },
  patty: { id: 'patty', name: 'Patty', prep: 'grill', color: '#8a4b32', dark: '#5e2f1e' },
  lettuce: { id: 'lettuce', name: 'Lettuce', prep: 'chop', color: '#7bc96f', dark: '#4d9a4a' },
  tomato: { id: 'tomato', name: 'Tomato', prep: 'chop', color: '#e2574c', dark: '#b23a32' },
  cheese: { id: 'cheese', name: 'Cheese', prep: 'none', color: '#f2c94c', dark: '#d9a41f' },
  egg: { id: 'egg', name: 'Egg', prep: 'pot', color: '#fdf6ea', dark: '#e0d3b8' },
  noodle: { id: 'noodle', name: 'Noodles', prep: 'none', color: '#f2d98a', dark: '#d9b95e' },
  sauce: { id: 'sauce', name: 'Sauce', prep: 'none', color: '#c65d7b', dark: '#9c3f5a' },
};

/** The pantry bins, left to right along the bottom counter. */
export const PANTRY_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'egg', 'noodle', 'sauce'];

export const RECIPES = [
  {
    id: 'burger',
    name: 'Sunset Burger',
    needs: ['bun', 'patty', 'lettuce', 'tomato'],
    pay: 30,
    blurb: 'The stall classic: grilled patty, fresh crunch, golden bun.',
  },
  {
    id: 'bowl',
    name: 'Garden Bowl',
    needs: ['lettuce', 'tomato', 'egg', 'cheese'],
    pay: 26,
    blurb: 'Cool, crisp and golden — no grill, all freshness.',
  },
  {
    id: 'noodles',
    name: 'Golden Noodles',
    needs: ['noodle', 'egg', 'cheese', 'sauce'],
    pay: 28,
    blurb: 'Twirled noodles, a boiled egg and a sunset-pink sauce.',
  },
  {
    id: 'melt',
    name: 'Cheese Melt',
    needs: ['bun', 'cheese', 'tomato', 'sauce'],
    pay: 24,
    blurb: 'Fast, melty and kind to a cook in a rush.',
  },
];

export function recipeById(id) {
  for (const recipe of RECIPES) if (recipe.id === id) return recipe;
  return null;
}

/** The finished form of a carried item: raw patty becomes grilled patty, and so on. */
export function finishedId(rawId) {
  if (rawId === 'patty') return 'patty';
  if (rawId === 'egg') return 'egg';
  return rawId;
}

/** True when the plate's finished ingredients are exactly one recipe's needs. */
export function matchingRecipe(plateItems) {
  for (const recipe of RECIPES) {
    if (plateItems.length !== recipe.needs.length) continue;
    const sorted = [...plateItems].sort().join(',');
    if (sorted === [...recipe.needs].sort().join(',')) return recipe;
  }
  return null;
}

/** Pick the next order: avoid repeating the last dish twice in a row when possible. */
export function pickRecipe(random, lastId) {
  let pick = RECIPES[Math.floor(random() * RECIPES.length)];
  if (pick.id === lastId && random() < 0.7) {
    pick = RECIPES[(RECIPES.indexOf(pick) + 1) % RECIPES.length];
  }
  return pick;
}
