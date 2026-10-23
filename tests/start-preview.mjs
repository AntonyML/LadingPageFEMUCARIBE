import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, copyFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Every server gets its own writable data file; E2E never touches the seed.
const directory = await mkdtemp(path.join(tmpdir(), 'femucaribe-admin-'));
const municipalitiesFile = path.join(directory, 'municipalities-data.json');
const documentsFile = path.join(directory, 'documents-manifest.json');
await copyFile('data/municipalities-data.json', municipalitiesFile);
const manifestPath = process.env.DOCUMENTS_MANIFEST_PATH || documentsFile;
if (!process.env.DOCUMENTS_MANIFEST_PATH) {
  await writeFile(documentsFile, '[]\n', 'utf8');
}

const storageApiKey = 'isolated-playwright-storage-key';
const storageFixture = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  const sendJson = (status, payload) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(payload));
  };

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(200, { status: 'healthy' });
    return;
  }

  if (request.headers['x-api-key'] !== storageApiKey) {
    sendJson(401, { error: 'API key de prueba no válida' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/status') {
    sendJson(200, {
      status: 'healthy',
      serverTime: new Date().toISOString(),
      totalFiles: 0,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/files') {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const filename =
      body.toString('latin1').match(/name="file"; filename="([^"]+)"/i)?.[1] ||
      'documento.pdf';
    const fileId = randomUUID();
    const downloadPath = `/api/v1/files/${fileId}`;
    const address = storageFixture.address();
    const endpoint =
      address && typeof address === 'object'
        ? `http://127.0.0.1:${address.port}`
        : '';

    sendJson(201, {
      fileId,
      originalName: filename,
      storedName: `${fileId}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: body.length,
      sha256: 'a'.repeat(64),
      createdAt: new Date().toISOString(),
      downloadPath,
      downloadUrl: `${endpoint}${downloadPath}`,
      tunnelActive: true,
    });
    return;
  }

  if (
    request.method === 'DELETE' &&
    url.pathname.startsWith('/api/v1/files/')
  ) {
    response.writeHead(204);
    response.end();
    return;
  }

  sendJson(404, { error: 'Ruta de almacenamiento de prueba no encontrada' });
});

await new Promise((resolve, reject) => {
  storageFixture.once('error', reject);
  storageFixture.listen(0, '127.0.0.1', resolve);
});
const storageAddress = storageFixture.address();
if (!storageAddress || typeof storageAddress === 'string') {
  throw new Error('No se pudo iniciar el almacenamiento de prueba');
}
const storageEndpoint = `http://127.0.0.1:${storageAddress.port}`;

const server = spawn(process.execPath, ['dist/server/entry.mjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: process.argv[2] || '4322',
    MUNICIPALITIES_DATA_FILE: municipalitiesFile,
    DOCUMENTS_MANIFEST_PATH: manifestPath,
    FEMUCARIBE_STORAGE_ENDPOINT: storageEndpoint,
    FEMUCARIBE_STORAGE_API_KEY: storageApiKey,
    ADMIN_EMAIL: 'soporte@femucaribe.go.cr',
    ADMIN_PASSWORD: 'XFSudF*L^pg@1',
    SESSION_SECRET: 'isolated-playwright-session-secret-never-production',
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
server.on('exit', async (code) => {
  await new Promise((resolve) => storageFixture.close(resolve));
  await rm(directory, { recursive: true, force: true });
  process.exitCode = code ?? 1;
});
