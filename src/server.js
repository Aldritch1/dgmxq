import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestHandler } from './app.js';
import { loadEnvFile } from './env.js';
import { createMemoryStorage } from './storage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {
  ...(await loadEnvFile(join(__dirname, '..', '.env'))),
  ...process.env,
};
const handler = createRequestHandler({ env, storage: createMemoryStorage() });
const port = Number(env.PORT ?? 3000);

createServer(async (incoming, outgoing) => {
  if (incoming.method === 'GET' && incoming.url === '/style.css') {
    const css = await readFile(join(__dirname, '..', 'public', 'style.css'));
    outgoing.writeHead(200, { 'content-type': 'text/css; charset=utf-8' });
    outgoing.end(css);
    return;
  }

  const request = await toRequest(incoming);
  const response = await handler(request);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => {
  console.log(`用户管理系统已启动：http://localhost:${port}`);
});

async function toRequest(incoming) {
  const chunks = [];
  for await (const chunk of incoming) {
    chunks.push(chunk);
  }
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
  return new Request(`http://${incoming.headers.host}${incoming.url}`, {
    method: incoming.method,
    headers: incoming.headers,
    body,
    duplex: body ? 'half' : undefined,
  });
}
