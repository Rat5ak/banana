const bananaEl = document.getElementById('banana');
const inventoryEl = document.getElementById('inventory');
const collectionEl = document.getElementById('collection');
const collectionAreaEl = document.getElementById('collection-area');
const toggleBtn = document.getElementById('collection-toggle');
const usernameInput = document.getElementById('username');
const pinInput = document.getElementById('pin');
const saveScoreBtn = document.getElementById('save-score');
const setCredsBtn = document.getElementById('set-credentials');
const scoreEl = document.getElementById('score');
const leaderboardEl = document.getElementById('leaderboard');
const leaderboardAreaEl = document.getElementById('leaderboard-area');
const leaderboardToggleBtn = document.getElementById('leaderboard-toggle');

const MAX_BANANAS = 8;
let bananas = [];
let collection = JSON.parse(localStorage.getItem('collection') || '[]');
let score = 0;
let commonStreak = 0;

const savedName = localStorage.getItem('username');
const savedPin = localStorage.getItem('pin');
if (savedName) {
  usernameInput.value = savedName;
}
if (savedPin) {
  pinInput.value = savedPin;
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

leaderboardToggleBtn.addEventListener('click', () => {
  if (leaderboardAreaEl.style.display === 'none') {
    leaderboardAreaEl.style.display = 'block';
    leaderboardToggleBtn.textContent = 'Hide Leaderboard';
    updateLeaderboard();
  } else {
    leaderboardAreaEl.style.display = 'none';
    leaderboardToggleBtn.textContent = 'Show Leaderboard';
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

async function loadGlobalLeaderboard() {
  const res = await fetch('/get-scores');
  if (!res.ok) return [];
  return await res.json();
}

async function updateLeaderboard() {
  const data = (await loadGlobalLeaderboard()).slice(0, 10);
  leaderboardEl.innerHTML = '';
  data.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.username}: ${entry.score}`;
    leaderboardEl.appendChild(li);
  });
}

function createParticleEffect(x, y) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.position = 'absolute';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.width = Math.random() * 6 + 2 + 'px';
    particle.style.height = particle.style.width;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    
    const angle = (Math.PI * 2 * i) / 12;
    const velocity = Math.random() * 3 + 2;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    document.body.appendChild(particle);
    
    let posX = x;
    let posY = y;
    let opacity = 1;
    
    const animate = () => {
      posX += vx;
      posY += vy - 0.5; // gravity effect
      opacity -= 0.02;
      
      particle.style.left = posX + 'px';
      particle.style.top = posY + 'px';
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(particle);
      }
    };
    
    requestAnimationFrame(animate);
  }
}

bananaEl.addEventListener('click', (e) => {
  // Create particle effect at click position
  const rect = bananaEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  createParticleEffect(x, y);
  
  const b = randomBanana();
  bananas.unshift(b);

  if (b.type === 'Common Banana') {
    commonStreak++;
  } else {
    commonStreak = 0;
  }

  if (commonStreak >= 10) {
    alert('10 common bananas in a row! Game over.');
    bananas = [];
    collection = [];
    saveCollection();
    score = 0;
    commonStreak = 0;
    updateInventory();
    updateCollection();
    return;
  }

  if (bananas.length > MAX_BANANAS) {
    bananas.pop();
  }
  updateInventory();
});

saveScoreBtn.addEventListener('click', async () => {
  let name = localStorage.getItem('username') || usernameInput.value.trim();
  if (!name) name = 'Anonymous';
  let pin = localStorage.getItem('pin') || pinInput.value.trim();
  if (!pin) {
    pin = Math.floor(1000000 + Math.random() * 9000000).toString();
    alert(`Your new PIN is ${pin}. Keep it safe!`);
    localStorage.setItem('pin', pin);
    pinInput.value = pin;
  }
  localStorage.setItem('username', name);
  usernameInput.value = name;

  await fetch('/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: name, pin, score: collection.length })
  }).then(res => {
    if (res.status === 403) {
      alert('Incorrect PIN for this username');
    }
  });

  updateLeaderboard();
});

setCredsBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  let pin = pinInput.value.trim();
  if (!pin) {
    pin = Math.floor(1000000 + Math.random() * 9000000).toString();
    alert(`Your new PIN is ${pin}. Keep it safe!`);
  }
  if (name) {
    localStorage.setItem('username', name);
    usernameInput.value = name;
  }
  localStorage.setItem('pin', pin);
  pinInput.value = pin;
});
updateLeaderboard();
updateInventory();
updateCollection();
