// render.js — everything the player sees: the kitchen, the order board, the chef,
// the food, the timer and the title / results screens. One file, one job: drawing.

import { VIEW_W, VIEW_H, BOARD_H, INGREDIENTS, RECIPES } from './config.js';
import { starRating } from './state.js';

/** Rounded-rect path helper. */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** One ingredient's little portrait, drawn from shapes — no image files. */
export function drawIngredient(ctx, id, x, y, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'tomato') {
    ctx.fillStyle = '#e5484d';
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(-s * 0.5, -s * 0.4); ctx.lineTo(0, -s * 0.6); ctx.lineTo(s * 0.5, -s * 0.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(-s * 0.35, -s * 0.35, s * 0.25, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#43a047';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.55, Math.sin(a) * s * 0.55, s * 0.35, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#81c784';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'onion') {
    ctx.fillStyle = '#b388eb';
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ede7f6';
    ctx.lineWidth = 2;
    for (const r of [0.7, 0.45, 0.2]) {
      ctx.beginPath(); ctx.arc(0, 0, s * r, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = '#8d5a2b';
    roundRect(ctx, -s, -s * 0.7, size, s * 1.4, s * 0.5); ctx.fill();
    ctx.fillStyle = '#6d4520';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(-s * 0.6 + i * s * 0.4, 0, s * 0.12, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'pasta') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 3;
    for (const r of [0.85, 0.6, 0.35]) {
      ctx.beginPath(); ctx.arc(0, 0, s * r, 0.3, Math.PI * 2 - 0.4); ctx.stroke();
    }
    ctx.fillStyle = '#f9a825';
    ctx.beginPath(); ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'bun') {
    ctx.fillStyle = '#e8b06a';
    ctx.beginPath(); ctx.arc(0, s * 0.25, s, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillRect(-s, s * 0.25, size, s * 0.35);
    ctx.fillStyle = '#fff8e1';
    for (const [dx, dy] of [[-0.4, -0.35], [0, -0.55], [0.4, -0.35], [-0.2, -0.1], [0.25, -0.15]]) {
      ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.09, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.moveTo(-s, s * 0.7); ctx.lineTo(0, -s * 0.8); ctx.lineTo(s, s * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f9a825';
    for (const [dx, dy] of [[-0.3, 0.3], [0.25, 0.35], [0, 0]]) {
      ctx.beginPath(); ctx.arc(dx * s, dy * s, s * 0.14, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/** A white plate with the dish's ingredients arranged on it. */
export function drawPlate(ctx, x, y, contents, scale = 1) {
  const r = 30 * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f5f5f5';
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b0bec5';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.72, r * 0.56, 0, 0, Math.PI * 2); ctx.stroke();
  contents.forEach((id, i) => {
    const a = (i / Math.max(1, contents.length)) * Math.PI * 2 - Math.PI / 2;
    drawIngredient(ctx, id, Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.28, 26 * scale);
  });
  ctx.restore();
}

/** One station: its counter, label, and whatever sits or cooks on it. */
export function drawStation(ctx, s, time) {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  ctx.save();
  if (s.kind === 'crate') {
    ctx.fillStyle = '#8d6e63';
    roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = '#a1887f';
    roundRect(ctx, s.x + 4, s.y + 4, s.w - 8, s.h - 8, 6); ctx.fill();
    drawIngredient(ctx, s.ingredient, cx, cy - 8, 40);
    ctx.fillStyle = '#3e2723';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.label, cx, s.y + s.h - 8);
  } else if (s.kind === 'chop') {
    ctx.fillStyle = '#6d4c41';
    roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = '#d7ccc8';
    roundRect(ctx, s.x + 8, s.y + 10, s.w - 16, s.h - 24, 6); ctx.fill();
    if (s.item) {
      drawIngredient(ctx, s.item, cx, cy - 4, 36);
      if (!s.done) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(s.x + 8, s.y + s.h - 16, s.w - 16, 8);
        ctx.fillStyle = '#ffca28';
        ctx.fillRect(s.x + 8, s.y + s.h - 16, (s.w - 16) * Math.min(1, s.progress / 2.2), 8);
      } else {
        ctx.fillStyle = '#2e7d32';
        ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('READY!', cx, s.y + 14);
      }
    } else {
      ctx.fillStyle = '#8d6e63';
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CHOP', cx, cy + 4);
      ctx.fillStyle = '#3e2723';
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.label, cx, s.y + s.h - 4);
    }
  } else if (s.kind === 'grill') {
    ctx.fillStyle = '#37474f';
    roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 3;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(s.x + 10, s.y + i * 11); ctx.lineTo(s.x + s.w - 10, s.y + i * 11); ctx.stroke();
    }
    if (s.item) {
      if (s.burnt) {
        ctx.fillStyle = '#212121';
        roundRect(ctx, cx - 22, cy - 14, 44, 28, 8); ctx.fill();
        ctx.fillStyle = '#ff5252';
        ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('BURNT', cx, s.y + s.h - 6);
      } else {
        drawIngredient(ctx, 'patty', cx, cy - 4, 38);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(s.x + 8, s.y + s.h - 16, s.w - 16, 8);
        ctx.fillStyle = s.done ? '#66bb6a' : '#ff7043';
        ctx.fillRect(s.x + 8, s.y + s.h - 16, (s.w - 16) * Math.min(1, s.progress / 4.5), 8);
      }
    } else {
      ctx.fillStyle = '#eceff1';
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('GRILL', cx, s.y + s.h - 4);
    }
  } else if (s.kind === 'pot') {
    ctx.fillStyle = '#546e7a';
    roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = '#37474f';
    ctx.beginPath(); ctx.ellipse(cx, cy, 42, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.item ? '#4fc3f7' : '#263238';
    ctx.beginPath(); ctx.ellipse(cx, cy, 34, 19, 0, 0, Math.PI * 2); ctx.fill();
    if (s.item) {
      drawIngredient(ctx, 'pasta', cx, cy - 6, 30);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(s.x + 8, s.y + s.h - 16, s.w - 16, 8);
      ctx.fillStyle = s.done ? '#66bb6a' : '#4fc3f7';
      ctx.fillRect(s.x + 8, s.y + s.h - 16, (s.w - 16) * Math.min(1, s.progress / 3.5), 8);
    } else {
      ctx.fillStyle = '#eceff1';
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('POT', cx, s.y + s.h - 4);
    }
  } else if (s.kind === 'plate') {
    ctx.fillStyle = '#795548';
    roundRect(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
    ctx.fillStyle = '#d7ccc8';
    roundRect(ctx, s.x + 6, s.y + 6, s.w - 12, s.h - 12, 8); ctx.fill();
    if (s.plate) {
      drawPlate(ctx, cx, cy, s.plate.contents, 1.15);
    } else {
      ctx.fillStyle = '#8d6e63';
      ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('PLATING — build the dish here', cx, cy + 5);
    }
  } else if (s.kind === 'plates') {
    ctx.fillStyle = '#607d8b';
    roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = '#eceff1';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse(cx, cy - 12 + i * 10, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#eceff1';
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PLATES', cx, s.y + s.h - 4);
  } else if (s.kind === 'trash') {
    ctx.fillStyle = '#455a64';
    roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = '#37474f';
    roundRect(ctx, s.x + 14, s.y + 14, s.w - 28, s.h - 30, 6); ctx.fill();
    ctx.fillStyle = '#eceff1';
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('BIN', cx, s.y + s.h - 4);
  } else if (s.kind === 'serve') {
    ctx.fillStyle = '#b71c1c';
    roundRect(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
    ctx.fillStyle = '#ffebee';
    roundRect(ctx, s.x + 8, s.y + 26, s.w - 16, s.h - 36, 6); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SERVE', cx, s.y + 18);
    ctx.fillStyle = '#c62828';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('WINDOW', cx, s.y + s.h - 12);
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath(); ctx.arc(cx, cy + 10, 12 + Math.sin(time * 4) * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** The order board across the top: tickets, the shift timer and the coins. */
export function drawBoard(ctx, state) {
  ctx.save();
  ctx.fillStyle = '#263238';
  ctx.fillRect(0, 0, VIEW_W, BOARD_H);
  ctx.fillStyle = '#37474f';
  ctx.fillRect(0, BOARD_H - 6, VIEW_W, 6);
  // Shift timer: a bar you can feel, turning red in the rush.
  const frac = Math.max(0, state.shiftLeft / 180);
  const rush = state.shiftLeft <= 45;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, 16, 14, 300, 22, 6); ctx.fill();
  ctx.fillStyle = rush ? '#ff5252' : '#66bb6a';
  roundRect(ctx, 16, 14, 300 * frac, 22, 6); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  const mm = Math.floor(state.shiftLeft / 60);
  const ss = String(Math.ceil(state.shiftLeft % 60)).padStart(2, '0');
  ctx.fillText(`⏱ ${mm}:${ss}${rush ? '  RUSH!' : ''}`, 24, 31);
  // Coins and score.
  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`🪙 ${state.coins}`, 340, 33);
  ctx.fillStyle = '#eceff1';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Served ${state.served}   Missed ${state.missed}${state.combo > 1 ? `   🔥 x${state.combo}` : ''}`, 470, 32);
  ctx.fillStyle = '#b0bec5';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ORDERS', 700, 22);
  // Order tickets.
  state.orders.forEach((o, i) => {
    const x = 700 + i * 148;
    const y = 28;
    const urgent = o.left < 12;
    ctx.fillStyle = urgent && Math.floor(o.flash * 4) % 2 === 0 ? '#c62828' : '#eceff1';
    roundRect(ctx, x, y, 140, 78, 8); ctx.fill();
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(o.recipe.name, x + 8, y + 18);
    o.recipe.needs.forEach((id, j) => drawIngredient(ctx, id, x + 20 + j * 30, y + 38, 24));
    const tfrac = Math.max(0, o.left / o.total);
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(x + 8, y + 58, 124, 7);
    ctx.fillStyle = urgent ? '#e53935' : '#43a047';
    ctx.fillRect(x + 8, y + 58, 124 * tfrac, 7);
    ctx.fillStyle = '#263238';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${Math.ceil(o.left)}s`, x + 8, y + 76);
  });
  if (state.orders.length === 0) {
    ctx.fillStyle = '#90a4ae';
    ctx.font = 'italic 14px sans-serif';
    ctx.fillText('No orders yet — the lunch crowd is coming…', 700, 66);
  }
  // Hint line.
  if (state.message && state.time < state.messageUntil) {
    ctx.fillStyle = '#fffde7';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, VIEW_W / 2, BOARD_H + 118 + 16);
  }
  ctx.restore();
}

/** The chef: toque, apron, and whatever the hands carry above the head. */
export function drawChef(ctx, state) {
  const c = state.chef;
  ctx.save();
  ctx.translate(c.x, c.y);
  const bob = c.moving ? Math.sin(c.walkPhase) * 2 : 0;
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, c.r - 2, c.r * 0.9, c.r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  // Body / apron.
  ctx.fillStyle = '#eceff1';
  ctx.beginPath(); ctx.arc(0, bob, c.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4fc3f7';
  ctx.beginPath(); ctx.arc(0, bob + 6, c.r * 0.72, 0, Math.PI); ctx.fill();
  // Face: eyes look where the chef walks.
  const ex = c.dir === 'left' ? -6 : c.dir === 'right' ? 6 : 0;
  const ey = c.dir === 'up' ? -6 : c.dir === 'down' ? 4 : 0;
  ctx.fillStyle = '#263238';
  ctx.beginPath(); ctx.arc(-8 + ex, -4 + ey + bob, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8 + ex, -4 + ey + bob, 3, 0, Math.PI * 2); ctx.fill();
  // Toque.
  ctx.fillStyle = '#fff';
  roundRect(ctx, -16, -c.r - 16 + bob, 32, 18, 8); ctx.fill();
  ctx.beginPath(); ctx.arc(-10, -c.r - 14 + bob, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -c.r - 18 + bob, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -c.r - 14 + bob, 8, 0, Math.PI * 2); ctx.fill();
  // Carried item floats above the toque.
  if (state.carrying) {
    const item = state.carrying;
    if (item.kind === 'plate') {
      drawPlate(ctx, 0, -c.r - 34 + bob, item.contents, 0.8);
    } else {
      drawIngredient(ctx, item.id, 0, -c.r - 30 + bob, 30);
      if (item.kind === 'burnt') {
        ctx.fillStyle = '#ff5252';
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('BURNT', 0, -c.r - 48 + bob);
      }
    }
  }
  ctx.restore();
}

/** Particles: chopping bits, steam, celebration sparks. */
export function drawParticles(ctx, state) {
  ctx.save();
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Title screen: the game's name, the recipes, the controls. */
export function drawTitle(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(38,50,56,0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('SIZZLE & SERVE', VIEW_W / 2, 180);
  ctx.fillStyle = '#fff';
  ctx.font = '28px sans-serif';
  ctx.fillText('The Lunch Rush Kitchen', VIEW_W / 2, 224);
  ctx.fillStyle = '#b0bec5';
  ctx.font = '17px sans-serif';
  ctx.fillText('Run the kitchen. Chop, grill, boil, plate — and serve every ticket before it walks out.', VIEW_W / 2, 262);
  // The menu: four recipes, drawn as plates.
  RECIPES.forEach((r, i) => {
    const x = 240 + i * 270;
    drawPlate(ctx, x, 360, r.needs, 1.25);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(r.name, x, 430);
    ctx.fillStyle = '#b0bec5';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${r.needs.map((n) => INGREDIENTS[n].name).join(' + ')}`, x, 452);
    ctx.fillStyle = '#ffd54f';
    ctx.fillText(`${r.basePay}+ coins`, x, 474);
  });
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('WASD / arrows to move  •  E or click to use a counter  •  M to mute', VIEW_W / 2, 540);
  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 24px sans-serif';
  const pulse = 0.75 + Math.sin(state.time * 3) * 0.25;
  ctx.globalAlpha = pulse;
  ctx.fillText('Press ENTER or click to start the shift', VIEW_W / 2, 596);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#90a4ae';
  ctx.font = '14px sans-serif';
  ctx.fillText('3-minute shift · orders get faster · burnt patties go in the bin', VIEW_W / 2, 636);
  ctx.restore();
}

/** Results screen: coins, served, stars, and the replay prompt. */
export function drawGameOver(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(38,50,56,0.88)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText('SHIFT OVER!', VIEW_W / 2, 190);
  const stars = starRating(state);
  ctx.font = '56px sans-serif';
  ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), VIEW_W / 2, 270);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`You earned ${state.coins} coins`, VIEW_W / 2, 340);
  ctx.font = '20px sans-serif';
  ctx.fillText(`Served ${state.served} orders · missed ${state.missed} · best combo x${state.bestCombo}`, VIEW_W / 2, 384);
  ctx.fillStyle = '#b0bec5';
  ctx.font = '17px sans-serif';
  const verdict = stars === 3 ? 'Head-chef material. The lunch crowd loves you.'
    : stars === 2 ? 'A solid shift — the kitchen ran, mostly.'
    : stars === 1 ? 'The kitchen survived. Barely. One more shift?'
    : 'The tickets won this time. The kitchen needs you back.';
  ctx.fillText(verdict, VIEW_W / 2, 424);
  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 22px sans-serif';
  const pulse = 0.75 + Math.sin(state.time * 3) * 0.25;
  ctx.globalAlpha = pulse;
  ctx.fillText('Press R to cook another shift', VIEW_W / 2, 500);
  ctx.restore();
}

/** The whole frame: floor, stations, board, chef, particles, overlays. */
export function render(ctx, state) {
  // Warm wooden floor with a checker of tiles.
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#8d6e63';
  for (let y = BOARD_H; y < VIEW_H; y += 64) {
    for (let x = 0; x < VIEW_W; x += 64) {
      if (((x + y) / 64) % 2 === 0) ctx.fillRect(x, y, 64, 64);
    }
  }
  // Tiled wall band under the board.
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(0, BOARD_H, VIEW_W, 10);
  for (const s of state.stations) drawStation(ctx, s, state.time);
  drawParticles(ctx, state);
  drawChef(ctx, state);
  drawBoard(ctx, state);
  // Served flash.
  if (state.servedFlash > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.servedFlash);
    ctx.fillStyle = '#2e7d32';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SERVED! +${state.lastServedPay} coins`, VIEW_W / 2, 300);
    ctx.restore();
  }
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'over') drawGameOver(ctx, state);
}
