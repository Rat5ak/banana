# Banana Collector Game

A simple web game where you collect bananas, some of which are rare and wear hats.
Rare types now include Shiny (✨) and Rainbow (🌈) bananas in addition to the original Top Hat and Graduation varieties.
Rare bananas can be added to your personal collection using the button that appears
next to them. The collection sits in the top corner of the page and stays visible
as you play. It is stored in your browser so it persists between visits. New bananas
now appear first so you always see the latest ones at the top.
next to them. The collection is stored in your browser so it persists between
visits. You can also enter a name and submit your score to an in-memory
leaderboard to compete with friends.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser to `http://localhost:3000` and start collecting bananas!

## Leaderboard

Use the **Set Name** button to store your name locally. When you click
**Submit Score**, your name and the number of bananas in your collection are
saved to a leaderboard in your browser's local storage. The top scores are
displayed in the leaderboard list.
