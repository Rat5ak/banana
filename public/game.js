// 🍌 EPIC BANANA COLLECTOR - THE DANKEST GAME EVER! 🍌
const bananaEl = document.getElementById('banana');
const inventoryEl = document.getElementById('inventory');
const collectionEl = document.getElementById('collection');
const usernameInput = document.getElementById('username');
const pinInput = document.getElementById('pin');
const saveScoreBtn = document.getElementById('save-score');
const setCredsBtn = document.getElementById('set-credentials');
const scoreEl = document.getElementById('score');
const leaderboardEl = document.getElementById('leaderboard');
const leaderboardSearchInput = document.getElementById('leaderboard-search');
const achievementPopup = document.getElementById('achievement-popup');
const comboDisplay = document.getElementById('combo-display');
const flyingBananas = document.getElementById('flying-bananas');
const matrixRain = document.getElementById('matrix-rain');

// DRAWER ELEMENTS
const leftDrawer = document.getElementById('left-drawer');
const rightDrawer = document.getElementById('right-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const generateNameBtn = document.getElementById('generate-name');

// Setup drawer toggles (buttons are now outside drawers)
document.querySelectorAll('.drawer-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isLeft = btn.classList.contains('left-toggle');
    const drawer = isLeft ? leftDrawer : rightDrawer;
    
    // Close other drawers
    document.querySelectorAll('.side-drawer.open').forEach(d => {
      if (d !== drawer) d.classList.remove('open');
    });
    
    // Toggle this drawer
    drawer.classList.toggle('open');
    
    // Update button states
    updateToggleVisibility();
  });
});

// Helper to update toggle button visibility and backdrop
function updateToggleVisibility() {
  const anyOpen = document.querySelector('.side-drawer.open');
  
  document.querySelectorAll('.drawer-toggle').forEach(b => {
    const isLeft = b.classList.contains('left-toggle');
    const targetDrawer = isLeft ? leftDrawer : rightDrawer;
    if (targetDrawer.classList.contains('open')) {
      b.classList.add('hidden');
    } else {
      b.classList.remove('hidden');
    }
  });
  
  // Show/hide backdrop on mobile
  if (anyOpen && window.innerWidth <= 768) {
    drawerBackdrop?.classList.add('visible');
  } else {
    drawerBackdrop?.classList.remove('visible');
  }
}

// Helper to close all drawers
function closeAllDrawers() {
  document.querySelectorAll('.side-drawer.open').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.drawer-toggle').forEach(b => b.classList.remove('hidden'));
  drawerBackdrop?.classList.remove('visible');
}

// Close drawers when clicking backdrop or outside
drawerBackdrop?.addEventListener('click', closeAllDrawers);

document.addEventListener('click', (e) => {
  if (!e.target.closest('.side-drawer') && !e.target.closest('.drawer-toggle') && !e.target.closest('.drawer-backdrop')) {
    closeAllDrawers();
  }
});

// Mobile swipe-to-close for drawers
let touchStartY = 0;
let touchStartX = 0;

document.querySelectorAll('.drawer-content').forEach(content => {
  content.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  
  content.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchEndY - touchStartY;
    const deltaX = Math.abs(touchEndX - touchStartX);
    
    // Swipe down to close (on mobile where drawers come from bottom)
    if (deltaY > 60 && deltaX < 50 && window.innerWidth <= 768) {
      closeAllDrawers();
    }
  }, { passive: true });
});

// Login tab system
const tabNew = document.getElementById('tab-new');
const tabReturn = document.getElementById('tab-return');
let isReturningPlayer = false;

tabNew?.addEventListener('click', () => {
  isReturningPlayer = false;
  tabNew.classList.add('active');
  tabReturn.classList.remove('active');
  generateNameBtn.style.display = '';
  usernameInput.placeholder = 'Your epic name';
  // Generate a fresh name for new players
  if (!usernameInput.value) {
    const newName = window.BananaDB?.generateUsername?.() || generateLocalUsername();
    usernameInput.value = newName;
  }
});

