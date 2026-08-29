import http from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { mapLiveFixtures, providerErrorMessage } from "./src/api-football.js";

const root = dirname(fileURLToPath(import.meta.url));
const publicDirectory = join(root, "public");
const apiUrl = "https://v3.football.api-sports.io/fixtures?live=all";
const contentTypes = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

function sendJson(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store, max-age=0" });
  response.end(JSON.stringify(body));
}

async function liveScores(response, { apiKey, fetchImpl, now }) {
  if (!apiKey) {
    sendJson(response, 503, { error: "Set API_FOOTBALL_KEY on the server to load live scores." });
    return;
  }

  try {
    const upstream = await fetchImpl(apiUrl, { headers: { "x-apisports-key": apiKey }, cache: "no-store" });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      sendJson(response, upstream.status === 429 ? 429 : 502, { error: providerErrorMessage(upstream.status) });
      return;
    }

    const updatedAt = now().toISOString();
    sendJson(response, 200, { fixtures: mapLiveFixtures(payload, updatedAt), updatedAt });
  } catch {
    sendJson(response, 502, { error: "Could not reach API-Football. Try again shortly." });
  }
}

async function staticFile(requestPath, response) {
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\//, "");
  const safePath = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(publicDirectory, safePath);

  try {
    const body = await readFile(filePath);
    response.writeHead(200, { "content-type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

export function createLiveScoreServer({
  apiKey = process.env.API_FOOTBALL_KEY || "",
  fetchImpl = fetch,
  now = () => new Date()
} = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (request.method !== "GET") {
      response.writeHead(405, { allow: "GET" });
      response.end();
      return;
    }
    if (url.pathname === "/api/live-scores") {
      await liveScores(response, { apiKey, fetchImpl, now });
      return;
    }
    await staticFile(url.pathname, response);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const port = Number(process.env.PORT || 4173);
  createLiveScoreServer().listen(port, () => {
    console.log(`Live score demo: http://localhost:${port}`);
  });
}
