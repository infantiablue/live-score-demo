# Standalone API-Football live score demo

Navigation for the independent demo package. The package is separate from the Techika site.

- [Run the demo](README.md) — setup, environment variable, commands, and file structure.
- [Updated Techika article](../techika/src/blog/polling-sse-websockets/00-index.md) — the guide now explains this standalone package, API proxy, polling loop, backoff, visibility handling, and stale labels.
- [Verified result](01-summary/findings.md) — what the package does and its current state.
- [Architecture](02-analysis/architecture.md) — request flow, transport choice, and failure handling.
- [API-Football source record](03-dossiers/api-football.md) — endpoint and authentication facts used by the implementation.

## SOURCES (PYRAMID NAVIGATION)

[01-summary/findings.md](01-summary/findings.md)  
→ Package verdict and run instructions.

[02-analysis/architecture.md](02-analysis/architecture.md)  
→ Why the package uses a server proxy and polling.

[03-dossiers/api-football.md](03-dossiers/api-football.md)  
→ Provider documentation record.
