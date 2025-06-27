const bananaEl = document.getElementById('banana');
const inventoryEl = document.getElementById('inventory');
const collectionEl = document.getElementById('collection');
const collectionAreaEl = document.getElementById('collection-area');
const toggleBtn = document.getElementById('collection-toggle');
const usernameInput = document.getElementById('username');
const saveScoreBtn = document.getElementById('save-score');
const setNameBtn = document.getElementById('set-name');
const scoreEl = document.getElementById('score');
const leaderboardEl = document.getElementById('leaderboard');

const MAX_BANANAS = 8;
let bananas = [];
let collection = JSON.parse(localStorage.getItem('collection') || '[]');
let score = 0;

const savedName = localStorage.getItem('username');
if (savedName) {
  usernameInput.value = savedName;
}

toggleBtn.addEventListener('click', () => {
  if (collectionAreaEl.style.display === 'none') {
    collectionAreaEl.style.display = 'block';
    toggleBtn.textContent = 'Hide Collection';
  } else {
    collectionAreaEl.style.display = 'none';
    toggleBtn.textContent = 'Show Collection';
  }
});

function randomBanana() {
  const chance = Math.random();
  if (chance < 0.02) {
    return { emoji: '🍌✨', type: 'Shiny Banana', rare: true, added: false };
  } else if (chance < 0.04) {
    return { emoji: '🍌🌈', type: 'Rainbow Banana', rare: true, added: false };
  } else if (chance < 0.07) {
    return { emoji: '🍌🎩', type: 'Top Hat Banana', rare: true, added: false };
  } else if (chance < 0.10) {
    return { emoji: '🍌🎓', type: 'Graduation Banana', rare: true, added: false };
  } else {
    return { emoji: '🍌', type: 'Common Banana', rare: false, added: false };
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
      btn.textContent = b.added ? 'Added' : 'Add to Collection';
      btn.disabled = b.added;
      btn.addEventListener('click', () => {
        if (b.added) return;
        b.added = true;
        collection.push(b);
        saveCollection();
        updateCollection();
        btn.textContent = 'Added';
        btn.disabled = true;
      });
      div.appendChild(btn);
    }
    inventoryEl.appendChild(div);
  });
}

function updateCollection() {
  collectionEl.innerHTML = '';
  const counts = {};
  collection.forEach(b => {
    if (!counts[b.type]) {
      counts[b.type] = { emoji: b.emoji, count: 0 };
    }
    counts[b.type].count++;
  });
  Object.keys(counts).forEach(type => {
    const info = counts[type];
    const div = document.createElement('div');
    div.className = 'banana-item';
    div.innerHTML = `<div class="emoji">${info.emoji}</div><div>${type} x${info.count}</div>`;
    collectionEl.appendChild(div);
  });
  score = collection.length;
  updateScore();
}

function saveCollection() {
  localStorage.setItem('collection', JSON.stringify(collection));
}

function updateScore() {
  scoreEl.textContent = score;
}

function loadLeaderboard() {
  return JSON.parse(localStorage.getItem('leaderboard') || '[]');
}

function saveLeaderboard(data) {
  localStorage.setItem('leaderboard', JSON.stringify(data));
}

function updateLeaderboard() {
  const data = loadLeaderboard().sort((a, b) => b.score - a.score).slice(0, 10);
  leaderboardEl.innerHTML = '';
  data.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    leaderboardEl.appendChild(li);
  });
}

bananaEl.addEventListener('click', () => {
  const b = randomBanana();
  bananas.unshift(b);
  if (bananas.length > MAX_BANANAS) {
    bananas.pop();
  }
  updateInventory();
});

saveScoreBtn.addEventListener('click', () => {
  const storedName = localStorage.getItem('username') || usernameInput.value.trim() || 'Anonymous';
  const data = loadLeaderboard();
  data.push({ name: storedName, score: collection.length });
  saveLeaderboard(data);
  updateLeaderboard();
});

setNameBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    localStorage.setItem('username', name);
  }
});
updateLeaderboard();
updateInventory();
updateCollection();
