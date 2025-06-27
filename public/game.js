const bananaEl = document.getElementById('banana');
const inventoryEl = document.getElementById('inventory');
const collectionEl = document.getElementById('collection');
let bananas = [];
let collection = JSON.parse(localStorage.getItem('collection') || '[]');

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
    if (b.rare) {
      const btn = document.createElement('button');
      btn.textContent = 'Add to Collection';
      btn.addEventListener('click', () => {
        collection.push(b);
        saveCollection();
        updateCollection();
        btn.disabled = true;
      });
      div.appendChild(btn);
    }
    inventoryEl.appendChild(div);
  });
}

function updateCollection() {
  collectionEl.innerHTML = '';
  collection.forEach(b => {
    const div = document.createElement('div');
    div.className = 'banana-item';
    div.innerHTML = `<div class="emoji">${b.emoji}</div><div>${b.type}</div>`;
    collectionEl.appendChild(div);
  });
}

function saveCollection() {
  localStorage.setItem('collection', JSON.stringify(collection));
}

bananaEl.addEventListener('click', () => {
  const b = randomBanana();
  bananas.unshift(b);
  updateInventory();
});

updateInventory();
updateCollection();