tabReturn?.addEventListener('click', () => {
  isReturningPlayer = true;
  tabReturn.classList.add('active');
  tabNew.classList.remove('active');
  generateNameBtn.style.display = 'none';
  usernameInput.placeholder = 'Enter your username';
  usernameInput.value = '';
  pinInput.value = '';
});

// Generate random username button
generateNameBtn?.addEventListener('click', () => {
  // If they already have a PIN saved, warn them
  const hasSavedPin = localStorage.getItem('pin');
  if (hasSavedPin) {
    if (!confirm('Getting a new name will reset your PIN and you won\\'t be able to update your old score. Continue?')) {
      return;
    }
  }
  
  const newName = window.BananaDB?.generateUsername?.() || generateLocalUsername();
  usernameInput.value = newName;
  localStorage.setItem('username', newName);
  // Clear PIN when changing name
  pinInput.value = '';
  localStorage.removeItem('pin');
});

// Local fallback username generator
function generateLocalUsername() {
  const adjs = ['Epic', 'Turbo', 'Mega', 'Super', 'Cosmic', 'Neon', 'Wild', 'Chill'];
  const nouns = ['Banana', 'Monkey', 'Ninja', 'Gamer', 'Legend', 'Boss', 'Dude', 'Champ'];
  const adj = adjs[Math.floor(Math.random() * adjs.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${Math.floor(Math.random() * 999)}`;
}

// Auto-generate name if none exists
function ensureUsername() {
  if (!localStorage.getItem('username')) {
    const newName = window.BananaDB?.generateUsername?.() || generateLocalUsername();
    usernameInput.value = newName;
    localStorage.setItem('username', newName);
  }
}

// EPIC GAME VARIABLES
const MAX_BANANAS = 12;
let bananas = [];
let collection = JSON.parse(localStorage.getItem('collection') || '[]');
let score = 0;
let commonStreak = 0;
let comboCount = 0;
let comboMultiplier = 1;
let totalClicks = 0;
let rareCount = 0;

// AUDIO SYSTEM
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {
  click: null,
  rare: null,
  combo: null,
  achievement: null
};

// EPIC BANANA TYPES - EXPANDED!
const bananaTypes = [
  { emoji: '🍌', type: 'Common Banana', rare: false, chance: 0.60, points: 1 },
  { emoji: '🍌✨', type: 'Shiny Banana', rare: true, chance: 0.15, points: 5 },
  { emoji: '🍌🌈', type: 'Rainbow Banana', rare: true, chance: 0.10, points: 10 },
  { emoji: '🍌🎩', type: 'Top Hat Banana', rare: true, chance: 0.08, points: 15 },
  { emoji: '🍌🎓', type: 'Graduation Banana', rare: true, chance: 0.05, points: 20 },
  { emoji: '🍌👑', type: 'Royal Banana', rare: true, chance: 0.015, points: 50 },
  { emoji: '🍌🔥', type: 'Fire Banana', rare: true, chance: 0.003, points: 100 },
  { emoji: '🍌💎', type: 'Diamond Banana', rare: true, chance: 0.001, points: 500 },
  { emoji: '🍌🌟', type: 'Cosmic Banana', rare: true, chance: 0.0005, points: 1000 }
];

// ACHIEVEMENTS SYSTEM
const achievements = [
  { id: 'first_click', name: 'First Click!', description: 'You clicked your first banana!', icon: '🍌', condition: () => totalClicks >= 1 },
  { id: 'ten_clicks', name: 'Banana Enthusiast', description: 'Clicked 10 bananas!', icon: '🎯', condition: () => totalClicks >= 10 },
  { id: 'hundred_clicks', name: 'Banana Master', description: 'Clicked 100 bananas!', icon: '🏆', condition: () => totalClicks >= 100 },
  { id: 'first_rare', name: 'Rare Hunter', description: 'Found your first rare banana!', icon: '✨', condition: () => rareCount >= 1 },
  { id: 'combo_master', name: 'Combo Master', description: 'Achieved a 10x combo!', icon: '🔥', condition: () => comboMultiplier >= 10 },
  { id: 'diamond_finder', name: 'Diamond Seeker', description: 'Found a Diamond Banana!', icon: '💎', condition: () => collection.some(b => b.type === 'Diamond Banana') },
  { id: 'cosmic_legend', name: 'Cosmic Legend', description: 'Found the legendary Cosmic Banana!', icon: '🌟', condition: () => collection.some(b => b.type === 'Cosmic Banana') }
];

const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');

// Initialize epic systems
initializeAudioSystem();
initializeMatrixRain();
initializeFlyingBananas();
loadSavedData();

// EPIC AUDIO SYSTEM
function initializeAudioSystem() {
  // Create audio buffers for different sounds
  sounds.click = createToneBuffer(200, 0.1, 'sine');
  sounds.rare = createToneBuffer(400, 0.3, 'square');
  sounds.combo = createToneBuffer(600, 0.2, 'sawtooth');
  sounds.achievement = createToneBuffer(800, 0.5, 'triangle');
}

function createToneBuffer(frequency, duration, type = 'sine') {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    const t = i / audioContext.sampleRate;
    let sample = 0;
    
    switch(type) {
      case 'sine':
        sample = Math.sin(2 * Math.PI * frequency * t);
        break;
      case 'square':
        sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
        break;
      case 'sawtooth':
        sample = 2 * (t * frequency % 1) - 1;
        break;
      case 'triangle':
        sample = 2 * Math.abs(2 * (t * frequency % 1) - 1) - 1;
        break;
    }
    
    data[i] = sample * Math.exp(-t * 3) * 0.3; // Add decay envelope
  }
  
  return buffer;
}

function playSound(soundName) {
  if (!sounds[soundName]) return;
  
  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  
  source.buffer = sounds[soundName];
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  gainNode.gain.value = 0.1;
  source.start();
}

// MATRIX RAIN EFFECT
function initializeMatrixRain() {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン🍌';
  
  for (let i = 0; i < 50; i++) {
    const drop = document.createElement('div');
    drop.className = 'matrix-drop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDelay = Math.random() * 3 + 's';
    drop.style.animationDuration = (3 + Math.random() * 2) + 's';
    drop.textContent = chars[Math.floor(Math.random() * chars.length)];
    matrixRain.appendChild(drop);
  }
}

// FLYING BANANAS SYSTEM
function initializeFlyingBananas() {
  setInterval(() => {
    createFlyingBanana();
  }, 5000);
}

function createFlyingBanana() {
  if (!flyingBananas) return; // Element doesn't exist in new layout
  const banana = document.createElement('div');
  banana.className = 'flying-banana';
  banana.textContent = '🍌';
  banana.style.top = Math.random() * 80 + '%';
  banana.style.animationDuration = (6 + Math.random() * 4) + 's';
  flyingBananas.appendChild(banana);
  
  setTimeout(() => {
    if (banana.parentNode) {
      banana.parentNode.removeChild(banana);
    }
  }, 10000);
}

function loadSavedData() {
  const savedName = localStorage.getItem('username');
  const savedPin = localStorage.getItem('pin');
  
  if (savedName) {
    usernameInput.value = savedName;
  } else {
    // Auto-generate a fun username for new players
    const newName = window.BananaDB?.generateUsername?.() || generateLocalUsername();
    usernameInput.value = newName;
    localStorage.setItem('username', newName);
  }
  
  // Make username read-only - users get what they get!
  usernameInput.readOnly = true;
  usernameInput.style.cursor = 'default';
  
  if (savedPin) {
    pinInput.value = savedPin;
  }
  
  // Auto-load leaderboard and collection for the new layout
  updateLeaderboard();
  updateCollection();
}



// EPIC RANDOM BANANA FUNCTION
function randomBanana() {
  const rand = Math.random();
  let cumulativeChance = 0;
  
  // Sort by rarity (rarest first for dramatic effect)
  const sortedTypes = [...bananaTypes].sort((a, b) => a.chance - b.chance);
  
  for (const bananaType of sortedTypes) {
    cumulativeChance += bananaType.chance;
    if (rand < cumulativeChance) {
      return { 
        ...bananaType, 
        added: false,
        timestamp: Date.now()
      };
    }
  }
  
  // Fallback to common banana
  return { 
    emoji: '🍌', 
    type: 'Common Banana', 
    rare: false, 
    added: false, 
    points: 1,
    timestamp: Date.now()
  };
}

// EPIC PARTICLE SYSTEM OVERHAUL
function createEpicParticleEffect(x, y, bananaType) {
  const isRare = bananaType.rare;
  const particleCount = isRare ? 30 : 15;
  const particleTypes = ['normal', 'star', 'sparkle', 'confetti'];
  
  if (isRare) {
    particleTypes.push('banana', 'ring', 'trail');
    createFireworkBurst(x, y);
  }
  
  for (let i = 0; i < particleCount; i++) {
    const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    createParticle(x, y, particleType, isRare);
  }
  
  // Screen shake for rare bananas
  if (isRare) {
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 500);
  }
}

function createParticle(x, y, type, isRare) {
  const particle = document.createElement('div');
  const colors = isRare ? 
    ['#ff6b6b', '#4ecdc4', '#feca57', '#ff9ff3', '#54a0ff'] : 
    ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
  
  particle.className = `particle particle-${type}`;
  particle.style.position = 'absolute';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.zIndex = '1000';
  
  switch(type) {
    case 'banana':
      particle.textContent = '🍌';
      break;
    case 'star':
      particle.style.background = `radial-gradient(circle, #fff 0%, ${colors[Math.floor(Math.random() * colors.length)]} 100%)`;
      break;
    case 'sparkle':
      particle.style.background = `linear-gradient(45deg, ${colors[Math.floor(Math.random() * colors.length)]}, ${colors[Math.floor(Math.random() * colors.length)]})`;
      particle.style.borderRadius = '50%';
      break;
    case 'confetti':
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = '2px';
      break;
    case 'ring':
      particle.style.border = `2px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
      particle.style.background = 'transparent';
      break;
    case 'trail':
      particle.style.background = `linear-gradient(to bottom, ${colors[Math.floor(Math.random() * colors.length)]}, transparent)`;
      break;
    default:
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = '50%';
  }
  
  const angle = (Math.PI * 2 * Math.random());
  const velocity = Math.random() * (isRare ? 8 : 5) + 3;
  const vx = Math.cos(angle) * velocity;
  const vy = Math.sin(angle) * velocity;
  
  document.body.appendChild(particle);
  animateParticle(particle, x, y, vx, vy, type);
}

function animateParticle(particle, startX, startY, vx, vy, type) {
  let posX = startX;
  let posY = startY;
  let opacity = 1;
  let scale = 1;
  let rotation = 0;
  
  const animate = () => {
    posX += vx;
    posY += vy - 0.8; // Enhanced gravity
    opacity -= 0.015;
    rotation += 5;
    
    if (type === 'ring') {
      scale += 0.05;
    } else {
      scale -= 0.01;
    }
    
    particle.style.left = posX + 'px';
    particle.style.top = posY + 'px';
    particle.style.opacity = opacity;
    particle.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    
    if (opacity > 0 && scale > 0) {
      requestAnimationFrame(animate);
    } else {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }
  };
  
  requestAnimationFrame(animate);
}

function createFireworkBurst(x, y) {
  const burstCount = 50;
  const colors = ['#ff6b6b', '#4ecdc4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
  
  for (let i = 0; i < burstCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'firework-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    const angle = (Math.PI * 2 * i) / burstCount;
    const velocity = Math.random() * 10 + 5;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    document.body.appendChild(particle);
    
    let posX = x;
    let posY = y;
    let opacity = 1;
    
    const animateFirework = () => {
      posX += vx;
      posY += vy;
      opacity -= 0.02;
      
      particle.style.left = posX + 'px';
      particle.style.top = posY + 'px';
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animateFirework);
      } else {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }
    };
    
    requestAnimationFrame(animateFirework);
  }
}

// ACHIEVEMENT SYSTEM
function checkAchievements() {
  achievements.forEach(achievement => {
    if (!unlockedAchievements.includes(achievement.id) && achievement.condition()) {
      unlockAchievement(achievement);
    }
  });
}

function unlockAchievement(achievement) {
  unlockedAchievements.push(achievement.id);
  localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
  
  playSound('achievement');
  showAchievementPopup(achievement);
}

function showAchievementPopup(achievement) {
  const popup = achievementPopup;
  const icon = popup.querySelector('.achievement-icon');
  const title = popup.querySelector('.achievement-title');
  const description = popup.querySelector('.achievement-description');
  
  icon.textContent = achievement.icon;
  title.textContent = achievement.name;
  description.textContent = achievement.description;
  
  popup.classList.add('show');
  
  setTimeout(() => {
    popup.classList.remove('show');
  }, 4000);
}

// COMBO SYSTEM
function updateCombo() {
  comboCount++;
  
  if (comboCount >= 5) {
    comboMultiplier = Math.min(Math.floor(comboCount / 5) + 1, 20);
    showComboDisplay();
    
    if (comboCount % 5 === 0) {
      playSound('combo');
    }
  }
  
  // Reset combo after 2 seconds of inactivity
  clearTimeout(updateCombo.timeout);
  updateCombo.timeout = setTimeout(() => {
    comboCount = 0;
    comboMultiplier = 1;
    hideComboDisplay();
  }, 2000);
}

function showComboDisplay() {
  const display = comboDisplay;
  const multiplierEl = display.querySelector('.combo-multiplier');
  
  multiplierEl.textContent = `x${comboMultiplier}`;
  display.classList.add('show');
}

function hideComboDisplay() {
  comboDisplay.classList.remove('show');
}

// Floating points animation
function showFloatingPoints(x, y, points, isRare = false) {
  const container = document.getElementById('points-display');
  if (!container) return;
  
  const el = document.createElement('div');
  el.className = `floating-points${isRare ? ' rare' : ''}`;
  el.textContent = `+${points}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  container.appendChild(el);
  
  setTimeout(() => el.remove(), 1000);
}

// Score bump animation
function bumpScore() {
  scoreEl.classList.add('bump');
  setTimeout(() => scoreEl.classList.remove('bump'), 100);
}

// EPIC BANANA CLICK/TAP EVENT
function handleBananaTap(e) {
  console.log('🍌 Banana tapped!');
  
  // Prevent audio context issues
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Get click position for particles
  const rect = bananaEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  // Generate epic banana
  const b = randomBanana();
  bananas.unshift(b);
  totalClicks++;
  
  // Update combo system
  updateCombo();
  
  // Show floating points
  const points = (b.points || 1) * comboMultiplier;
  showFloatingPoints(x, y - 40, points, b.rare);
  bumpScore();
  
  // Play appropriate sound
  if (b.rare) {
    playSound('rare');
    rareCount++;
  } else {
    playSound('click');
  }
  
  // Create epic particle effects
  createEpicParticleEffect(x, y, b);
  
  // Handle common banana streak (but make it less punishing)
  if (b.type === 'Common Banana') {
    commonStreak++;
  } else {
    commonStreak = 0;
  }

  // Game over condition (increased threshold for more fun)
  if (commonStreak >= 15) {
    showGameOverModal();
    return;
  }

  // Manage inventory size
  if (bananas.length > MAX_BANANAS) {
    bananas.pop();
  }
  
  // Update displays
  updateInventory();
  checkAchievements();
  
  // Add epic banana rotation effect
  bananaEl.style.transform = `scale(1.3) rotate(${Math.random() * 40 - 20}deg)`;
  setTimeout(() => {
    bananaEl.style.transform = '';
  }, 200);
}

// Register click event (simpler - works better across all browsers)
bananaEl.addEventListener('click', handleBananaTap);
// Touch event for mobile with passive false to allow preventDefault
bananaEl.addEventListener('touchend', (e) => {
  e.preventDefault(); // Prevent ghost click
  handleBananaTap(e);
}, { passive: false });

function showGameOverModal() {
  const modal = document.createElement('div');
  modal.className = 'game-over-modal';
  modal.innerHTML = `
    <div class="game-over-content">
      <h2>💀 GAME OVER! 💀</h2>
      <p>You got ${commonStreak} common bananas in a row!</p>
      <p>Final Score: <span class="final-score">${score}</span></p>
      <p>Total Clicks: <span class="final-clicks">${totalClicks}</span></p>
      <button onclick="resetGame()" class="epic-button">🔄 Try Again</button>
      <button onclick="this.parentElement.parentElement.remove()" class="epic-button">❌ Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function resetGame() {
  bananas = [];
  collection = [];
  saveCollection();
  score = 0;
  commonStreak = 0;
  comboCount = 0;
  comboMultiplier = 1;
  totalClicks = 0;
  rareCount = 0;
  
  updateInventory();
  updateCollection();
  hideComboDisplay();
  
  // Remove any existing modals
  const modals = document.querySelectorAll('.game-over-modal');
  modals.forEach(modal => modal.remove());
}

// ENHANCED INVENTORY UPDATE
function updateInventory() {
  inventoryEl.innerHTML = '';
  bananas.forEach((b, index) => {
    const div = document.createElement('div');
    div.className = `banana-item ${b.rare ? 'rare-banana' : 'common-banana'}`;
    
    // Add rarity glow effect
    if (b.rare) {
      div.style.boxShadow = `0 0 20px ${getRarityColor(b.type)}`;
    }
    
    // Calculate score with multiplier
    const pointsWithMultiplier = b.points * comboMultiplier;
    
    div.innerHTML = `
      <div class="emoji">${b.emoji}</div>
      <div class="banana-name">${b.type}</div>
      <div class="banana-points">+${pointsWithMultiplier} pts</div>
      ${index === 0 ? '<div class="new-badge">NEW!</div>' : ''}
    `;
    
    if (b.rare) {
      const btn = document.createElement('button');
      btn.textContent = b.added ? '✓ Added' : '📚 Add to Collection';
      btn.className = 'epic-button collection-btn';
      btn.disabled = b.added;
      btn.addEventListener('click', () => {
        if (b.added) return;
        b.added = true;
        collection.push(b);
        saveCollection();
        updateCollection();
        btn.textContent = '✓ Added';
        btn.disabled = true;
        
        // Epic collection effect
        createEpicParticleEffect(
          btn.getBoundingClientRect().left + btn.offsetWidth / 2,
          btn.getBoundingClientRect().top + btn.offsetHeight / 2,
          b
        );
      });
      div.appendChild(btn);
    }
    
    inventoryEl.appendChild(div);
  });
}

function getRarityColor(type) {
  const colorMap = {
    'Shiny Banana': '#ffeb3b',
    'Rainbow Banana': '#e91e63',
    'Top Hat Banana': '#9c27b0',
    'Graduation Banana': '#3f51b5',
    'Royal Banana': '#ff9800',
    'Fire Banana': '#f44336',
    'Diamond Banana': '#00bcd4',
    'Cosmic Banana': '#4caf50'
  };
  return colorMap[type] || '#4ecdc4';
}

// ENHANCED COLLECTION UPDATE
function updateCollection() {
  collectionEl.innerHTML = '';
  const counts = {};
  let totalPoints = 0;
  
  collection.forEach(b => {
    if (!counts[b.type]) {
      counts[b.type] = { emoji: b.emoji, count: 0, points: b.points || 1 };
    }
    counts[b.type].count++;
    totalPoints += (b.points || 1);
  });
  
  // Sort by count (most collected first)
  const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  
  sorted.forEach(([type, info]) => {
    const div = document.createElement('div');
    const rarity = getRarityClass(type);
    div.className = `collection-item ${rarity}`;
    div.innerHTML = `
      <div class="emoji">${info.emoji}</div>
      <div class="banana-name">${type.replace(' Banana', '')}</div>
      <div class="banana-count">×${info.count}</div>
    `;
    collectionEl.appendChild(div);
  });
  
  score = totalPoints;
  updateScore();
}

function getRarityClass(type) {
  const rarities = {
    'Common': 'rarity-common',
    'Banana': 'rarity-common',
    'Shiny Banana': 'rarity-uncommon',
    'Rainbow Banana': 'rarity-rare',
    'Top Hat Banana': 'rarity-rare',
    'Graduation Banana': 'rarity-rare',
    'Royal Banana': 'rarity-epic',
    'Fire Banana': 'rarity-epic',
    'Diamond Banana': 'rarity-legendary',
    'Cosmic Banana': 'rarity-legendary'
  };
  return rarities[type] || 'rarity-common';
}

function saveCollection() {
  localStorage.setItem('collection', JSON.stringify(collection));
}

function updateScore() {
  scoreEl.textContent = score;
  
  // Epic score animations based on value
  if (score > 1000) {
    scoreEl.style.animation = 'epicScoreGlow 1s ease-in-out infinite alternate';
  } else if (score > 500) {
    scoreEl.style.animation = 'superScoreGlow 1.5s ease-in-out infinite alternate';
  } else {
    scoreEl.style.animation = 'scoreGlow 2s ease-in-out infinite alternate';
  }
}

// Keep existing enhanced functions but update these old ones

// ENHANCED LEADERBOARD FUNCTIONS
async function loadGlobalLeaderboard() {
  // Try JSONBin first if configured
  if (window.BananaDB?.isConfigured?.()) {
    try {
      return await window.BananaDB.getGlobalLeaderboard(10);
    } catch (err) {
      console.log('BananaDB error:', err);
    }
  }
  
  // Fallback to local storage
  return JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
}

function saveToLocalLeaderboard(username, score) {
  const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
  const existing = localScores.findIndex(e => e.username === username);
  
  if (existing >= 0) {
    if (score > localScores[existing].score) {
      localScores[existing].score = score;
    }
  } else {
    localScores.push({ username, score });
  }
  
  localScores.sort((a, b) => b.score - a.score);
  localStorage.setItem('localLeaderboard', JSON.stringify(localScores.slice(0, 20)));
}

async function updateLeaderboard(searchTerm = '') {
  let data = await loadGlobalLeaderboard();
  
  // Filter by search term if provided
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    data = data.filter(entry => entry.username.toLowerCase().includes(term));
  }
  
  data = data.slice(0, 10);
  leaderboardEl.innerHTML = '';
  
  if (data.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = searchTerm 
      ? '<span style="opacity:0.6;font-size:0.8rem">No players found 🔍</span>'
      : '<span style="opacity:0.6;font-size:0.8rem">No scores yet! Be first 🏆</span>';
    leaderboardEl.appendChild(li);
    return;
  }
  
  data.forEach((entry, index) => {
    const li = document.createElement('li');
    const medals = ['🥇', '🥈', '🥉'];
    const medal = searchTerm ? `#${index + 1}` : (medals[index] || `#${index + 1}`);
    li.innerHTML = `<span>${medal} ${entry.username}</span><span>${entry.score}</span>`;
    
    // Add special styling for top 3 (only when not searching)
    if (index < 3 && !searchTerm) {
      li.classList.add(`rank-${index + 1}`);
    }
    
    leaderboardEl.appendChild(li);
  });
}

// Leaderboard search with debounce
let searchTimeout;
leaderboardSearchInput?.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    updateLeaderboard(e.target.value.trim());
  }, 300);
});

