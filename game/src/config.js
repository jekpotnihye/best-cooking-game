// Sunset Skillet — every tuning number, colour and station position in one place.
// The kitchen is a fixed 1280x720 logical room; the renderer scales it to the window,
// so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display rate. */
export const STEP = 1 / 60;

/** One full shift, in seconds, and the moment the sunset rush begins. */
export const SHIFT = { seconds: 150, rushAt: 60 };

/** The chef's walk speed and body size, in logical pixels. */
export const CHEF = { width: 44, height: 52, speed: 300 };

/** How close the chef must stand to a station before it can be used. */
export const REACH = 82;

/** Hands hold one thing at a time; the plate holds one dish at a time. */
export const HANDS = { capacity: 1 };

/** Cooking windows, in seconds: patty on the grill, egg in the pot, chopping on the board. */
export const COOK = {
  pattyPerfect: 4.5,
  pattyBurnt: 9.5,
  eggPerfect: 3.5,
  eggBurnt: 8,
  chopSeconds: 2,
};

/** Order pacing: first order delay, then a gap that shrinks as the shift goes on. */
export const ORDERS = {
  firstDelay: 4,
  gapStart: 16,
  gapEnd: 9,
  maxActive: 3,
  patienceStart: 48,
  patienceEnd: 34,
  rushPatienceScale: 0.82,
};

/** Coins: base pay per dish, plus a tip for the patience still left when it is served. */
export const PAY = { base: 24, tipMax: 16 };

/** Reputation hearts: an expired order costs one; at zero the shift ends early. */
export const HEARTS = 3;

/** Station rectangles, in logical pixels. The floor is the open middle of the room. */
export const STATIONS = {
  pantry: { x: 40, y: 592, width: 1200, height: 92 },
  chop: { x: 96, y: 300, width: 190, height: 84 },
  grill: { x: 380, y: 296, width: 200, height: 88 },
  pot: { x: 660, y: 296, width: 190, height: 88 },
  plate: { x: 930, y: 300, width: 210, height: 84 },
  serve: { x: 1100, y: 484, width: 140, height: 84 },
  trash: { x: 56, y: 96, width: 96, height: 74 },
};

export const FLOOR = { x: 40, y: 180, width: 1200, height: 400 };

export const PALETTE = {
  backdrop: '#2b1a2e',
  wall: '#7a3b3f',
  wallLow: '#5e2c33',
  floorA: '#c98d5e',
  floorB: '#bd8152',
  counter: '#8a5a3b',
  counterTop: '#a9714b',
  counterEdge: '#6d452c',
  steel: '#9aa7b0',
  steelDark: '#6f7c86',
  board: '#3e4a3a',
  boardFrame: '#d9b36a',
  chalk: '#f4ecd8',
  text: '#fff6e8',
  muted: '#e8c9a8',
  ink: '#33231f',
  sun: '#ffb347',
  sunCore: '#ffe08a',
  skyTop: '#ff9e5e',
  skyMid: '#ff7e6b',
  skyLow: '#c65d7b',
  chefHat: '#fdf6ea',
  chefCoat: '#fdf6ea',
  chefApron: '#e2574c',
  chefSkin: '#f2b98a',
  chefHair: '#4a2f26',
  plate: '#f7f2e7',
  plateRim: '#d9c9a8',
  heart: '#ff5d6c',
  heartEmpty: '#5e2c33',
  coin: '#f2c94c',
  good: '#7bc96f',
  warn: '#ffb347',
  bad: '#ff5d6c',
  panel: 'rgba(43, 26, 46, 0.92)',
  panelLine: '#d9b36a',
  highlight: '#ffe08a',
  shadow: 'rgba(0, 0, 0, 0.25)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const FONT_DISPLAY = '"Trebuchet MS", system-ui, sans-serif';

/** Where the best shift total is kept between visits (this browser only). */
export const BEST_KEY = 'sunset-skillet.best';
