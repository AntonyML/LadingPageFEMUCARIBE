import { test, expect, type Page } from '@playwright/test';
import {
  saveDocument,
  deleteDocument,
} from '../../src/lib/documents-repository';

async function login(page: Page) {
  const response = await page.request.post('/api/auth/login', {
    data: { email: 'soporte@femucaribe.go.cr', password: 'XFSudF*L^pg@1' },
  });
  expect(response.status()).toBe(200);
  const { cookies } = await page.context().storageState();
  await page
    .context()
    .addCookies(cookies.map((cookie) => ({ ...cookie, secure: false })));
}

test.describe('Admin Documents Management (/admin/documentos)', () => {
  test.describe.configure({ mode: 'serial' });
  const seededDocIds: string[] = [];

  test.afterAll(async () => {
    for (const id of seededDocIds) {
      await deleteDocument(id);
    }
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('renders documents management interface with all key controls', async ({
    page,
  }) => {
    await page.goto('/admin/documentos');

    // Header & Titles
    await expect(page.locator('h1.header-title')).toContainText(
      'Documentos Institucionales',
    );
    await expect(page.locator('#storage-monitor')).toBeVisible();

    // Upload Form Controls
    await expect(page.locator('#dropzone')).toBeVisible();
    await expect(page.locator('#doc-title')).toBeVisible();
    await expect(page.locator('#doc-category')).toBeVisible();
    await expect(page.locator('#doc-canton')).toBeVisible();
    await expect(page.locator('#doc-date')).toBeVisible();
    await expect(page.locator('#btn-submit-doc')).toBeVisible();

    // Catalog & Filters
    await expect(page.locator('#search-filter')).toBeVisible();
    await expect(page.locator('#category-filter')).toBeVisible();
    await expect(page.locator('#canton-filter')).toBeVisible();
    await expect(page.locator('#documents-table')).toBeVisible();
  });

  test('validates upload form requires file selection', async ({ page }) => {
    await page.goto('/admin/documentos');

    // Fill metadata fields without file
    await page.fill('#doc-title', 'Acta de Prueba Sin Archivo');
    await page.selectOption('#doc-category', 'actas');

    // Click submit
    await page.click('#btn-submit-doc');

    // Status alert should show validation message
    const alertBox = page.locator('#upload-status');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('Debe seleccionar un archivo oficial');
  });

  test('filters catalog table by search text and category', async ({
    page,
  }) => {
    // Seed test documents into the repository
    const doc1 = await saveDocument({
      fileId: 'seed-acta-01',
      title: 'Acta Extraordinaria 01-2026',
      category: 'actas',
      canton: 'Regional / Federación',
      documentDate: '2026-02-15',
      fileSize: 102400,
      mimeType: 'application/pdf',
      originalName: 'acta_extra_01.pdf',
      downloadUrl: 'https://example.com/acta1.pdf',
      relativeDownloadPath: '/download/acta1',
    });

    const doc2 = await saveDocument({
      fileId: 'seed-convenio-02',
      title: 'Convenio Específico Talamanca',
      category: 'convenios',
      canton: 'Talamanca',
      documentDate: '2026-03-20',
      fileSize: 204800,
      mimeType: 'application/pdf',
      originalName: 'convenio_talamanca.pdf',
      downloadUrl: 'https://example.com/convenio2.pdf',
      relativeDownloadPath: '/download/convenio2',
    });
    seededDocIds.push(doc1.id, doc2.id);

    await page.goto('/admin/documentos');

    // Both seeded documents are visible initially
    await expect(page.locator(`tr[data-doc-id="${doc1.id}"]`)).toBeVisible();
    await expect(page.locator(`tr[data-doc-id="${doc2.id}"]`)).toBeVisible();

    // 1. Filter by search text
    await page.fill('#search-filter', 'Talamanca');
    await expect(page.locator(`tr[data-doc-id="${doc1.id}"]`)).toBeHidden();
    await expect(page.locator(`tr[data-doc-id="${doc2.id}"]`)).toBeVisible();

    // Clear search
    await page.fill('#search-filter', '');

    // 2. Filter by category
    await page.selectOption('#category-filter', 'actas');
    await expect(page.locator(`tr[data-doc-id="${doc1.id}"]`)).toBeVisible();
    await expect(page.locator(`tr[data-doc-id="${doc2.id}"]`)).toBeHidden();
  });

  test('opens delete confirmation modal and cancels deletion', async ({
    page,
  }) => {
    const doc = await saveDocument({
      fileId: 'seed-delete-cancel',
      title: 'Documento para Cancelar Borrado',
      category: 'reglamentos',
      canton: 'Limón',
      documentDate: '2026-01-10',
      fileSize: 50000,
      mimeType: 'application/pdf',
      originalName: 'reglamento.pdf',
      downloadUrl: 'https://example.com/cancel.pdf',
      relativeDownloadPath: '/download/cancel',
    });
    seededDocIds.push(doc.id);

    await page.goto('/admin/documentos');

    // Click delete button
    const deleteBtn = page.locator(
      `tr[data-doc-id="${doc.id}"] .btn-delete-doc`,
    );
    await deleteBtn.click();

    // Dialog appears with document title
    const dialog = page.locator('#delete-confirm-dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('#delete-target-title')).toContainText(
      'Documento para Cancelar Borrado',
    );

    // Cancel deletion
    await page.click('#btn-cancel-delete');
    await expect(dialog).toBeHidden();

    // Document is still present
    await expect(page.locator(`tr[data-doc-id="${doc.id}"]`)).toBeVisible();
  });

  test('confirms and deletes document from the catalog', async ({ page }) => {
    const doc = await saveDocument({
      fileId: 'seed-delete-confirm',
      title: 'Documento para Eliminar Definitivamente',
      category: 'otros',
      canton: 'Matina',
      documentDate: '2026-01-12',
      fileSize: 45000,
      mimeType: 'application/pdf',
      originalName: 'eliminar.pdf',
      downloadUrl: 'https://example.com/delete.pdf',
      relativeDownloadPath: '/download/delete',
    });
    seededDocIds.push(doc.id);

    await page.goto('/admin/documentos');

    // Click delete button
    const deleteBtn = page.locator(
      `tr[data-doc-id="${doc.id}"] .btn-delete-doc`,
    );
    await deleteBtn.click();

    // Confirm deletion
    const dialog = page.locator('#delete-confirm-dialog');
    await expect(dialog).toBeVisible();
    await page.click('#btn-confirm-delete');

    // Row is removed from table
    await expect(page.locator(`tr[data-doc-id="${doc.id}"]`)).toHaveCount(0);
  });
});
