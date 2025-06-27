# Banana Collector Game

A simple web game where you collect bananas, some of which are rare and wear hats.
Rare types include Shiny (✨) and Rainbow (🌈) bananas in addition to the original
Top Hat and Graduation varieties. Rare bananas can be added to your personal
collection using the button that appears next to them. The collection sits in the
top corner of the page and stays visible as you play. It is stored in your browser
so it persists between visits. New bananas now appear first so you always see the
latest ones at the top.

If you manage to grab ten ordinary bananas in a row the game resets your stash,
forcing you to start collecting again.

Scores are now submitted to a global leaderboard using Cloudflare Pages
Functions and KV storage so everyone sees the same results.

## Setup

This project is designed to run on **Cloudflare Pages** with Functions.

1. Create a Pages project from this repository.
2. In the Cloudflare dashboard go to **Pages → Functions → KV Namespaces** and
   create a binding named `SCORES` (the namespace name can be anything).
3. Deploy the site. Cloudflare will automatically detect the `functions/`
   folder and expose `/submit-score` and `/get-scores` endpoints.
4. After deployment open your site URL to start collecting bananas!
   If you receive a `405 Method Not Allowed` error when submitting scores,
   make sure your project is deployed as **Cloudflare Pages** with Functions
   enabled so the `/submit-score` and `/get-scores` routes are handled by the
   backend code.

## Leaderboard

Click **Save Name/PIN** to store your credentials in the browser. The first time
you save (or if you leave the PIN field blank) a random 7‑digit PIN is
generated. Keep this PIN safe – you need the same username and PIN to update
your score later or from another device. You can sign in on another computer by
entering the same username and PIN.

When you hit **Submit Score** the game sends a request to `/submit-score` with
your username, PIN and current score. Scores are stored in the `SCORES` KV
namespace and `/get-scores` returns the global leaderboard sorted by score.
Use the **Show Leaderboard** button in the game to toggle the leaderboard
overlay and see the top scores.

If you want to run the backend separately as a Cloudflare Worker instead of
Pages Functions, copy the files in `functions/` to a Worker project and bind the
same KV namespace.

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
