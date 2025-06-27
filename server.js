const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const leaderboard = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/leaderboard', (req, res) => {
  const sorted = leaderboard.slice().sort((a, b) => b.score - a.score);
  res.json(sorted.slice(0, 10));
});

app.post('/api/score', (req, res) => {
  const { name, score } = req.body;
  if (typeof name === 'string' && typeof score === 'number') {
    leaderboard.push({ name, score });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid payload' });
  }
});

app.listen(PORT, () => {
  console.log(`Banana game running on http://localhost:${PORT}`);
});
