// Dapur Kilat — recipes and ingredient catalogue (original Indonesian street-food dishes).
// A component id is either raw (rice, egg, chili, chicken, noodles, veg, sauce) or
// processed (cooked_rice, fried_egg, chopped_chili, chopped_chicken, cooked_chicken,
// cooked_noodles, chopped_veg). A finished dish is a plate whose components match a
// recipe exactly, in any order.

export const COMPONENTS = {
  rice:           { label: 'Rice',     color: '#f5f0e1', shape: 'grain',  raw: true },
  egg:            { label: 'Egg',      color: '#fff3c4', shape: 'egg',    raw: true },
  chili:          { label: 'Chili',    color: '#e63946', shape: 'chili',  raw: true },
  chicken:        { label: 'Chicken',  color: '#f4a261', shape: 'drum',   raw: true },
  noodles:        { label: 'Noodles',  color: '#f7c948', shape: 'noodle', raw: true },
  veg:            { label: 'Veg',      color: '#2a9d8f', shape: 'leaf',   raw: true },
  sauce:          { label: 'Sauce',    color: '#8b4513', shape: 'drop',   raw: true },
  cooked_rice:    { label: 'Cooked Rice',   color: '#fff8dc', shape: 'grain',  from: 'rice' },
  fried_egg:      { label: 'Fried Egg',     color: '#ffd60a', shape: 'egg',    from: 'egg' },
  chopped_chili:  { label: 'Chopped Chili', color: '#ef476f', shape: 'bits',   from: 'chili' },
  chopped_chicken:{ label: 'Chopped Chicken', color: '#e07a5f', shape: 'bits', from: 'chicken' },
  cooked_chicken: { label: 'Cooked Chicken', color: '#bc6c25', shape: 'drum',  from: 'chicken' },
  cooked_noodles: { label: 'Cooked Noodles', color: '#f4a261', shape: 'noodle', from: 'noodles' },
  chopped_veg:    { label: 'Chopped Veg',   color: '#43aa8b', shape: 'bits',   from: 'veg' },
  burnt:          { label: 'Burnt!',   color: '#222222', shape: 'burnt',  from: null },
};

// Which raw ingredient can be chopped, and what it becomes.
export const CHOP_MAP = { chili: 'chopped_chili', chicken: 'chopped_chicken', veg: 'chopped_veg' };
// Which raw ingredient can be cooked on the stove, and what it becomes.
export const COOK_MAP = { rice: 'cooked_rice', noodles: 'cooked_noodles', chicken: 'cooked_chicken', egg: 'fried_egg' };

export const RECIPES = [
  { id: 'nasi_goreng', name: 'Nasi Goreng', price: 120, needs: ['cooked_rice', 'fried_egg', 'chopped_chili'] },
  { id: 'mie_goreng',  name: 'Mie Goreng',  price: 110, needs: ['cooked_noodles', 'chopped_veg', 'fried_egg'] },
  { id: 'sate_ayam',   name: 'Sate Ayam',   price: 150, needs: ['chopped_chicken', 'cooked_chicken', 'sauce'] },
  { id: 'gado_gado',   name: 'Gado-Gado',   price: 100, needs: ['chopped_veg', 'fried_egg', 'sauce'] },
];

export function recipeById(id) { return RECIPES.find((r) => r.id === id) || null; }

// True when the plate's components are exactly the recipe's needs (order-free).
export function plateMatches(plateComponents, recipe) {
  if (!plateComponents || plateComponents.length !== recipe.needs.length) return false;
  const have = [...plateComponents].sort();
  const want = [...recipe.needs].sort();
  return have.every((c, i) => c === want[i]);
}

export function isPlate(item) { return !!item && item.kind === 'plate'; }
export function makePlate() { return { kind: 'plate', components: [] }; }
export function makeItem(id) { return { kind: 'item', id }; }
export function itemLabel(item) {
  if (!item) return 'empty hands';
  if (item.kind === 'plate') {
    const SHORT = { cooked_rice: 'Rice', fried_egg: 'Egg', chopped_chili: 'Chili', cooked_noodles: 'Noodles', chopped_veg: 'Veg', chopped_chicken: 'Chicken', cooked_chicken: 'Chicken', sauce: 'Sauce' };
    return 'Plate [' + item.components.map((c) => SHORT[c] || c).join(', ') + ']';
  }
  return COMPONENTS[item.id] ? COMPONENTS[item.id].label : item.id;
}
