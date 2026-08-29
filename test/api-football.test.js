import assert from "node:assert/strict";
import test from "node:test";
import { mapLiveFixtures, providerErrorMessage } from "../src/api-football.js";

const providerFixture = {
  fixture: { id: 8675309, status: { short: "2H", long: "Second Half", elapsed: 78 } },
  league: { id: 39, name: "Premier League", logo: "https://media.example/league.png" },
  teams: {
    home: { id: 42, name: "Arsenal", logo: "https://media.example/arsenal.png", winner: true },
    away: { id: 49, name: "Chelsea", logo: "https://media.example/chelsea.png", winner: false }
  },
  goals: { home: 2, away: 1 }
};

test("maps API-Football fixtures into the browser contract", () => {
  assert.deepEqual(mapLiveFixtures({ response: [providerFixture] }, "2026-08-29T12:01:00.000Z"), [{
    id: 8675309,
    league: { id: 39, name: "Premier League", logo: "https://media.example/league.png" },
    home: { id: 42, name: "Arsenal", logo: "https://media.example/arsenal.png", score: 2, winner: true },
    away: { id: 49, name: "Chelsea", logo: "https://media.example/chelsea.png", score: 1, winner: false },
    status: { short: "2H", long: "Second Half", elapsed: 78 },
    updatedAt: "2026-08-29T12:01:00.000Z"
  }]);
});

test("normalizes missing goals and safe provider errors", () => {
  const [fixture] = mapLiveFixtures({ response: [{ ...providerFixture, goals: { home: null, away: null } }] }, "2026-08-29T12:01:00.000Z");
  assert.equal(fixture.home.score, 0);
  assert.equal(fixture.away.score, 0);
  assert.equal(providerErrorMessage(401), "API-Football rejected the server credential.");
  assert.equal(providerErrorMessage(429), "API-Football rate limit reached. Try again shortly.");
  assert.equal(providerErrorMessage(503), "API-Football is temporarily unavailable.");
});
