// 🍌 JSONBIN.IO LEADERBOARD CONFIG
// ================================
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://jsonbin.io (free, optional signup)
// 2. Click "Create a Bin" 
// 3. Paste this as the initial content: {"scores":[]}
// 4. Save it and copy the Bin ID (looks like: 65a1b2c3d4e5f6...)
// 5. (Optional) Create an API key for better limits: Account → API Keys → Create
// 6. Replace the values below:

const JSONBIN_BIN_ID = '6970a8d0ae596e708feab759';  // e.g., '65a1b2c3d4e5f6g7h8i9j0'
const JSONBIN_API_KEY = '';  // Optional - leave empty for public bins, or add your key for more requests

// ============================================
// DATABASE FUNCTIONS
// ============================================

const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function fetchScores() {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (JSONBIN_API_KEY) headers['X-Master-Key'] = JSONBIN_API_KEY;
    
    const res = await fetch(JSONBIN_URL + '/latest', { headers });
    if (!res.ok) throw new Error('Fetch failed');
    
    const data = await res.json();
    return data.record?.scores || [];
  } catch (err) {
    console.log('JSONBin fetch error:', err);
    return [];
  }
}

async function saveScores(scores) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (JSONBIN_API_KEY) {
      headers['X-Master-Key'] = JSONBIN_API_KEY;
    }
    
    const res = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ scores })
    });
    
    return res.ok;
  } catch (err) {
    console.log('JSONBin save error:', err);
    return false;
  }
}

// Simple hash for PIN
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ============================================
// PUBLIC API
// ============================================

async function getGlobalLeaderboard(limit = 10) {
  const scores = await fetchScores();
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function searchPlayer(searchTerm) {
  const scores = await fetchScores();
  const term = searchTerm.toLowerCase();
  return scores
    .filter(p => p.username.toLowerCase().includes(term))
    .sort((a, b) => b.score - a.score);
}

async function getPlayerRank(username) {
  const scores = await fetchScores();
  const sorted = scores.sort((a, b) => b.score - a.score);
  const index = sorted.findIndex(p => p.username.toLowerCase() === username.toLowerCase());
  
  if (index === -1) return null;
  
  return {
    rank: index + 1,
    total: sorted.length,
    score: sorted[index].score
  };
}

async function submitScore(username, pin, score) {
  const scores = await fetchScores();
  const pinHash = simpleHash(pin + 'banana');
  
  const existingIndex = scores.findIndex(p => p.username.toLowerCase() === username.toLowerCase());
  
  if (existingIndex >= 0) {
    const existing = scores[existingIndex];
    
    // Verify PIN
    if (existing.pinHash !== pinHash) {
      return { success: false, error: 'wrong_pin' };
    }
    
    // Update if higher
    if (score > existing.score) {
      scores[existingIndex].score = score;
      scores[existingIndex].updatedAt = new Date().toISOString();
      await saveScores(scores);
      return { success: true, message: 'highscore_updated', newHighscore: true };
    }
    
    return { success: true, message: 'score_not_higher', newHighscore: false };
  }
  
  // New player
  scores.push({
    username,
    pinHash,
    score,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  await saveScores(scores);
  return { success: true, message: 'new_user_created', newHighscore: true };
}

async function compareWithPlayer(myUsername, theirUsername) {
  const scores = await fetchScores();
  const me = scores.find(p => p.username.toLowerCase() === myUsername.toLowerCase());
  const them = scores.find(p => p.username.toLowerCase() === theirUsername.toLowerCase());
  return { me, them };
}

// Export
window.BananaDB = {
  getGlobalLeaderboard,
  searchPlayer,
  getPlayerRank,
  submitScore,
  compareWithPlayer,
  isConfigured: () => JSONBIN_BIN_ID !== 'YOUR_BIN_ID_HERE'
};

if (JSONBIN_BIN_ID === 'YOUR_BIN_ID_HERE') {
  console.log('🍌 JSONBin not configured - using local storage only');
} else {
  console.log('🍌 JSONBin connected!');
}
