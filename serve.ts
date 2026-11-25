// A tiny static server for Sunset Skillet's game/ folder (Node 22, standard
// library only), so the game can be played locally without a build step:
// `node serve.ts` serves game/ on http://localhost:8080. It sends the MIME
// types a browser game needs, refuses any path outside game/, and otherwise
// does nothing clever: this is a development convenience, not a web server
// for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (!file.startsWith(root + sep) && file !== root) {
    response.writeHead(403);
    response.end();
    return;
  }
  let stat;
  try {
    stat = statSync(file);
  } catch {
    response.writeHead(404);
    response.end();
    return;
  }
  if (!stat.isFile()) {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`Sunset Skillet at http://localhost:${port}/`);
});
