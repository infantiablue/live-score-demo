import assert from "node:assert/strict";
import test from "node:test";
import { once } from "node:events";
import { createLiveScoreServer } from "../server.js";

async function withServer(options, run) {
  const server = createLiveScoreServer(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("serves the standalone page and reports a missing server credential", async () => {
  await withServer({ apiKey: "" }, async (origin) => {
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Live football scores/);

    const response = await fetch(`${origin}/api/live-scores`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "Set API_FOOTBALL_KEY on the server to load live scores." });
  });
});

test("proxies and normalizes the API-Football live fixture feed", async () => {
  const fixture = {
    fixture: { id: 10, status: { short: "1H", long: "First Half", elapsed: 31 } },
    league: { id: 20, name: "Demo League", logo: null },
    teams: {
      home: { id: 1, name: "Home", logo: null, winner: null },
      away: { id: 2, name: "Away", logo: null, winner: null }
    },
    goals: { home: 1, away: 0 }
  };
  let request;

  await withServer({
    apiKey: "server-only-key",
    now: () => new Date("2026-08-29T12:01:00.000Z"),
    fetchImpl: async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({ response: [fixture] }), { status: 200, headers: { "content-type": "application/json" } });
    }
  }, async (origin) => {
    const response = await fetch(`${origin}/api/live-scores`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
    assert.equal(body.fixtures[0].home.score, 1);
    assert.equal(body.updatedAt, "2026-08-29T12:01:00.000Z");
  });

  assert.equal(request.url, "https://v3.football.api-sports.io/fixtures?live=all");
  assert.equal(request.options.headers["x-apisports-key"], "server-only-key");
});
