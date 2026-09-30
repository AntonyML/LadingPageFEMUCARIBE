import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { setDefaultResultOrder } from 'node:dns';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { http2Fetch } from './http2-fetch.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
setDefaultResultOrder('ipv4first');
const secretPath = resolve(homedir(), '.codex/secrets/femucaribe-penpot.json');
let token;
let client;
function sanitize(value) {
  return String(value).replaceAll(token || '\0', '[REDACTED]').replace(/userToken=[^\s"&]+/g, 'userToken=[REDACTED]');
}
async function connect() {
  token = process.env.PENPOT_MCP_TOKEN || JSON.parse(await readFile(secretPath, 'utf8')).token;
  if (!token) throw new Error('Falta PENPOT_MCP_TOKEN o la credencial local.');
  const url = new URL('https://design.penpot.app/mcp/stream');
  url.searchParams.set('userToken', token);
  client = new Client({ name: 'femucaribe-penpot', version: '1.0.0' });
  let transport = new StreamableHTTPClientTransport(url, {
    fetch: async (input, init) => {
      const response = await http2Fetch(input, { ...init, signal: AbortSignal.any([init?.signal || new AbortController().signal, AbortSignal.timeout(120000)]) });
      if (process.env.PENPOT_DEBUG) console.error('Penpot HTTP', init?.method || 'GET', response.status);
      return response;
    }
  });
  try {
    await client.connect(transport);
  } catch {
    await transport.close().catch(() => {});
    client = new Client({ name: 'femucaribe-penpot', version: '1.0.0' });
    transport = new SSEClientTransport(url);
    await client.connect(transport);
  }
}
async function catalog() {
  const tools = [];
  let cursor;
  do {
    const page = await client.listTools(cursor ? { cursor } : {});
    tools.push(...page.tools);
    cursor = page.nextCursor;
  } while (cursor);
  return { tools };
}
const [command = 'help', name, argsPath] = process.argv.slice(2);
if (command === 'help') {
  console.log('Penpot: doctor | tools [filtro] | refresh | call <tool> <arguments.json> | bridge');
} else {
  const deadline = setTimeout(() => { console.error('Penpot: tiempo de conexión agotado.'); process.exit(1); }, 45000);
  try {
    if (!['doctor', 'tools', 'refresh', 'call', 'bridge'].includes(command)) throw new Error('Comando desconocido. Usa help.');
    await connect();
    if (command === 'bridge') {
      clearTimeout(deadline);
      const server = new Server({ name: 'femucaribe-penpot', version: '1.0.0' }, { capabilities: { tools: {} } });
      server.setRequestHandler(ListToolsRequestSchema, () => catalog());
      server.setRequestHandler(CallToolRequestSchema, async request => {
        try { return await client.callTool(request.params, undefined, { timeout: 120000 }); }
        catch (error) { return { isError: true, content: [{ type: 'text', text: sanitize(error.message) }] }; }
      });
      await server.connect(new StdioServerTransport());
      process.stdin.on('end', async () => { await client.close(); process.exit(0); });
    } else {
      if (command === 'call') {
        if (!name || !argsPath) throw new Error('Uso: call <tool> <arguments.json>');
        const args = JSON.parse(await readFile(resolve(argsPath), 'utf8'));
        const result = await client.callTool({ name, arguments: args });
        console.log(sanitize(JSON.stringify(result, null, 2)));
        if (result.isError) process.exitCode = 1;
      } else {
        const data = await catalog();
        if (command === 'refresh') {
          await mkdir(resolve(root, 'docs/penpot'), { recursive: true });
          await writeFile(resolve(root, 'docs/penpot/tools.json'), sanitize(JSON.stringify(data, null, 2)) + '\n');
          console.log('Catálogo actualizado: docs/penpot/tools.json');
        } else if (command === 'doctor') {
          console.log(JSON.stringify({ connected: true, tools: data.tools.map(t => t.name), designFileVerified: false }, null, 2));
        } else {
          console.log(sanitize(JSON.stringify({ tools: data.tools.filter(t => !name || (t.name + ' ' + t.description).toLowerCase().includes(name.toLowerCase())) }, null, 2)));
        }
      }
      await client.close();
      clearTimeout(deadline);
    }
  } catch (error) {
    clearTimeout(deadline);
    console.error('Penpot: ' + sanitize(error.message));
    await client?.close().catch(() => {});
    process.exitCode = 1;
  }
}
