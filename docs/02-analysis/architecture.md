# Architecture

## Request flow

```text
Browser
  └─ GET /api/live-scores every 60 seconds
       └─ standalone Node server
            └─ GET https://v3.football.api-sports.io/fixtures?live=all
               header: x-apisports-key (server only)
```

The browser never receives the API key. The server normalizes the provider response into a smaller contract containing fixture ID, league, teams, score, status, and server update time.

## Reliability behavior

The browser uses a recursive timeout rather than `setInterval`, so a slow request does not overlap the next one. Failures increase the retry delay up to five minutes. `visibilitychange` stops new work in a hidden tab and triggers a refresh when the reader returns. The UI calculates source age every second and marks the feed delayed after 90 seconds.

## Transport boundary

Polling matches the provider documentation's recommended one-minute call interval for fixtures in progress. The provider is still an HTTP request/response API; placing SSE or WebSockets in the browser would not make upstream data arrive faster. A future server can publish the normalized feed over SSE if many browser clients need one shared, low-latency stream.

## SOURCES (LAYER 3 NAVIGATION)

[../03-dossiers/api-football.md](../03-dossiers/api-football.md)  
→ API endpoint, required header, update frequency, and recommended call interval.
