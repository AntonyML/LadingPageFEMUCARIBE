import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  saveDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  formatFileSize,
} from '../../src/lib/documents-repository';
import {
  getStorageConfig,
  checkStorageHealth,
} from '../../src/lib/storage-client';

describe('Documents Repository & Storage Client', () => {
  const testManifestPath = path.resolve(
    process.cwd(),
    'data',
    'test-documents-manifest.json',
  );
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.DOCUMENTS_MANIFEST_PATH = testManifestPath;
    if (fs.existsSync(testManifestPath)) {
      fs.unlinkSync(testManifestPath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testManifestPath)) {
      fs.unlinkSync(testManifestPath);
    }
    process.env = { ...originalEnv };
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    });
  });

  describe('documents-repository CRUD and Filtering', () => {
    it('saves a new document and retrieves it by id', async () => {
      const doc = await saveDocument({
        fileId: 'test-file-123',
        title: 'Acta Ordinaria N° 01-2026',
        category: 'actas',
        canton: 'Regional / Federación',
        documentDate: '2026-01-15',
        fileSize: 1048576,
        mimeType: 'application/pdf',
        originalName: 'acta_01.pdf',
        downloadUrl: 'https://example.com/download/123',
        relativeDownloadPath: '/api/v1/files/test-file-123/download',
        description: 'Primera sesión del año',
      });

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Acta Ordinaria N° 01-2026');
      expect(doc.category).toBe('actas');
      expect(doc.createdAt).toBeDefined();

      const retrieved = await getDocumentById(doc.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(doc.id);
      expect(retrieved?.description).toBe('Primera sesión del año');
    });

    it('filters documents by category, canton and search query', async () => {
      await saveDocument({
        fileId: 'file-1',
        title: 'Presupuesto Extraordinario Limón',
        category: 'presupuestos',
        canton: 'Limón',
        documentDate: '2026-02-10',
        fileSize: 50000,
        mimeType: 'application/pdf',
        originalName: 'presupuesto.pdf',
        downloadUrl: 'https://example.com/1',
        relativeDownloadPath: '/path/1',
      });

      await saveDocument({
        fileId: 'file-2',
        title: 'Convenio Marco Pococí - FEMUCARIBE',
        category: 'convenios',
        canton: 'Pococí',
        documentDate: '2026-03-01',
        fileSize: 80000,
        mimeType: 'application/pdf',
        originalName: 'convenio.pdf',
        downloadUrl: 'https://example.com/2',
        relativeDownloadPath: '/path/2',
      });

      // Filter by category
      const convenios = await getAllDocuments({ category: 'convenios' });
      expect(convenios).toHaveLength(1);
      expect(convenios[0]?.title).toContain('Convenio Marco');

      // Filter by canton
      const limonDocs = await getAllDocuments({ canton: 'Limón' });
      expect(limonDocs).toHaveLength(1);
      expect(limonDocs[0]?.canton).toBe('Limón');

      // Filter by query string
      const searchResults = await getAllDocuments({ query: 'extraordinario' });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0]?.title).toContain('Extraordinario');
    });

    it('deletes an existing document', async () => {
      const doc = await saveDocument({
        fileId: 'to-delete',
        title: 'Reglamento Interno',
        category: 'reglamentos',
        canton: 'Regional / Federación',
        documentDate: '2026-01-01',
        fileSize: 12000,
        mimeType: 'application/pdf',
        originalName: 'reglamento.pdf',
        downloadUrl: 'https://example.com/3',
        relativeDownloadPath: '/path/3',
      });

      const deleted = await deleteDocument(doc.id);
      expect(deleted).not.toBeNull();
      expect(deleted?.id).toBe(doc.id);

      const check = await getDocumentById(doc.id);
      expect(check).toBeNull();
    });
  });

  describe('storage-client config and health check', () => {
    it('reads storage configuration from environment', () => {
      process.env.FEMUCARIBE_STORAGE_ENDPOINT =
        'https://custom-tunnel.trycloudflare.com/';
      process.env.FEMUCARIBE_STORAGE_API_KEY = 'my-secret-key';

      const config = getStorageConfig();
      expect(config.endpoint).toBe('https://custom-tunnel.trycloudflare.com');
      expect(config.apiKey).toBe('my-secret-key');
    });

    it('returns offline status if endpoint is not configured', async () => {
      delete process.env.FEMUCARIBE_STORAGE_ENDPOINT;
      const status = await checkStorageHealth();
      expect(status.online).toBe(false);
      expect(status.status).toBe('offline');
      expect(status.error).toContain('no configurado');
    });
  });
});
