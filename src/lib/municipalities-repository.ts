import { randomUUID } from 'node:crypto';
import { open, readFile, rename, unlink } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { z } from 'astro/zod';

export const municipalityIds = [
  'limon',
  'pococi',
  'siquirres',
  'talamanca',
  'matina',
  'guacimo',
] as const;

const municipalityIdSchema = z.enum(municipalityIds);
const requiredText = (maximum: number) => z.string().trim().min(1).max(maximum);
const optionalText = (maximum: number) => z.string().trim().max(maximum);

function hasUnsafeUrlCharacters(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x20 || code === 0x7f || character === '\\';
  });
}

function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      !url.username &&
      !url.password &&
      !hasUnsafeUrlCharacters(value)
    );
  } catch {
    return false;
  }
}

function isImageUrl(value: string): boolean {
  if (value === '') return true;
  if (/[?#]/.test(value) || hasUnsafeUrlCharacters(value)) return false;
  if (isWebUrl(value)) return true;
  if (!value.startsWith('/') || value.startsWith('//')) return false;

  try {
    const decoded = decodeURIComponent(value);
    return (
      !decoded.startsWith('//') &&
      !/[?#]/.test(decoded) &&
      !hasUnsafeUrlCharacters(decoded) &&
      !decoded.split('/').some((part) => part === '..' || part === '.')
    );
  } catch {
    return false;
  }
}

const imageUrlSchema = optionalText(2048).refine(isImageUrl, {
  message:
    'Use una URL http/https o una ruta local sin consultas ni fragmentos.',
});

export const municipalityUpdateSchema = z
  .object({
    name: requiredText(160),
    cabecera: requiredText(120),
    description: requiredText(6000),
    cantonFotoUrl: imageUrlSchema.optional(),
    alcaldia: z
      .object({
        nombre: requiredText(160),
        cargo: requiredText(120),
        fotoUrl: imageUrlSchema,
      })
      .strict(),
    contacto: z
      .object({
        telefono: optionalText(40).refine(
          (value) => {
            if (value === '') return true;
            const digits = value.replace(/\D/g, '').length;
            return /^[+\d().\s-]+$/.test(value) && digits >= 8 && digits <= 15;
          },
          {
            message:
              'Use entre 8 y 15 dígitos; puede incluir +, (), espacios, puntos o guiones.',
          },
        ),
        correo: optionalText(254).pipe(z.union([z.literal(''), z.email()])),
        sitioWeb: optionalText(2048).refine(
          (value) => value === '' || isWebUrl(value),
          { message: 'Use una dirección web http o https válida.' },
        ),
        direccion: optionalText(500),
      })
      .strict(),
    escudoUrl: imageUrlSchema,
    proyectosDestacados: z.array(requiredText(300)).max(30),
  })
  .strict();

export const municipalitySchema = municipalityUpdateSchema
  .extend({
    id: municipalityIdSchema,
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const municipalitiesSchema = z
  .array(municipalitySchema)
  .length(municipalityIds.length)
  .superRefine((municipalities, context) => {
    if (
      new Set(municipalities.map(({ id }) => id)).size !==
      municipalityIds.length
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'El documento debe incluir exactamente una ficha de cada cantón.',
      });
    }
  });

export type Municipality = z.infer<typeof municipalitySchema>;
export type MunicipalityUpdate = z.infer<typeof municipalityUpdateSchema>;

const writeQueues = new Map<string, Promise<void>>();

function serializeWrite<T>(
  filePath: string,
  write: () => Promise<T>,
): Promise<T> {
  const key = process.platform === 'win32' ? filePath.toLowerCase() : filePath;
  const previous = writeQueues.get(key) ?? Promise.resolve();
  const result = previous.then(write);
  // Keep a rejected write from preventing the next queued update.
  const completion = result.then(
    () => undefined,
    () => undefined,
  );
  writeQueues.set(key, completion);
  void completion.then(() => {
    if (writeQueues.get(key) === completion) writeQueues.delete(key);
  });
  return result;
}

async function writeAtomically(
  filePath: string,
  municipalities: Municipality[],
): Promise<void> {
  const temporaryPath = join(
    dirname(filePath),
    `.${basename(filePath)}.${randomUUID()}.tmp`,
  );
  let created = false;

  try {
    const file = await open(temporaryPath, 'wx', 0o600);
    created = true;
    try {
      await file.writeFile(
        `${JSON.stringify(municipalities, null, 2)}\n`,
        'utf8',
      );
      await file.sync();
    } finally {
      await file.close();
    }
    await rename(temporaryPath, filePath);
  } catch (error) {
    // Cleanup must preserve the original failure and the previous document.
    if (created) await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

export function createMunicipalitiesRepository(filePath: string) {
  const resolvedFilePath = resolve(filePath);

  async function list(): Promise<Municipality[]> {
    const source = await readFile(resolvedFilePath, 'utf8');
    const document: unknown = JSON.parse(source);
    return municipalitiesSchema.parse(document);
  }

  async function get(id: string): Promise<Municipality | null> {
    if (!municipalityIdSchema.safeParse(id).success) return null;
    return (
      (await list()).find((municipality) => municipality.id === id) ?? null
    );
  }

  async function update(
    id: string,
    input: unknown,
  ): Promise<Municipality | null> {
    const parsedId = municipalityIdSchema.safeParse(id);
    if (!parsedId.success) return null;
    const updateInput = municipalityUpdateSchema.parse(input);

    return serializeWrite(resolvedFilePath, async () => {
      const municipalities = await list();
      const updated = municipalitySchema.parse({
        ...updateInput,
        id: parsedId.data,
        updatedAt: new Date().toISOString(),
      });
      const next = municipalities.map((municipality) =>
        municipality.id === parsedId.data ? updated : municipality,
      );
      // Validate the complete document before touching the destination file.
      await writeAtomically(resolvedFilePath, municipalitiesSchema.parse(next));
      return updated;
    });
  }

  return { list, get, update };
}

function configuredRepository() {
  return createMunicipalitiesRepository(
    process.env.MUNICIPALITIES_DATA_FILE ||
      resolve(process.cwd(), 'data/municipalities-data.json'),
  );
}

export function listMunicipalities(): Promise<Municipality[]> {
  return configuredRepository().list();
}

export function getMunicipality(id: string): Promise<Municipality | null> {
  return configuredRepository().get(id);
}

export function updateMunicipality(
  id: string,
  input: unknown,
): Promise<Municipality | null> {
  return configuredRepository().update(id, input);
}
