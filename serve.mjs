// Local dev harness for the proposal system (keyless demo).
// Serves the static files AND runs the REAL api/*.js handlers the same way
// Vercel would — no login, no remote project, instant start.
//   node --env-file=.env serve.mjs   →   http://localhost:3000
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

// Build a Vercel-style (req, res) pair around node's raw http objects.
function makeRes(raw) {
  return {
    statusCode: 200,
    _headers: {},
    setHeader(k, v) { this._headers[k] = v; raw.setHeader(k, v); },
    status(c) { this.statusCode = c; return this; },
    json(obj) {
      raw.statusCode = this.statusCode;
      raw.setHeader('Content-Type', 'application/json');
      raw.end(JSON.stringify(obj));
    },
    end(body) { raw.statusCode = this.statusCode; raw.end(body); },
  };
}

async function readBody(raw) {
  const chunks = [];
  for await (const c of raw) chunks.push(c);
  const buf = Buffer.concat(chunks);
  if (!buf.length) return {};
  try { return JSON.parse(buf.toString('utf8')); } catch { return {}; }
}

const server = createServer(async (raw, rawRes) => {
  const url = new URL(raw.url, `http://localhost:${PORT}`);
  let path = decodeURIComponent(url.pathname);

  // ---- API routes: run the real handler from api/<name>.js ----
  if (path.startsWith('/api/')) {
    const name = path.slice('/api/'.length).replace(/\/$/, '');
    const res = makeRes(rawRes);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Keyless local mode: skip Supabase persistence in /api/sign so the demo
    // returns a clean 200 instead of a 500. With SUPABASE_URL set it runs for real.
    if (name === 'sign' && !process.env.SUPABASE_URL) {
      const body = await readBody(raw);
      return res.status(200).json({ ok: true, local: true, note: 'keyless: persistence skipped' });
    }
    try {
      const mod = await import(new URL(`./api/${name}.js`, import.meta.url));
      raw.body = await readBody(raw);
      await mod.default(raw, res);
    } catch (e) {
      console.error(`api/${name} error:`, e.message);
      res.status(500).json({ error: 'server', detail: e.message });
    }
    return;
  }

  // ---- Static files ----
  if (path === '/') path = '/index.html';
  if (path.endsWith('/')) path += 'index.html';
  const filePath = normalize(join(ROOT, path));
  if (!filePath.startsWith(ROOT)) { rawRes.statusCode = 403; return rawRes.end('forbidden'); }
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) { rawRes.statusCode = 404; return rawRes.end('not found'); }
    const data = await readFile(filePath);
    rawRes.setHeader('Content-Type', TYPES[extname(filePath)] || 'application/octet-stream');
    rawRes.end(data);
  } catch {
    rawRes.statusCode = 404;
    rawRes.setHeader('Content-Type', 'text/html; charset=utf-8');
    rawRes.end('<body style="font-family:sans-serif;padding:40px">404 — not found</body>');
  }
});

server.listen(PORT, () => {
  console.log(`\n  proposal-system (local, keyless) → http://localhost:${PORT}`);
  console.log(`  proposal: /p/northwind/   (once the chosen design is built)\n`);
});
