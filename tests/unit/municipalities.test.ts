import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMunicipalitiesRepository,
  getMunicipality,
  listMunicipalities,
  municipalitiesSchema,
  municipalityIds,
  municipalitySchema,
  municipalityUpdateSchema,
  updateMunicipality,
  type Municipality,
  type MunicipalityUpdate,
} from '../../src/lib/municipalities-repository';
import { presentMunicipalities } from '../../src/components/municipalidades/data';

vi.mock('node:fs/promises', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:fs/promises')>();
  return { ...original, rename: vi.fn(original.rename) };
});

const actualFs =
  await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');

function seed(): Municipality[] {
  return municipalityIds.map((id) => ({
    id,
    name: `Municipalidad de ${id}`,
    cabecera: `Cabecera de ${id}`,
    description: `Reseña institucional de ${id}.\nSegundo párrafo.`,
    alcaldia: {
      nombre: `Autoridad de ${id}`,
      cargo: 'Alcaldía Municipal',
      fotoUrl: `/images/municipalities/${id}.svg`,
    },
    contacto: {
      telefono: '+506 2758-4444',
      correo: 'info@example.go.cr',
      sitioWeb: 'https://example.go.cr',
      direccion: 'Sede municipal, provincia de Limón.',
    },
    escudoUrl: '',
    proyectosDestacados: ['Convenio de cooperación institucional'],
    updatedAt: '2026-01-01T00:00:00.000Z',
  }));
}

function editable(municipality: Municipality): MunicipalityUpdate {
  return {
    name: municipality.name,
    cabecera: municipality.cabecera,
    description: municipality.description,
    alcaldia: { ...municipality.alcaldia },
    contacto: { ...municipality.contacto },
    escudoUrl: municipality.escudoUrl,
    proyectosDestacados: [...municipality.proyectosDestacados],
  };
}

let directory: string;
let filePath: string;
let initial: Municipality[];

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'femucaribe-municipalities-'));
  filePath = join(directory, 'municipalities.json');
  initial = seed();
  await writeFile(filePath, JSON.stringify(initial), 'utf8');
  vi.mocked(rename).mockReset().mockImplementation(actualFs.rename);
});

afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await rm(directory, { recursive: true, force: true });
});

describe('municipalities schema', () => {
  it('requires the complete set of six unique canonical cantons', () => {
    expect(municipalitiesSchema.parse(initial).map(({ id }) => id)).toEqual([
      'limon',
      'pococi',
      'siquirres',
      'talamanca',
      'matina',
      'guacimo',
    ]);
    expect(municipalitiesSchema.safeParse(initial.slice(1)).success).toBe(
      false,
    );
    expect(
      municipalitiesSchema.safeParse([initial[0], ...initial.slice(0, 5)])
        .success,
    ).toBe(false);
    expect(
      municipalitySchema.safeParse({ ...initial[0], id: 'otro' }).success,
    ).toBe(false);
    expect(
      municipalitySchema.safeParse({ ...initial[0], updatedAt: 'ayer' })
        .success,
    ).toBe(false);
  });

  it('allows pending contact channels, images and projects, preserving multiline text', () => {
    const input = editable(initial[0]!);
    input.name = `  ${input.name}  `;
    input.contacto = { telefono: '', correo: '', sitioWeb: '', direccion: '' };
    input.alcaldia.fotoUrl = '';
    input.escudoUrl = '';
    input.proyectosDestacados = [];
    const parsed = municipalityUpdateSchema.parse(input);
    expect(parsed.name).toBe(initial[0]!.name);
    expect(parsed.description).toContain('\nSegundo párrafo.');
    expect(parsed.contacto.correo).toBe('');
  });

  it.each([
    ['name', { name: 'a'.repeat(161) }],
    ['cabecera', { cabecera: 'a'.repeat(121) }],
    ['description', { description: 'a'.repeat(6001) }],
    ['proyectosDestacados item', { proyectosDestacados: ['a'.repeat(301)] }],
    [
      'proyectosDestacados count',
      { proyectosDestacados: Array<string>(31).fill('Proyecto') },
    ],
    ['required text', { name: '  ' }],
    ['unknown property', { inesperado: true }],
  ])('rejects invalid %s', (_label, changes) => {
    expect(
      municipalityUpdateSchema.safeParse({
        ...editable(initial[0]!),
        ...changes,
      }).success,
    ).toBe(false);
  });

  it('validates authority and contact length and formats', () => {
    const input = editable(initial[0]!);
    for (const alcaldia of [
      { ...input.alcaldia, nombre: '' },
      { ...input.alcaldia, nombre: 'a'.repeat(161) },
      { ...input.alcaldia, cargo: 'a'.repeat(121) },
    ]) {
      expect(
        municipalityUpdateSchema.safeParse({ ...input, alcaldia }).success,
      ).toBe(false);
    }
    for (const contacto of [
      { ...input.contacto, telefono: '+' },
      { ...input.contacto, telefono: '1234567' },
      { ...input.contacto, telefono: '1'.repeat(16) },
      { ...input.contacto, telefono: 'teléfono incorrecto' },
      { ...input.contacto, correo: 'correo-sin-dominio' },
      { ...input.contacto, direccion: 'a'.repeat(501) },
    ]) {
      expect(
        municipalityUpdateSchema.safeParse({ ...input, contacto }).success,
      ).toBe(false);
    }
    expect(
      municipalityUpdateSchema.safeParse({
        ...input,
        contacto: { ...input.contacto, telefono: '(506) 2758.4444' },
      }).success,
    ).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:image/svg+xml,<svg onload=alert(1)>',
    '//evil.example/image.png',
    '/\\evil.example/image.png',
    '/%2f%2fevil.example/image.png',
    '/images/../private.png',
    '/images/%2e%2e/private.png',
    '/images/photo.png?redirect=javascript:alert(1)',
    '/images/photo.svg#payload',
    'https://user:secret@example.go.cr/photo.png',
    'https://example.go.cr/photo.png?token=secret',
  ])('rejects unsafe image URL %s', (value) => {
    const input = editable(initial[0]!);
    expect(
      municipalityUpdateSchema.safeParse({ ...input, escudoUrl: value })
        .success,
    ).toBe(false);
    expect(
      municipalityUpdateSchema.safeParse({
        ...input,
        alcaldia: { ...input.alcaldia, fotoUrl: value },
      }).success,
    ).toBe(false);
  });

  it.each([
    'javascript:alert(1)',
    '//example.go.cr',
    '/municipalidades',
    'https://user:secret@example.go.cr',
    'https://example.go.cr/\nunsafe',
  ])('rejects unsafe institutional website %s', (sitioWeb) => {
    const input = editable(initial[0]!);
    expect(
      municipalityUpdateSchema.safeParse({
        ...input,
        contacto: { ...input.contacto, sitioWeb },
      }).success,
    ).toBe(false);
  });

  it('accepts root image paths and public http/https URLs', () => {
    const input = editable(initial[0]!);
    for (const escudoUrl of [
      '/images/municipalities/limon.svg',
      'https://example.go.cr/photo.jpg',
      'http://example.go.cr/photo.jpg',
    ]) {
      expect(
        municipalityUpdateSchema.safeParse({ ...input, escudoUrl }).success,
      ).toBe(true);
    }
  });
});

