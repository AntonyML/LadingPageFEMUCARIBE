import { rm } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';

export default async function globalTeardown() {
  const directory = process.env.FEMUCARIBE_E2E_DOCUMENTS_DIR;
  if (!directory) return;

  const target = resolve(directory);
  const temporaryRoot = resolve(tmpdir());
  if (
    dirname(target) !== temporaryRoot ||
    !basename(target).startsWith('femucaribe-e2e-docs-')
  ) {
    throw new Error(
      'La ruta temporal de E2E no está dentro del directorio esperado',
    );
  }

  await rm(target, { recursive: true, force: true });
}
