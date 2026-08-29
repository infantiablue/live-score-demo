const INTERVAL_MS = 60_000;
const MAX_BACKOFF_MS = 5 * 60_000;
const STALE_AFTER_MS = 90_000;

const stateNode = document.querySelector("#feed-state");
const ageNode = document.querySelector("#feed-age");
const scoresNode = document.querySelector("#scores");
const emptyNode = document.querySelector("#empty-state");
const refreshButton = document.querySelector("#refresh");

let updatedAt = null;
let failures = 0;
let timerId;
let controller;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function ageText() {
  if (!updatedAt) return "Not updated yet";
  const ageMs = Math.max(0, Date.now() - Date.parse(updatedAt));
  const seconds = Math.round(ageMs / 1_000);
  const age = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
  return ageMs > STALE_AFTER_MS ? `Updated ${age} ago — scores may be delayed` : `Updated ${age} ago`;
}

function renderAge() {
  ageNode.textContent = ageText();
}

function renderFixtures(fixtures) {
  emptyNode.hidden = fixtures.length > 0;
  emptyNode.textContent = fixtures.length ? "" : "No matches are currently in play. The live API returned an empty list.";
  scoresNode.innerHTML = fixtures.map((fixture) => `
    <article class="score-card">
      <header><span>${escapeHtml(fixture.league.name)}</span><time>${escapeHtml(fixture.status.long)}${fixture.status.elapsed === null ? "" : ` · ${fixture.status.elapsed}'`}</time></header>
      <div class="team"><span>${fixture.home.logo ? `<img src="${escapeHtml(fixture.home.logo)}" alt="">` : ""}${escapeHtml(fixture.home.name)}</span><strong>${fixture.home.score}</strong></div>
      <div class="team"><span>${fixture.away.logo ? `<img src="${escapeHtml(fixture.away.logo)}" alt="">` : ""}${escapeHtml(fixture.away.name)}</span><strong>${fixture.away.score}</strong></div>
    </article>`).join("");
}

function schedule(delay) {
  window.clearTimeout(timerId);
  timerId = window.setTimeout(loadScores, delay);
}

async function loadScores() {
  if (document.visibilityState === "hidden") return;
  controller?.abort();
  controller = new AbortController();
  stateNode.dataset.state = "loading";
  stateNode.textContent = "Refreshing live fixtures…";

  try {
    const response = await fetch("/api/live-scores", { cache: "no-store", signal: controller.signal });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not load live scores.");
    updatedAt = body.updatedAt;
    failures = 0;
    stateNode.dataset.state = "fresh";
    stateNode.textContent = body.fixtures.length ? "Live feed connected" : "No matches are currently in play";
    renderFixtures(body.fixtures);
    renderAge();
    schedule(INTERVAL_MS);
  } catch (error) {
    if (error.name === "AbortError") return;
    failures += 1;
    const delay = Math.min(INTERVAL_MS * 2 ** failures, MAX_BACKOFF_MS);
    stateNode.dataset.state = "error";
    stateNode.textContent = `${error.message} Retrying in ${Math.round(delay / 1_000)}s.`;
    emptyNode.hidden = false;
    emptyNode.textContent = error.message;
    schedule(delay);
  }
}

refreshButton.addEventListener("click", loadScores);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") loadScores();
});
window.addEventListener("pagehide", () => {
  window.clearTimeout(timerId);
  controller?.abort();
});
window.setInterval(renderAge, 1_000);
loadScores();