describe('municipalities repository', () => {
  it('reads all six records, retrieves by ID and reads fresh data on every call', async () => {
    const repository = createMunicipalitiesRepository(filePath);
    expect(await repository.list()).toEqual(initial);
    expect(await repository.get('pococi')).toEqual(initial[1]);
    expect(await repository.get('unknown')).toBeNull();
    initial[0]!.name = 'Municipalidad de Limón actualizada externamente';
    await writeFile(filePath, JSON.stringify(initial), 'utf8');
    expect((await repository.list())[0]!.name).toBe(initial[0]!.name);
  });

  it('resolves the configured data file separately for every public function call', async () => {
    vi.stubEnv('MUNICIPALITIES_DATA_FILE', filePath);
    expect(await listMunicipalities()).toEqual(initial);
    expect(await getMunicipality('limon')).toEqual(initial[0]);
    const secondPath = join(directory, 'second.json');
    const second = seed();
    second[0]!.name = 'Municipalidad en otro archivo';
    await writeFile(secondPath, JSON.stringify(second), 'utf8');
    vi.stubEnv('MUNICIPALITIES_DATA_FILE', secondPath);
    expect((await listMunicipalities())[0]!.name).toBe(second[0]!.name);
    const input = editable(second[0]!);
    input.description = 'Cambios en el segundo archivo.';
    expect((await updateMunicipality('limon', input))?.description).toBe(
      input.description,
    );
    expect(JSON.parse(await readFile(filePath, 'utf8'))).toEqual(initial);
  });

  it('defaults to the data directory under the current runtime directory', async () => {
    await mkdir(join(directory, 'data'));
    await writeFile(
      join(directory, 'data/municipalities-data.json'),
      JSON.stringify(initial),
    );
    vi.stubEnv('MUNICIPALITIES_DATA_FILE', undefined);
    vi.spyOn(process, 'cwd').mockReturnValue(directory);
    expect(await listMunicipalities()).toEqual(initial);
  });

  it('updates editable fields and sets its own timestamp without changing identity', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-22T18:30:00.000Z'));
    const repository = createMunicipalitiesRepository(filePath);
    const input = editable(initial[1]!);
    input.description = 'Reseña guardada desde el administrador.\nNueva línea.';
    const updated = await repository.update('pococi', input);
    expect(updated).toEqual({
      ...input,
      id: 'pococi',
      updatedAt: '2026-10-22T18:30:00.000Z',
    });
    expect(await repository.get('pococi')).toEqual(updated);
    expect(await repository.get('limon')).toEqual(initial[0]);
    const saved = await readFile(filePath, 'utf8');
    expect(saved.endsWith('\n')).toBe(true);
    expect(saved).not.toContain('\r');
  });

  it('rejects attempts to supply readonly identity or timestamps and unknown IDs', async () => {
    const repository = createMunicipalitiesRepository(filePath);
    const input = editable(initial[0]!);
    await expect(
      repository.update('limon', { ...input, id: 'pococi' }),
    ).rejects.toThrow();
    await expect(
      repository.update('limon', {
        ...input,
        updatedAt: '2030-01-01T00:00:00.000Z',
      }),
    ).rejects.toThrow();
    expect(await repository.update('unknown', input)).toBeNull();
    expect(await repository.list()).toEqual(initial);
  });

  it('keeps the old complete document readable until a complete temporary file is renamed', async () => {
    const repository = createMunicipalitiesRepository(filePath);
    let announceRename = () => {};
    let permitRename = () => {};
    const renameReached = new Promise<void>((resolve) => {
      announceRename = resolve;
    });
    const renamePermission = new Promise<void>((resolve) => {
      permitRename = resolve;
    });
    vi.mocked(rename).mockImplementationOnce(async (...arguments_) => {
      announceRename();
      await renamePermission;
      return actualFs.rename(...arguments_);
    });
    const input = editable(initial[0]!);
    input.description = 'Documento nuevo y completo';
    const saving = repository.update('limon', input);
    await renameReached;

    try {
      expect(await repository.list()).toEqual(initial);
      const temporaryFile = (await readdir(directory)).find((name) =>
        name.endsWith('.tmp'),
      );
      expect(temporaryFile).toBeDefined();
      const pendingDocument: unknown = JSON.parse(
        await readFile(join(directory, temporaryFile!), 'utf8'),
      );
      expect(municipalitiesSchema.parse(pendingDocument)[0]!.description).toBe(
        input.description,
      );
    } finally {
      permitRename();
      await saving;
    }
    expect((await repository.get('limon'))?.description).toBe(
      input.description,
    );
    expect(await readdir(directory)).toEqual(['municipalities.json']);
  });

  it('serializes concurrent updates across repository instances without losing other cantons', async () => {
    await Promise.all(
      initial.map((municipality) => {
        const input = editable(municipality);
        input.description = `Actualización simultánea ${municipality.id}`;
        return createMunicipalitiesRepository(filePath).update(
          municipality.id,
          input,
        );
      }),
    );
    const result = await createMunicipalitiesRepository(filePath).list();
    for (const municipality of result) {
      expect(municipality.description).toBe(
        `Actualización simultánea ${municipality.id}`,
      );
    }
    expect(await readdir(directory)).toEqual(['municipalities.json']);
  });

  it('cleans up a failed rename, preserves the original file and permits the next update', async () => {
    const repository = createMunicipalitiesRepository(filePath);
    const before = await readFile(filePath, 'utf8');
    const input = editable(initial[0]!);
    input.description = 'Cambio que requiere almacenamiento atómico';
    vi.mocked(rename).mockRejectedValueOnce(
      new Error('simulated rename failure'),
    );
    await expect(repository.update('limon', input)).rejects.toThrow(
      'simulated rename failure',
    );
    expect(await readFile(filePath, 'utf8')).toBe(before);
    expect(await readdir(directory)).toEqual(['municipalities.json']);
    expect((await repository.update('limon', input))?.description).toBe(
      input.description,
    );
  });

  it.each([
    '{invalid json',
    '[]',
    JSON.stringify([seed()[0], ...seed().slice(0, 5)]),
  ])(
    'fails explicitly on corrupt or incomplete storage: %s',
    async (content) => {
      await writeFile(filePath, content, 'utf8');
      const repository = createMunicipalitiesRepository(filePath);
      await expect(repository.list()).rejects.toThrow();
      await expect(
        repository.update('limon', editable(initial[0]!)),
      ).rejects.toThrow();
      expect(await readFile(filePath, 'utf8')).toBe(content);
      expect(await readdir(directory)).toEqual(['municipalities.json']);
    },
  );

  it('does not create or silently replace missing storage', async () => {
    const missingPath = join(directory, 'missing.json');
    const repository = createMunicipalitiesRepository(missingPath);
    await expect(repository.list()).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      repository.update('limon', editable(initial[0]!)),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await readdir(directory)).toEqual(['municipalities.json']);
  });

  it('updates and persists cantonFotoUrl correctly', async () => {
    const repository = createMunicipalitiesRepository(filePath);
    const updated = await repository.update('limon', {
      ...editable(initial[0]!),
      cantonFotoUrl:
        'https://cms.femucaribe.go.cr/wp-content/uploads/municipalidades/canton-limon.png',
    });
    expect(updated?.cantonFotoUrl).toBe(
      'https://cms.femucaribe.go.cr/wp-content/uploads/municipalidades/canton-limon.png',
    );
  });

  it('prefers remote cantonFotoUrl when present in presentMunicipalities', () => {
    const list = [
      {
        ...initial[0]!,
        cantonFotoUrl:
          'https://cms.femucaribe.go.cr/wp-content/uploads/municipalidades/canton-limon.png',
      },
    ];
    const presented = presentMunicipalities(list);
    expect(presented[0]?.photo).toBe(
      'https://cms.femucaribe.go.cr/wp-content/uploads/municipalidades/canton-limon.png',
    );
  });
});
