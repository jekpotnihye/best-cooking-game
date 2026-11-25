// Drawing only: the kitchen's state and the current screen in, pixels out. The
// 1280x720 room is scaled to fit the window and centred, the margin filled with
// the backdrop colour. All food is drawn with canvas shapes — no image files,
// no network — so the screenshots are renders of this code alone.
import { CHEF, COOK, FIELD, FONT, FONT_DISPLAY, HEARTS, PALETTE, SHIFT, STATIONS } from './config.js';
import { INGREDIENTS, PANTRY_ORDER, matchingRecipe } from './recipes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** Draw one ingredient as a small food icon, centred at (x, y), about `size` wide. */
export function drawIngredientIcon(context, id, x, y, size, burnt) {
  const half = size / 2;
  context.save();
  context.translate(x, y);
  if (burnt) {
    context.fillStyle = '#2b1a1e';
    context.beginPath();
    context.arc(0, 0, half * 0.9, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#5e2c33';
    context.beginPath();
    context.arc(-half * 0.3, -half * 0.2, half * 0.35, 0, Math.PI * 2);
    context.arc(half * 0.3, half * 0.25, half * 0.3, 0, Math.PI * 2);
    context.fill();
    context.restore();
    return;
  }
  if (id === 'bun') {
    context.fillStyle = '#e8b96a';
    context.beginPath();
    context.arc(0, half * 0.25, half * 0.85, Math.PI, 0);
    context.fill();
    context.fillStyle = '#c98f3d';
    context.fillRect(-half * 0.85, half * 0.25, half * 1.7, half * 0.22);
    context.fillStyle = '#fdf6ea';
    for (const sx of [-0.4, 0, 0.4]) {
      context.beginPath();
      context.ellipse(sx * half, -half * 0.35, half * 0.09, half * 0.14, 0, 0, Math.PI * 2);
      context.fill();
    }
  } else if (id === 'patty') {
    context.fillStyle = '#8a4b32';
    roundRect(context, -half * 0.9, -half * 0.35, half * 1.8, half * 0.7, half * 0.3);
    context.fill();
    context.strokeStyle = '#5e2f1e';
    context.lineWidth = 2;
    for (const sx of [-0.45, 0, 0.45]) {
      context.beginPath();
      context.moveTo(sx * half, -half * 0.3);
      context.lineTo(sx * half, half * 0.3);
      context.stroke();
    }
  } else if (id === 'lettuce') {
    context.fillStyle = '#7bc96f';
    for (const [ox, oy, r] of [[-0.45, 0.1, 0.45], [0, -0.25, 0.5], [0.45, 0.1, 0.45]]) {
      context.beginPath();
      context.arc(ox * half, oy * half, r * half, 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = '#4d9a4a';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -half * 0.5);
    context.lineTo(0, half * 0.4);
    context.stroke();
  } else if (id === 'tomato') {
    context.fillStyle = '#e2574c';
    context.beginPath();
    context.arc(0, 0, half * 0.85, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#f2a49c';
    context.beginPath();
    context.arc(0, 0, half * 0.55, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#e2574c';
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(0, 0, half * 0.5, a, a + 0.5);
      context.fill();
    }
    context.fillStyle = '#7bc96f';
    context.beginPath();
    context.ellipse(0, -half * 0.8, half * 0.3, half * 0.14, 0, 0, Math.PI * 2);
    context.fill();
  } else if (id === 'cheese') {
    context.fillStyle = '#f2c94c';
    context.beginPath();
    context.moveTo(-half * 0.85, half * 0.55);
    context.lineTo(half * 0.85, half * 0.55);
    context.lineTo(half * 0.85, -half * 0.15);
    context.closePath();
    context.fill();
    context.fillStyle = '#d9a41f';
    for (const [ox, oy] of [[-0.4, 0.25], [0.25, 0.3], [0.45, 0.05]]) {
      context.beginPath();
      context.arc(ox * half, oy * half, half * 0.11, 0, Math.PI * 2);
      context.fill();
    }
  } else if (id === 'egg') {
    context.fillStyle = '#fdf6ea';
    context.beginPath();
    context.ellipse(0, 0, half * 0.9, half * 0.65, 0.3, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#f2a93d';
    context.beginPath();
    context.arc(half * 0.1, 0, half * 0.38, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffe08a';
    context.beginPath();
    context.arc(half * 0.02, -half * 0.08, half * 0.15, 0, Math.PI * 2);
    context.fill();
  } else if (id === 'noodle') {
    context.strokeStyle = '#f2d98a';
    context.lineWidth = size * 0.14;
    context.lineCap = 'round';
    for (let i = 0; i < 4; i += 1) {
      context.beginPath();
      context.arc(0, (i - 1.5) * half * 0.4, half * 0.7, 0.3, Math.PI - 0.3);
      context.stroke();
    }
    context.strokeStyle = '#d9b95e';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, half * 0.7, 0.3, Math.PI - 0.3);
    context.stroke();
  } else if (id === 'sauce') {
    context.fillStyle = '#c65d7b';
    context.beginPath();
    context.moveTo(-half * 0.35, -half * 0.9);
    context.lineTo(half * 0.35, -half * 0.9);
    context.lineTo(half * 0.55, half * 0.7);
    context.quadraticCurveTo(0, half * 0.95, -half * 0.55, half * 0.7);
    context.closePath();
    context.fill();
    context.fillStyle = '#fdf6ea';
    context.fillRect(-half * 0.3, -half * 0.9, half * 0.6, half * 0.25);
    context.fillStyle = '#ffe08a';
    context.beginPath();
    context.arc(0, half * 0.25, half * 0.22, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawProgressRing(context, x, y, radius, fraction, goodFrom, goodTo, burntAt) {
  context.save();
  context.lineWidth = 7;
  context.strokeStyle = 'rgba(0,0,0,0.35)';
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.stroke();
  const color = fraction >= burntAt ? PALETTE.bad : fraction >= goodFrom ? PALETTE.good : PALETTE.warn;
  context.strokeStyle = color;
  context.beginPath();
  context.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.min(1, fraction) * Math.PI * 2);
  context.stroke();
  context.restore();
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const fonts = new Map();

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function text(value, x, y, size, color, align, font) {
    const key = `${size}:${font || FONT}`;
    if (!fonts.has(key)) fonts.set(key, `${size}px ${font || FONT}`);
    context.font = fonts.get(key);
    context.fillStyle = color;
    context.textAlign = align || 'left';
    context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  function drawRoom(state) {
    // Wall and sunset window.
    context.fillStyle = PALETTE.wall;
    context.fillRect(0, 0, FIELD.width, 180);
    context.fillStyle = PALETTE.wallLow;
    context.fillRect(0, 150, FIELD.width, 30);
    const win = { x: 1010, y: 14, width: 254, height: 146 };
    const sky = context.createLinearGradient(0, win.y, 0, win.y + win.height);
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.55, PALETTE.skyMid);
    sky.addColorStop(1, PALETTE.skyLow);
    context.fillStyle = sky;
    context.fillRect(win.x, win.y, win.width, win.height);
    // The sun sinks as the shift runs out.
    const dayFraction = 1 - state.timeLeft / SHIFT.seconds;
    const sunX = win.x + 44 + dayFraction * (win.width - 88);
    const sunY = win.y + 42 + dayFraction * 44;
    context.fillStyle = PALETTE.sunCore;
    context.beginPath();
    context.arc(sunX, sunY, 26, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = 'rgba(255, 224, 138, 0.35)';
    context.beginPath();
    context.arc(sunX, sunY, 30, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#8a4b5e';
    context.beginPath();
    context.moveTo(win.x, win.y + win.height);
    context.lineTo(win.x + 80, win.y + 100);
    context.lineTo(win.x + 160, win.y + win.height);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(win.x + 130, win.y + win.height);
    context.lineTo(win.x + 200, win.y + 108);
    context.lineTo(win.x + win.width, win.y + win.height);
    context.closePath();
    context.fill();
    context.fillStyle = '#5e2c33';
    context.fillRect(win.x + win.width / 2 - 4, win.y, 8, win.height);
    context.fillRect(win.x, win.y + win.height / 2 - 4, win.width, 8);
    context.strokeStyle = PALETTE.counterEdge;
    context.lineWidth = 6;
    context.strokeRect(win.x, win.y, win.width, win.height);
    // Tiled floor.
    const tile = 80;
    for (let ty = 180; ty < 592; ty += tile) {
      for (let tx = 40; tx < 1240; tx += tile) {
        const even = ((tx - 40) / tile + (ty - 180) / tile) % 2 === 0;
        context.fillStyle = even ? PALETTE.floorA : PALETTE.floorB;
        context.fillRect(tx, ty, tile, tile);
      }
    }
    context.fillStyle = 'rgba(0,0,0,0.08)';
    context.fillRect(40, 180, 1200, 412);
  }

  function drawOrderBoard(state) {
    const board = { x: 168, y: 14, width: 824, height: 158 };
    context.fillStyle = PALETTE.boardFrame;
    roundRect(context, board.x - 6, board.y - 6, board.width + 12, board.height + 12, 10);
    context.fill();
    context.fillStyle = PALETTE.board;
    roundRect(context, board.x, board.y, board.width, board.height, 8);
    context.fill();
    text('ORDER BOARD', board.x + 18, board.y + 30, 19, PALETTE.boardFrame, 'left', FONT_DISPLAY);
    text('serve the ticket before its bar runs out', board.x + 170, board.y + 29, 15, PALETTE.chalk, 'left');
    if (state.orders.length === 0) {
      text('No orders yet — the evening crowd is on its way…', board.x + 18, board.y + 92, 20, PALETTE.chalk, 'left');
      return;
    }
    const ticketWidth = 258;
    state.orders.forEach((order, index) => {
      const tx = board.x + 14 + index * (ticketWidth + 10);
      const ty = board.y + 40;
      const urgent = order.patience / order.maxPatience < 0.35;
      context.fillStyle = urgent && Math.floor(performance.now() / 300) % 2 === 0 ? '#5a3a34' : '#f4ecd8';
      roundRect(context, tx, ty, ticketWidth, 100, 8);
      context.fill();
      text(order.recipe.name, tx + 12, ty + 26, 19, PALETTE.ink, 'left', FONT_DISPLAY);
      order.recipe.needs.forEach((need, ni) => {
        drawIngredientIcon(context, need, tx + 24 + ni * 40, ty + 52, 30);
      });
      const barX = tx + 12;
      const barY = ty + 78;
      const fraction = Math.max(0, order.patience / order.maxPatience);
      context.fillStyle = '#c9b896';
      context.fillRect(barX, barY, ticketWidth - 24, 10);
      context.fillStyle = urgent ? PALETTE.bad : fraction < 0.6 ? PALETTE.warn : PALETTE.good;
      context.fillRect(barX, barY, (ticketWidth - 24) * fraction, 10);
      text(`${Math.ceil(order.patience)}s`, tx + ticketWidth - 12, ty + 88, 13, PALETTE.ink, 'right');
    });
  }

  function drawHud(state, best) {
    // Timer: the sun bar across the top centre is the shift clock.
    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    const timerText = `${mins}:${String(secs).padStart(2, '0')}`;
    text(`☀ ${timerText}`, 640, 196, 26, PALETTE.text, 'center', FONT_DISPLAY);
    const barWidth = 220;
    context.fillStyle = 'rgba(0,0,0,0.35)';
    context.fillRect(640 - barWidth / 2, 204, barWidth, 8);
    context.fillStyle = state.rush ? PALETTE.warn : PALETTE.sun;
    context.fillRect(640 - barWidth / 2, 204, barWidth * (state.timeLeft / SHIFT.seconds), 8);
    if (state.rush) {
      text('SUNSET RUSH!', 640, 232, 20, PALETTE.warn, 'center', FONT_DISPLAY);
    }
    // Coins, hearts and combo, top corners of the floor.
    text(`◉ ${state.coins} coins`, 56, 222, 24, PALETTE.coin, 'left', FONT_DISPLAY);
    text(`Best ${best}`, 56, 248, 16, PALETTE.muted, 'left');
    let heartX = 1240;
    for (let i = 0; i < HEARTS; i += 1) {
      context.fillStyle = i < state.hearts ? PALETTE.heart : PALETTE.heartEmpty;
      context.beginPath();
      context.arc(heartX - 34, 214, 11, 0, Math.PI * 2);
      context.arc(heartX - 14, 214, 11, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.moveTo(heartX - 44, 220);
      context.lineTo(heartX - 4, 220);
      context.lineTo(heartX - 24, 244);
      context.closePath();
      context.fill();
      heartX -= 52;
    }
    text(`Served ${state.served}`, 1240, 248, 16, PALETTE.muted, 'right');
    if (state.combo >= 2) {
      text(`COMBO x${state.combo}`, 640, 262, 20, PALETTE.highlight, 'center', FONT_DISPLAY);
    }
    if (state.serveFlash > 0) {
      text(`+${state.lastServePay}  ${state.lastServeName} served!`, 640, 292, 22, PALETTE.good, 'center', FONT_DISPLAY);
    }
  }

  function drawStationLabel(x, y, label, active) {
    context.fillStyle = active ? PALETTE.highlight : PALETTE.text;
    text(label, x, y, 16, active ? PALETTE.highlight : PALETTE.text, 'center', FONT_DISPLAY);
  }

  function drawStations(state, nearest, binId) {
    // The trash bin on the top wall, beside the order board.
    const trash = STATIONS.trash;
    context.fillStyle = PALETTE.steelDark;
    roundRect(context, trash.x, trash.y, trash.width, trash.height, 8);
    context.fill();
    context.fillStyle = PALETTE.steel;
    roundRect(context, trash.x + 8, trash.y + 8, trash.width - 16, trash.height - 16, 6);
    context.fill();
    drawStationLabel(trash.x + trash.width / 2, trash.y + trash.height + 20, 'TRASH', nearest === 'trash');
    // The serving hatch on the right-hand floor, with its bell.
    const serve = STATIONS.serve;
    const ready = matchingRecipe(state.plate);
    context.fillStyle = PALETTE.counter;
    roundRect(context, serve.x, serve.y, serve.width, serve.height, 8);
    context.fill();
    context.fillStyle = PALETTE.counterTop;
    context.fillRect(serve.x, serve.y, serve.width, 16);
    context.fillStyle = PALETTE.steel;
    context.beginPath();
    context.arc(serve.x + serve.width / 2, serve.y + 50, 15, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.steelDark;
    context.fillRect(serve.x + serve.width / 2 - 4, serve.y + 60, 8, 10);
    if (nearest === 'serve') {
      context.strokeStyle = PALETTE.highlight;
      context.lineWidth = 4;
      roundRect(context, serve.x - 3, serve.y - 3, serve.width + 6, serve.height + 6, 10);
      context.stroke();
    }
    drawStationLabel(serve.x + serve.width / 2, serve.y - 8, ready ? `SERVE: ${ready.name}` : 'SERVE', nearest === 'serve');
    if (ready) {
      text('Press E / Q', serve.x + serve.width / 2, serve.y + serve.height + 20, 14, PALETTE.highlight, 'center');
    }

    // The middle island: chop board, grill, pot, plate counter.
    const island = [
      { rect: STATIONS.chop, name: 'chop', label: 'CHOP BOARD' },
      { rect: STATIONS.grill, name: 'grill', label: 'GRILL' },
      { rect: STATIONS.pot, name: 'pot', label: 'POT' },
      { rect: STATIONS.plate, name: 'plate', label: 'PLATE COUNTER' },
    ];
    for (const item of island) {
      const r = item.rect;
      const active = nearest === item.name;
      context.fillStyle = PALETTE.counter;
      roundRect(context, r.x, r.y, r.width, r.height, 10);
      context.fill();
      context.fillStyle = PALETTE.counterTop;
      roundRect(context, r.x, r.y + 6, r.width, 22, 8);
      context.fill();
      if (active) {
        context.strokeStyle = PALETTE.highlight;
        context.lineWidth = 4;
        roundRect(context, r.x - 3, r.y - 3, r.width + 6, r.height + 6, 12);
        context.stroke();
      }
      drawStationLabel(r.x + r.width / 2, r.y + r.height + 22, item.label, active);
    }

    // Chop board: a wooden board, the item being chopped, and its progress.
    const chop = STATIONS.chop;
    context.fillStyle = '#e8c9a8';
    roundRect(context, chop.x + 30, chop.y + 28, 130, 44, 6);
    context.fill();
    if (state.chopSlot) {
      drawIngredientIcon(context, state.chopSlot.id, chop.x + 95, chop.y + 50, 34);
      if (!state.chopSlot.done) {
        drawProgressRing(context, chop.x + 152, chop.y + 50, 14, state.chopSlot.timer / COOK.chopSeconds, 0, 1, 2);
      } else {
        text('READY', chop.x + 152, chop.y + 56, 13, PALETTE.good, 'center', FONT_DISPLAY);
      }
    } else {
      context.fillStyle = '#6d452c';
      roundRect(context, chop.x + 88, chop.y + 38, 14, 24, 3);
      context.fill();
    }

    // Grill: dark grates, the patty, heat glow and its cooking ring.
    const grill = STATIONS.grill;
    context.fillStyle = '#3a3230';
    roundRect(context, grill.x + 24, grill.y + 26, 152, 46, 8);
    context.fill();
    context.strokeStyle = '#6f7c86';
    context.lineWidth = 3;
    for (let i = 0; i < 5; i += 1) {
      context.beginPath();
      context.moveTo(grill.x + 34 + i * 32, grill.y + 30);
      context.lineTo(grill.x + 34 + i * 32, grill.y + 68);
      context.stroke();
    }
    if (state.grillSlot) {
      const sizzling = state.grillSlot.timer < COOK.pattyBurnt;
      if (sizzling) {
        context.fillStyle = 'rgba(255, 179, 71, 0.35)';
        context.beginPath();
        context.arc(grill.x + 100, grill.y + 49, 24 + Math.sin(performance.now() / 90) * 2, 0, Math.PI * 2);
        context.fill();
      }
      drawIngredientIcon(context, 'patty', grill.x + 100, grill.y + 49, 40, !sizzling);
      drawProgressRing(context, grill.x + 172, grill.y + 49, 15, state.grillSlot.timer / COOK.pattyBurnt, COOK.pattyPerfect / COOK.pattyBurnt, 1, 1);
    }

    // Pot: a steel pot with steam, the egg, and its cooking ring.
    const pot = STATIONS.pot;
    context.fillStyle = PALETTE.steel;
    context.beginPath();
    context.ellipse(pot.x + 95, pot.y + 52, 62, 26, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#5e7a8c';
    context.beginPath();
    context.ellipse(pot.x + 95, pot.y + 48, 50, 18, 0, 0, Math.PI * 2);
    context.fill();
    if (state.potSlot) {
      drawIngredientIcon(context, 'egg', pot.x + 95, pot.y + 46, 30, state.potSlot.timer >= COOK.eggBurnt);
      drawProgressRing(context, pot.x + 162, pot.y + 48, 14, state.potSlot.timer / COOK.eggBurnt, COOK.eggPerfect / COOK.eggBurnt, 1, 1);
    }
    context.strokeStyle = 'rgba(255, 246, 232, 0.7)';
    context.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      const sway = Math.sin(performance.now() / 400 + i) * 5;
      context.beginPath();
      context.moveTo(pot.x + 70 + i * 24 + sway, pot.y + 26);
      context.quadraticCurveTo(pot.x + 78 + i * 24, pot.y + 12, pot.x + 70 + i * 24 - sway, pot.y + 2);
      context.stroke();
    }

    // Plate counter: the big plate and every ingredient already on it.
    const plateRect = STATIONS.plate;
    const plateX = plateRect.x + plateRect.width / 2;
    const plateY = plateRect.y + 48;
    context.fillStyle = PALETTE.plate;
    context.beginPath();
    context.ellipse(plateX, plateY, 74, 26, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = PALETTE.plateRim;
    context.lineWidth = 4;
    context.beginPath();
    context.ellipse(plateX, plateY, 74, 26, 0, 0, Math.PI * 2);
    context.stroke();
    if (state.plate.length > 0) {
      state.plate.forEach((id, i) => {
        drawIngredientIcon(context, id, plateX - 44 + i * 30, plateY - 14 - (i % 2) * 8, 30);
      });
      const recipe = matchingRecipe(state.plate);
      if (recipe) {
        text('READY TO SERVE', plateX, plateY - 56, 15, PALETTE.good, 'center', FONT_DISPLAY);
      }
    } else {
      text('empty plate', plateX, plateY + 4, 14, '#9a8a70', 'center');
    }

    // Pantry: eight bins along the bottom counter, each with its food and name.
    const pantry = STATIONS.pantry;
    context.fillStyle = PALETTE.counter;
    roundRect(context, pantry.x, pantry.y, pantry.width, pantry.height, 10);
    context.fill();
    context.fillStyle = PALETTE.counterTop;
    context.fillRect(pantry.x, pantry.y, pantry.width, 14);
    const binWidth = pantry.width / PANTRY_ORDER.length;
    PANTRY_ORDER.forEach((id, index) => {
      const bx = pantry.x + index * binWidth;
      const active = nearest === 'pantry' && binId === id;
      context.fillStyle = active ? 'rgba(255, 224, 138, 0.22)' : 'rgba(0,0,0,0.12)';
      context.fillRect(bx + 4, pantry.y + 18, binWidth - 8, pantry.height - 24);
      if (active) {
        context.strokeStyle = PALETTE.highlight;
        context.lineWidth = 3;
        context.strokeRect(bx + 4, pantry.y + 18, binWidth - 8, pantry.height - 24);
      }
      drawIngredientIcon(context, id, bx + binWidth / 2, pantry.y + 42, 38);
      const prep = INGREDIENTS[id].prep;
      const tag = prep === 'none' ? 'ready' : prep === 'chop' ? 'chop it' : prep === 'grill' ? 'grill it' : 'boil it';
      text(INGREDIENTS[id].name, bx + binWidth / 2, pantry.y + 74, 15, PALETTE.text, 'center', FONT_DISPLAY);
      text(tag, bx + binWidth / 2, pantry.y + 88, 11, PALETTE.muted, 'center');
      if (index > 0) {
        context.fillStyle = PALETTE.counterEdge;
        context.fillRect(bx, pantry.y + 18, 2, pantry.height - 24);
      }
    });
  }

  function drawChef(state) {
    const chef = state.chef;
    const bob = chef.walking ? Math.sin(performance.now() / 90) * 2.5 : 0;
    const x = chef.x;
    const y = chef.y + bob;
    context.fillStyle = PALETTE.shadow;
    context.beginPath();
    context.ellipse(x, chef.y + 28, 24, 7, 0, 0, Math.PI * 2);
    context.fill();
    // Legs, coat, apron, arms and head.
    context.fillStyle = '#4a2f26';
    context.fillRect(x - 14, y + 14, 10, 14);
    context.fillRect(x + 4, y + 14, 10, 14);
    context.fillStyle = PALETTE.chefCoat;
    roundRect(context, x - 20, y - 8, 40, 28, 9);
    context.fill();
    context.fillStyle = PALETTE.chefApron;
    roundRect(context, x - 14, y + 2, 28, 18, 5);
    context.fill();
    context.fillStyle = PALETTE.chefSkin;
    context.fillRect(x - 22, y - 4, 7, 16);
    context.fillRect(x + 15, y - 4, 7, 16);
    context.beginPath();
    context.arc(x, y - 20, 15, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PALETTE.chefHair;
    context.beginPath();
    context.arc(x, y - 26, 14, Math.PI, 0);
    context.fill();
    // Tall chef hat.
    context.fillStyle = PALETTE.chefHat;
    roundRect(context, x - 13, y - 46, 26, 24, 7);
    context.fill();
    context.fillRect(x - 17, y - 26, 34, 6);
    // Face looks the way the chef walks.
    context.fillStyle = PALETTE.ink;
    context.beginPath();
    context.arc(x + chef.facing * 5, y - 20, 2.2, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(x + chef.facing * 8, y - 14, 3, 0, Math.PI);
    context.stroke();
    // Whatever is carried rides above the hat, easy to read at a glance.
    if (state.carried) {
      drawIngredientIcon(context, state.carried.id, x, y - 62, 34, state.carried.burnt);
      if (!state.carried.ready && !state.carried.burnt) {
        text('raw', x, y - 84, 12, PALETTE.warn, 'center', FONT_DISPLAY);
      }
    }
  }

  function drawHint(state) {
    if (state.hintTimer <= 0) return;
    const message = state.hint;
    context.font = `16px ${FONT}`;
    const width = Math.min(900, context.measureText(message).width + 36);
    context.fillStyle = PALETTE.panel;
    roundRect(context, 640 - width / 2, 540, width, 34, 17);
    context.fill();
    context.strokeStyle = PALETTE.panelLine;
    context.lineWidth = 1.5;
    roundRect(context, 640 - width / 2, 540, width, 34, 17);
    context.stroke();
    text(message, 640, 562, 16, PALETTE.text, 'center');
  }

  function drawPanel(title, lines, prompt) {
    const width = 640;
    const height = 150 + lines.length * 32;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = 'rgba(0,0,0,0.45)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.panel;
    roundRect(context, x, y, width, height, 14);
    context.fill();
    context.strokeStyle = PALETTE.panelLine;
    context.lineWidth = 3;
    roundRect(context, x, y, width, height, 14);
    context.stroke();
    text(title, FIELD.width / 2, y + 64, 46, PALETTE.highlight, 'center', FONT_DISPLAY);
    lines.forEach((line, index) => {
      text(line, FIELD.width / 2, y + 112 + index * 32, 20, PALETTE.text, 'center');
    });
    text(prompt, FIELD.width / 2, y + height - 30, 21, PALETTE.coin, 'center', FONT_DISPLAY);
  }

  function drawTitle(state, best) {
    drawPanel(
      'SUNSET SKILLET',
      [
        'Mira’s little kitchen by the sea. Cook what the board asks for,',
        'before the sun goes down and the customers walk away.',
        'Walk: WASD / arrows / click  •  Use a station: E / Space / click it',
        'Serve a finished dish: Q at the window  •  Pause: P  •  Mute: M',
        `Best shift so far: ${best} coins`,
      ],
      'Press Space or click to open the kitchen',
    );
  }

  function drawOver(state, best) {
    const lines = [
      state.hearts <= 0 ? 'The customers lost patience — the kitchen closes early.' : 'The sun has set. Service is over.',
      `Served ${state.served} dishes  •  ${state.expired} orders lost  •  Best combo x${state.bestCombo}`,
      `Coins earned: ${state.coins}   •   Best shift: ${best}`,
    ];
    drawPanel('SHIFT OVER', lines, 'Press Space or click to cook again');
  }

  /** Paint one frame: the room, the stations, the chef, the HUD, then any panel. */
  function draw(state, screen, best, extra) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawRoom(state);
    drawOrderBoard(state);
    drawStations(state, extra.nearest, extra.binId);
    drawChef(state);
    drawHud(state, best);
    drawHint(state);
    if (state.expireFlash > 0) {
      context.strokeStyle = 'rgba(255, 93, 108, 0.7)';
      context.lineWidth = 10;
      context.strokeRect(5, 5, FIELD.width - 10, FIELD.height - 10);
    }
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_PAUSED) drawPanel('PAUSED', ['The grill waits. The sun waits. Breathe.'], 'Press P or Space to keep cooking');
    else if (screen === SCREEN_OVER) drawOver(state, best);
    if (extra.muted) {
      text('Muted (M)', 1240, 40, 14, PALETTE.muted, 'right');
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
