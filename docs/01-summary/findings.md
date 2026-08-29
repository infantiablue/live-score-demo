# Demo package

The demo is an independent Node package at `/Users/truong/repos/live-score-demo`. It serves a responsive scoreboard and a server-side API proxy without importing any Techika code.

## Run

1. Put `API_FOOTBALL_KEY` in `.env`.
2. Run `npm test`.
3. Run `npm start`.
4. Open `http://localhost:4173`.

The page polls once per minute, backs off failed requests, pauses while hidden, refreshes when visible, and marks the feed stale after 90 seconds.

## SOURCES (LAYER 2 NAVIGATION)

[../02-analysis/architecture.md](../02-analysis/architecture.md)  
→ Complete request flow and reliability behavior.
