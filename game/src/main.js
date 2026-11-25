// Boot and the one loop: input is read every frame, the kitchen advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between four screens: title,
// play, paused and shift over.
//
// ?seed=N fixes the order stream. ?shot=cover|grill|serve|title (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createKitchen, EVENT_BURNT, EVENT_ERROR, EVENT_EXPIRE, EVENT_OVER, EVENT_PLATE, EVENT_READY, EVENT_RUSH, EVENT_SERVE } from './kitchen.js';
import { ACTION_INTERACT, ACTION_MUTE, ACTION_PAUSE, ACTION_SERVE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { createSounds } from './sounds.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const kitchen = createKitchen(createRandom(seed));
const renderer = createRenderer(canvas);
const sounds = createSounds();

/** Convert a pointer position on the page into logical room coordinates. */
function toLogical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / 1280, rect.height / 720);
  const offsetX = (rect.width - 1280 * scale) / 2;
  const offsetY = (rect.height - 720 * scale) / 2;
  return { x: (clientX - rect.left - offsetX) / scale, y: (clientY - rect.top - offsetY) / scale };
}

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function announce(message) {
  status.textContent = message;
}

function playEvents(events) {
  if (events & EVENT_SERVE) sounds.serve();
  else if (events & EVENT_EXPIRE) sounds.expire();
  else if (events & EVENT_BURNT) sounds.error();
  else if (events & EVENT_READY) sounds.ding();
  else if (events & EVENT_PLATE) sounds.pickup();
  else if (events & EVENT_ERROR) sounds.error();
  if (events & EVENT_RUSH) sounds.rush();
}

function runShot(name) {
  const scene = stageShot(name, kitchen, createRandom(seed));
  let painted = 0;
  function paint() {
    const nearest = kitchen.nearestStation();
    renderer.draw(kitchen.state, scene.screen, scene.best, {
      nearest,
      binId: nearest === 'pantry' ? kitchen.pantryBin() : null,
      muted: false,
    });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, toLogical);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let muted = false;

  function startShift() {
    kitchen.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    sounds.unlock();
    announce('Playing. Cook what the order board asks for before the sun sets.');
  }

  function endShift() {
    screen = SCREEN_OVER;
    if (kitchen.state.coins > best) {
      best = kitchen.state.coins;
      saveBest(best);
    }
    announce(`Shift over. ${kitchen.state.coins} coins earned. Best ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      muted = sounds.toggleMute();
      announce(muted ? 'Sound muted.' : 'Sound on.');
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      if (actions & ACTION_INTERACT) startShift();
      return;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (actions & (ACTION_INTERACT | ACTION_SERVE)) {
      const events = kitchen.interact();
      playEvents(events);
      if (events & EVENT_OVER) endShift();
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      kitchen.step(STEP, { x: 0, y: 0 }, true);
      return;
    }
    const move = input.direction(kitchen.state.chef.x, kitchen.state.chef.y);
    const events = kitchen.step(STEP, move, false);
    playEvents(events);
    if (events & EVENT_EXPIRE) {
      announce(`An order expired. ${kitchen.state.hearts} hearts left.`);
    }
    if (events & EVENT_OVER) endShift();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    const nearest = kitchen.nearestStation();
    renderer.draw(kitchen.state, screen, best, {
      nearest,
      binId: nearest === 'pantry' ? kitchen.pantryBin() : null,
      muted,
    });
  }

  // Leaving the tab pauses a running game rather than letting orders expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Sunset Skillet. Press Space or click to start cooking.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
