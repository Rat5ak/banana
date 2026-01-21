# 🍌 EPIC Banana Collector

> *The most EPIC banana collecting game ever created!*

Click the banana to collect. Some bananas are rare and wear fancy hats! Build your collection, climb the global leaderboard, and try not to get 15 common bananas in a row (or it's game over!).

![Game Preview](https://img.shields.io/badge/status-EPIC-gold?style=for-the-badge)

## 🎮 How to Play

1. **Click/tap the banana** to collect it
2. **Rare bananas** (✨ Shiny, 🌈 Rainbow, 🎩 Top Hat, 👑 Royal, etc.) can be added to your permanent collection
3. **Build combos** by clicking quickly for bonus points
4. **Avoid getting 15 common bananas in a row** or the game resets!

## 🏆 Leaderboard & Accounts

### New Players
1. Open the 🎮 Player panel (left side on desktop, bottom-left button on mobile)
2. Click **✨ New Player** tab
3. A random username is generated for you (click 🎲 to get a new one)
4. Click **💾 Save** - a secret PIN will be generated
5. **⚠️ WRITE DOWN YOUR PIN!** You need it to log back in later
6. Click **🚀 Submit Score** to save your score to the global leaderboard

### Returning Players
1. Open the 🎮 Player panel
2. Click **🔑 Returning** tab  
3. Enter your **exact username** (case-insensitive)
4. Enter your **PIN**
5. Click **💾 Save** to verify and log back in
6. Your score is now linked - submit new high scores anytime!

## 🍌 Banana Rarity

| Emoji | Type | Rarity | Points |
|-------|------|--------|--------|
| 🍌 | Common Banana | 60% | 1 |
| 🍌✨ | Shiny Banana | 15% | 5 |
| 🍌🌈 | Rainbow Banana | 10% | 10 |
| 🍌🎩 | Top Hat Banana | 8% | 15 |
| 🍌🎓 | Graduation Banana | 5% | 20 |
| 🍌👑 | Royal Banana | 1.5% | 50 |
| 🍌💎 | Diamond Banana | 0.5% | 100 |

## 📱 Mobile Support

- **Optimized for touch** - instant tap response, no delays
- **Bottom-sheet drawers** slide up from the bottom
- **Swipe down** to close drawers
- **PWA installable** - add to home screen for app-like experience
- **Safe area support** for notched phones (iPhone X+)

## 🔧 Technical Setup

### Quick Start (Static Hosting)

The game works on any static host (GitHub Pages, Netlify, Vercel, etc.) with **JSONBin.io** for the leaderboard:

1. Go to [jsonbin.io](https://jsonbin.io) and create a free account
2. Create a new bin with this content: `{"scores":[]}`
3. Copy the **Bin ID** from the URL
4. Edit `public/jsonbin-config.js`:
   ```js
   const JSONBIN_BIN_ID = 'your-bin-id-here';
   ```
5. Make the bin **public** (or add your API key for private bins)
6. Deploy to any static host!

### Cloudflare Pages (Original Setup)

For Cloudflare Pages with KV storage (serverless backend):

1. Create a Pages project from this repository
2. In Cloudflare dashboard: **Pages → Functions → KV Namespaces**
3. Create a binding named `SCORES`
4. Deploy - the `functions/` folder auto-configures endpoints

### Local Development

```bash
# Install dependencies (just for the dev server)
npm install

# Start local server
npx serve public

# Or use any static server
python -m http.server 8080 --directory public
```

## 🔐 Security

- **PINs are hashed** using SHA-256 before storage (never stored in plain text)
- **Salt added** to prevent rainbow table attacks
- **No passwords transmitted** - only hash comparisons happen server-side
- PINs are stored locally for convenience but can be re-entered anytime

## 📁 Project Structure

```
banana/
├── public/
│   ├── index.html         # Main game HTML
│   ├── style.css          # All styles (~2400 lines of glory)
│   ├── game.js            # Game logic & UI (~990 lines)
│   ├── jsonbin-config.js  # Leaderboard API wrapper
│   └── manifest.json      # PWA manifest
├── functions/             # Cloudflare Pages serverless functions
│   ├── get-scores.js
│   └── submit-score.js
├── package.json
└── readme.md
```

## 🎨 Features

- ✨ Particle effects on banana clicks
- 🌟 Achievement popup system
- 🔥 Combo multiplier with visual feedback
- 🎵 Sound effects (generated via Web Audio API)
- 💾 Auto-saves collection to localStorage
- 📊 Global leaderboard via JSONBin.io
- 🎲 Random username generator for privacy
- 📱 Fully responsive mobile-first design
- 🌙 Epic dark theme with nebula backgrounds
- ⚡ Hardware-accelerated animations

## 🚀 Deployment

### GitHub Pages
```bash
# Push to main branch, enable Pages in repo settings
# Set source to: / (root) or /public if you move files
```

### Netlify / Vercel
Just connect the repo - auto-deploys on push!

### Manual
Upload the `public/` folder contents to any web server.

---

Made with 🍌 and excessive CSS gradients.
