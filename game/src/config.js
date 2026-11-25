// config.js — every tunable number, ingredient and recipe of Sizzle & Serve.
// One file, one job: the game's data. Nothing here draws or moves anything.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const BOARD_H = 118; // order board strip across the top
export const SHIFT_SECONDS = 180; // one lunch shift lasts three minutes
export const CARRY_MAX = 1; // the chef's hands hold one thing at a time
export const CHOP_SECONDS = 2.2;
export const GRILL_SECONDS = 4.5;
export const BOIL_SECONDS = 3.5;
export const BURN_SECONDS = 9; // a patty left on the grill past this is burnt
export const ORDER_MIN_SECONDS = 55;
export const ORDER_MAX_SECONDS = 90;
export const MAX_ACTIVE_ORDERS = 4;
export const START_SPAWN_SECONDS = 16;
export const END_SPAWN_SECONDS = 8;

/** Ingredient catalogue: id, display name, colour, whether it needs a station. */
export const INGREDIENTS = {
  tomato: { id: 'tomato', name: 'Tomato', color: '#e5484d', needs: 'chop', chopped: 'chopped tomato' },
  lettuce: { id: 'lettuce', name: 'Lettuce', color: '#4caf50', needs: 'chop', chopped: 'chopped lettuce' },
  onion: { id: 'onion', name: 'Onion', color: '#b388eb', needs: 'chop', chopped: 'chopped onion' },
  patty: { id: 'patty', name: 'Patty', color: '#8d5a2b', needs: 'grill', cooked: 'grilled patty' },
  pasta: { id: 'pasta', name: 'Pasta', color: '#f2c14e', needs: 'pot', cooked: 'cooked pasta' },
  bun: { id: 'bun', name: 'Bun', color: '#e8b06a', needs: null },
  cheese: { id: 'cheese', name: 'Cheese', color: '#ffd23f', needs: null },
};

/** What a carried thing is: a raw ingredient, a finished one, or a plate. */
export function makeCarried(kind, id) {
  return { kind, id }; // kind: 'raw' | 'ready' | 'plate'
}

/** A plate's contents are ready-ingredient ids, in the order they were added. */
export function makePlate() {
  return { kind: 'plate', contents: [] };
}

/** Recipes: id, name, the ready-ingredient ids a plate must hold, base pay, blurb. */
export const RECIPES = [
  {
    id: 'garden-salad',
    name: 'Garden Salad',
    needs: ['lettuce', 'tomato'],
    basePay: 24,
    blurb: 'Crisp lettuce, fresh tomato. The lunchtime classic.',
  },
  {
    id: 'cheeseburger',
    name: 'Cheeseburger',
    needs: ['bun', 'patty', 'cheese'],
    basePay: 34,
    blurb: 'Bun, grilled patty, melting cheese. The crowd favourite.',
  },
  {
    id: 'tomato-pasta',
    name: 'Tomato Pasta',
    needs: ['pasta', 'tomato'],
    basePay: 30,
    blurb: 'Silky pasta under chopped tomato. Simple, beloved.',
  },
  {
    id: 'onion-melt',
    name: 'Onion Melt',
    needs: ['bun', 'patty', 'cheese', 'onion'],
    basePay: 46,
    blurb: 'The full works: burger, cheese and sweet chopped onion.',
  },
];

/** Order difficulty ramps with the shift: early orders are the easy three. */
export function recipesAvailableAt(elapsedSeconds) {
  const unlocked = elapsedSeconds < 60 ? RECIPES.slice(0, 3) : RECIPES;
  return unlocked;
}

/** Coins for serving a plate: base pay plus a tip that shrinks as the order ages. */
export function payFor(recipe, secondsLeft, orderSeconds) {
  const tip = Math.round(16 * Math.max(0, secondsLeft / orderSeconds));
  return recipe.basePay + tip;
}

/** The three live make.fun badges the README shows are not game data; they live in README.md. */
export const GAME_TITLE = 'Sizzle & Serve';
export const GAME_SUBTITLE = 'The Lunch Rush Kitchen';
