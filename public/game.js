const bananaEl = document.getElementById('banana');
const inventoryEl = document.getElementById('inventory');
let bananas = [];

function randomBanana() {
  const chance = Math.random();
  if (chance < 0.05) {
    return { emoji: '🍌🎩', type: 'Top Hat Banana', rare: true };
  } else if (chance < 0.10) {
    return { emoji: '🍌🎓', type: 'Graduation Banana', rare: true };
  } else {
    return { emoji: '🍌', type: 'Common Banana', rare: false };
  }
}

function updateInventory() {
  inventoryEl.innerHTML = '';
  bananas.forEach(b => {
    const div = document.createElement('div');
    div.className = 'banana-item';
    div.innerHTML = `<div class="emoji">${b.emoji}</div><div>${b.type}</div>`;
    inventoryEl.appendChild(div);
  });
}

bananaEl.addEventListener('click', () => {
  const b = randomBanana();
  bananas.push(b);
  updateInventory();
});

updateInventory();
