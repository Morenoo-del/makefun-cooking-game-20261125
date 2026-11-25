# Sizzle & Serve — The Lunch Rush Kitchen

A fast, friendly cooking game for the
[make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137).
Run the kitchen for one three-minute lunch shift: grab ingredients from the
crates, chop them, grill the patties, boil the pasta, build each dish on the
plating counter, and serve it at the window before its ticket walks out.

![make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)
![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/Morenoo-del/makefun-cooking-game-20261125/rank.svg)
![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/Morenoo-del/makefun-cooking-game-20261125/reward.svg)

## How to play

- **Move** with WASD or the arrow keys, or click anywhere on the floor to walk there.
- **Use a counter** with E, Space, or by clicking the counter once you are next to it.
- **Crates** (top wall) give you raw ingredients: tomato, lettuce, onion, patty, pasta, bun, cheese.
- **Chop board** chops tomato, lettuce and onion. **Grill** cooks the patty — leave it
  too long and it burns. **Pot** boils the pasta.

- **Plates** come from the plate stack. Put a plate on the **plating counter**,
  then add finished ingredients to it — one of each, in any order.
- **Serve** finished plates at the red window on the right. A plate only pays
  when it matches a ticket exactly; the faster you serve, the bigger the tip.
- **Bin** throws away whatever you are carrying — burnt patties included.

## The menu

| Dish | Needs | Pays |
| --- | --- | --- |
| Garden Salad | chopped lettuce + chopped tomato | 24+ coins |
| Cheeseburger | bun + grilled patty + cheese | 34+ coins |
| Tomato Pasta | cooked pasta + chopped tomato | 30+ coins |
| Onion Melt | bun + grilled patty + cheese + chopped onion | 46+ coins |

Orders arrive faster as the shift goes on, and the last 45 seconds are a rush:
tickets flash red, the timer turns red, and every serve counts double toward
your combo. Serve three orders in a row without missing one to build a combo.

## Running it

Serve `game/` with any static server and open `game/index.html` in a desktop
browser — no build step, no network requests, no accounts. Or run
`node serve.ts` and open http://localhost:8080.

## Layout

- `game/index.html` — the page and canvas
- `game/src/main.js` — frame loop, keyboard and mouse input
- `game/src/config.js` — ingredients, recipes, timers and pay
- `game/src/state.js` — the game state and particles
- `game/src/kitchen.js` — the room: counters, crates and stations
- `game/src/orders.js` — the order board and serving
- `game/src/player.js` — the chef: movement and using stations
- `game/src/render.js` — everything drawn on screen
- `game/src/audio.js` — WebAudio kitchen sounds
- `game/src/shots.js` — staged scenes for the maker's screenshots (`?shot=`)
- `main.ts` — hands the game in (copies `game/` + `screenshots/`, writes `dossier.json`)
- `screenshots/` — renders of the game itself, taken in a browser

Built fresh for this bounty on [make.fun](https://make.fun) — original art,
names and code, no copied game.