// EPIC EVENT LISTENERS
saveScoreBtn.addEventListener('click', async () => {
  let name = localStorage.getItem('username') || usernameInput.value.trim();
  if (!name) name = 'Anonymous Epic Player';
  let pin = localStorage.getItem('pin') || pinInput.value.trim();
  
  if (!pin) {
    pin = Math.floor(1000000 + Math.random() * 9000000).toString();
    showAchievementPopup({
      icon: '🔐',
      name: 'PIN Generated!',
      description: `Your new PIN is ${pin}. Keep it safe!`
    });
    localStorage.setItem('pin', pin);
    pinInput.value = pin;
  }
  
  localStorage.setItem('username', name);
  usernameInput.value = name;

  // Always save locally as backup
  saveToLocalLeaderboard(name, score);

  // Try global save if configured
  if (window.BananaDB?.isConfigured?.()) {
    try {
      const result = await window.BananaDB.submitScore(name, pin, score);
      
      if (!result.success && result.error === 'wrong_pin') {
        showAchievementPopup({
          icon: '❌',
          name: 'Wrong PIN!',
          description: 'That username is taken with a different PIN'
        });
        updateLeaderboard();
        return;
      }
      
      if (result.newHighscore) {
        showAchievementPopup({
          icon: '🚀',
          name: 'NEW HIGH SCORE!',
          description: `${score} pts saved to global leaderboard!`
        });
      } else {
        showAchievementPopup({
          icon: '✅',
          name: 'Score Checked',
          description: `Your best is still higher!`
        });
      }
      updateLeaderboard();
      return;
    } catch (err) {
      console.log('Global submit failed:', err);
    }
  }

  // Local only fallback
  showAchievementPopup({
    icon: '💾',
    name: 'Saved Locally',
    description: `${score} pts saved! (Configure JSONBin for global)`
  });
  updateLeaderboard();
});

