import { spawn } from 'node:child_process';
import { mkdtemp, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Every server gets its own writable data file; E2E never touches the seed.
const directory = await mkdtemp(
  path.join(tmpdir(), 'femucaribe-municipalities-'),
);
const dataFile = path.join(directory, 'municipalities-data.json');
await copyFile('data/municipalities-data.json', dataFile);
const server = spawn(process.execPath, ['dist/server/entry.mjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: process.argv[2] || '4322',
    MUNICIPALITIES_DATA_FILE: dataFile,
    ADMIN_EMAIL: 'soporte@femucaribe.go.cr',
    ADMIN_PASSWORD: 'XFSudF*L^pg@1',
    SESSION_SECRET: 'isolated-playwright-session-secret-never-production',
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
server.on('exit', async (code) => {
  await rm(directory, { recursive: true, force: true });
  process.exitCode = code ?? 1;
});
