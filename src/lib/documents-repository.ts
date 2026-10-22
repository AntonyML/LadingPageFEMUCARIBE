import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export type DocumentCategory =
  'actas' | 'convenios' | 'presupuestos' | 'reglamentos' | 'informes' | 'otros';

export type CantonTag =
  | 'Regional / Federación'
  | 'Limón'
  | 'Pococí'
  | 'Siquirres'
  | 'Talamanca'
  | 'Matina'
  | 'Guácimo';

export const DOCUMENT_CATEGORIES: { id: DocumentCategory; label: string }[] = [
  { id: 'actas', label: 'Actas de Concejo' },
  { id: 'convenios', label: 'Convenios Interinstitucionales' },
  { id: 'presupuestos', label: 'Presupuestos y Liquidaciones' },
  { id: 'reglamentos', label: 'Reglamentos y Normativa' },
  { id: 'informes', label: 'Informes de Gestión y Rendición' },
  { id: 'otros', label: 'Otros Documentos Oficiales' },
];

export const CANTON_TAGS: CantonTag[] = [
  'Regional / Federación',
  'Limón',
  'Pococí',
  'Siquirres',
  'Talamanca',
  'Matina',
  'Guácimo',
];

export interface InstitutionalDocument {
  id: string;
  fileId: string;
  title: string;
  category: DocumentCategory;
  canton: CantonTag;
  documentDate: string;
  fileSize: number;
  mimeType: string;
  originalName: string;
  downloadUrl: string;
  relativeDownloadPath: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilterOptions {
  query?: string;
  category?: string;
  canton?: string;
}

function getManifestPath(): string {
  if (process.env.DOCUMENTS_MANIFEST_PATH) {
    return path.resolve(process.env.DOCUMENTS_MANIFEST_PATH);
  }
  return path.resolve(process.cwd(), 'data', 'documents-manifest.json');
}

// In-memory write queue to serialize file writes and prevent concurrency corruption
let writeQueue = Promise.resolve();

function ensureDataDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readManifestRaw(): InstitutionalDocument[] {
  const manifestPath = getManifestPath();
  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InstitutionalDocument[]) : [];
  } catch {
    return [];
  }
}

async function writeManifestAtomic(
  documents: InstitutionalDocument[],
): Promise<void> {
  const manifestPath = getManifestPath();
  ensureDataDirectory(manifestPath);

  const tmpPath = `${manifestPath}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  const content = JSON.stringify(documents, null, 2);

  return (writeQueue = writeQueue.then(async () => {
    await fs.promises.writeFile(tmpPath, content, 'utf8');
    await fs.promises.rename(tmpPath, manifestPath);
  }));
}

export async function getAllDocuments(
  filters?: DocumentFilterOptions,
): Promise<InstitutionalDocument[]> {
  const all = readManifestRaw();

  let filtered = all;

  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter((d) => d.category === filters.category);
  }

  if (filters?.canton && filters.canton !== 'all') {
    filtered = filtered.filter((d) => d.canton === filters.canton);
  }

  if (filters?.query && filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.originalName.toLowerCase().includes(q) ||
        d.canton.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)),
    );
  }

  // Sort by documentDate descending, fallback to createdAt descending
  return filtered.sort((a, b) => {
    const dateComp = b.documentDate.localeCompare(a.documentDate);
    if (dateComp !== 0) return dateComp;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getDocumentById(
  id: string,
): Promise<InstitutionalDocument | null> {
  const all = readManifestRaw();
  return all.find((d) => d.id === id) || null;
}

export async function saveDocument(
  data: Omit<InstitutionalDocument, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  },
): Promise<InstitutionalDocument> {
  const all = readManifestRaw();
  const now = new Date().toISOString();

  if (data.id) {
    const existingIndex = all.findIndex((d) => d.id === data.id);
    if (existingIndex >= 0) {
      const existing = all[existingIndex];
      if (existing) {
        const updated: InstitutionalDocument = {
          ...existing,
          ...data,
          id: data.id,
          createdAt: existing.createdAt,
          updatedAt: now,
        };
        all[existingIndex] = updated;
        await writeManifestAtomic(all);
        return updated;
      }
    }
  }

  const newDoc: InstitutionalDocument = {
    id: data.id || crypto.randomUUID(),
    fileId: data.fileId,
    title: data.title.trim(),
    category: data.category,
    canton: data.canton,
    documentDate: data.documentDate,
    fileSize: data.fileSize,
    mimeType: data.mimeType,
    originalName: data.originalName,
    downloadUrl: data.downloadUrl,
    relativeDownloadPath: data.relativeDownloadPath,
    ...(data.description ? { description: data.description.trim() } : {}),
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newDoc);
  await writeManifestAtomic(all);
  return newDoc;
}

export async function deleteDocument(
  id: string,
): Promise<InstitutionalDocument | null> {
  const all = readManifestRaw();
  const index = all.findIndex((d) => d.id === id);

  if (index === -1) {
    return null;
  }

  const [removed] = all.splice(index, 1);
  await writeManifestAtomic(all);
  return removed || null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
