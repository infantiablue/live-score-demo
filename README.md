# Live Score Demo

A standalone live football scoreboard using [API-Football v3](https://www.api-football.com/documentation-v3). It does not depend on or modify the Techika website.

## Run it

1. Create an API-Football account and copy your API key.
2. Copy `.env.example` to `.env`.
3. Replace the placeholder in `.env`:

   ```text
   API_FOOTBALL_KEY=your-real-key
   PORT=4173
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open [http://localhost:4173](http://localhost:4173).

The key stays in the Node server. The browser calls `/api/live-scores`; the server adds `x-apisports-key` while requesting `https://v3.football.api-sports.io/fixtures?live=all`.

## What the demo proves

- Polls once per minute instead of opening a persistent connection.
- Waits for each request to finish before scheduling the next one.
- Uses capped exponential backoff after failures.
- Stops opening requests while the tab is hidden and refreshes when visible.
- Labels data stale after 90 seconds.
- Keeps the API credential out of browser JavaScript.
- Normalizes the provider response before returning it to the browser.

## Commands

```bash
npm test
npm start
npm run dev
```

No package installation is required. The demo uses Node's built-in HTTP server, `fetch`, and test runner. Node 22.9 or newer is required for `--env-file-if-exists`.

## Structure

```text
live-score-demo/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src/
│   └── api-football.js
├── test/
│   ├── api-football.test.js
│   └── server.test.js
├── .env.example
├── package.json
└── server.js
```
