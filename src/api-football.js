export function mapLiveFixtures(payload, updatedAt) {
  const fixtures = Array.isArray(payload?.response) ? payload.response : [];
  return fixtures.map((item) => ({
    id: item.fixture.id,
    league: {
      id: item.league.id,
      name: item.league.name,
      logo: item.league.logo || null
    },
    home: {
      id: item.teams.home.id,
      name: item.teams.home.name,
      logo: item.teams.home.logo || null,
      score: item.goals.home ?? 0,
      winner: item.teams.home.winner ?? null
    },
    away: {
      id: item.teams.away.id,
      name: item.teams.away.name,
      logo: item.teams.away.logo || null,
      score: item.goals.away ?? 0,
      winner: item.teams.away.winner ?? null
    },
    status: {
      short: item.fixture.status.short,
      long: item.fixture.status.long,
      elapsed: item.fixture.status.elapsed
    },
    updatedAt
  }));
}

export function providerErrorMessage(status) {
  if (status === 401 || status === 403) return "API-Football rejected the server credential.";
  if (status === 429) return "API-Football rate limit reached. Try again shortly.";
  return "API-Football is temporarily unavailable.";
}