setCredsBtn.addEventListener('click', async () => {
  const name = usernameInput.value.trim();
  let pin = pinInput.value.trim();
  
  if (!name) {
    showAchievementPopup({
      icon: '⚠️',
      name: 'Need a Name!',
      description: 'Please enter or generate a username'
    });
    return;
  }
  
  // For returning players, verify credentials with server
  if (isReturningPlayer) {
    if (!pin) {
      showAchievementPopup({
        icon: '⚠️',
        name: 'Need PIN!',
        description: 'Enter your PIN to log back in'
      });
      return;
    }
    
    // Try to verify by checking if we can get player rank
    if (window.BananaDB?.isConfigured?.()) {
      const result = await window.BananaDB.submitScore(name, pin, 0);
      if (result.error === 'wrong_pin') {
        showAchievementPopup({
          icon: '❌',
          name: 'Wrong PIN!',
          description: 'That PIN doesn\'t match this username'
        });
        return;
      }
    }
    
    // Success - save locally
    localStorage.setItem('username', name);
    localStorage.setItem('pin', pin);
    
    showAchievementPopup({
      icon: '✅',
      name: 'Welcome Back!',
      description: `Logged in as ${name}`
    });
    
    // Switch back to new player mode visually
    tabNew?.click();
    return;
  }
  
  // New player flow
  if (!pin) {
    pin = Math.floor(1000000 + Math.random() * 9000000).toString();
    showAchievementPopup({
      icon: '🔐',
      name: 'PIN Generated!',
      description: `Your new PIN is ${pin}. Keep it safe!`
    });
  }
  
  localStorage.setItem('username', name);
  usernameInput.value = name;
  localStorage.setItem('pin', pin);
  pinInput.value = pin;
  
  showAchievementPopup({
    icon: '💾',
    name: 'Credentials Saved!',
    description: 'Your name and PIN have been saved locally'
  });
});

// ============================================
// INITIALIZE GAME
// ============================================
function initializeGame() {
  console.log('🎮 Game initializing...');
  console.log('🍌 Banana element:', bananaEl);
  
  if (!bananaEl) {
    console.error('❌ BANANA ELEMENT NOT FOUND!');
    return;
  }
  
  updateLeaderboard();
  updateInventory();
  updateCollection();
  
  // Create initial flying banana
  setTimeout(createFlyingBanana, 1000);
  
  // Epic welcome message (only on first visit)
  if (!localStorage.getItem('hasVisited')) {
    localStorage.setItem('hasVisited', 'true');
    setTimeout(() => {
      showAchievementPopup({
        icon: '🍌',
        name: 'Welcome to Epic Banana Collector!',
        description: 'Click the banana to start your epic journey!'
      });
    }, 1500);
  }
  
  console.log('✅ Game initialized!');
}

// Start the epic game!
initializeGame();
